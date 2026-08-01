import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) { }

  private async attachAddressCoordinates<T extends { address?: { id: string; street_line1?: string; neighborhood?: string | null; city?: string } | null }>(
    items: T[],
  ): Promise<T[]> {
    const addressIds = [...new Set(items.map((item) => item.address?.id).filter(Boolean))] as string[];
    if (addressIds.length === 0) return items;

    const rows = await this.prisma.$queryRaw<Array<{ id: string; lat: number; lng: number }>>`
      SELECT id, ST_Y(location::geometry)::float8 AS lat, ST_X(location::geometry)::float8 AS lng
      FROM addresses
      WHERE id IN (${Prisma.join(addressIds)})
    `;
    const coordsById = Object.fromEntries(rows.map((row) => [row.id, { lat: row.lat, lng: row.lng }]));

    const resultItems: T[] = [];

    for (const item of items) {
      if (!item.address?.id) {
        resultItems.push(item);
        continue;
      }

      let lat = coordsById[item.address.id]?.lat;
      let lng = coordsById[item.address.id]?.lng;

      // Check if coordinates are dummy (Mexico City) or null/undefined
      const isDummy = lat === undefined || lng === undefined ||
        (Math.abs(lat - 19.4326) < 0.001 && Math.abs(lng - (-99.1332)) < 0.001);

      if (isDummy) {
        const addressText = `${item.address.street_line1}, ${item.address.neighborhood || ''}, ${item.address.city}, Mexico`;
        console.log(`Geocoding dummy address on-the-fly: "${addressText}"`);

        let geocodedLat = 32.5149; // Default to Tijuana Center
        let geocodedLng = -117.0382;
        let success = false;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'SersaAppGeocoder/1.0' }
          });
          const results = await res.json();
          if (results && results.length > 0) {
            geocodedLat = parseFloat(results[0].lat);
            geocodedLng = parseFloat(results[0].lon);
            success = true;
          } else {
            // Broad search
            const broadText = `${item.address.neighborhood || ''}, ${item.address.city}, Mexico`;
            const resBroad = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(broadText)}&format=json&limit=1`, {
              headers: { 'User-Agent': 'SersaAppGeocoder/1.0' }
            });
            const resultsBroad = await resBroad.json();
            if (resultsBroad && resultsBroad.length > 0) {
              geocodedLat = parseFloat(resultsBroad[0].lat);
              geocodedLng = parseFloat(resultsBroad[0].lon);
              success = true;
            }
          }
        } catch (e) {
          console.error('On-the-fly geocoding failed:', e);
        }

        lat = geocodedLat;
        lng = geocodedLng;

        if (success) {
          try {
            const wkt = `POINT(${lng} ${lat})`;
            await this.prisma.$executeRaw`
              UPDATE addresses
              SET location = ST_GeomFromText(${wkt}, 4326), updated_at = NOW()
              WHERE id = ${item.address.id}
            `;
            console.log(`Updated address DB coords for id ${item.address.id} to: ${lat}, ${lng}`);
          } catch (e) {
            console.error('Failed to save geocoded coordinates to DB:', e);
          }
        }
      }

      resultItems.push({
        ...item,
        address: { ...item.address, lat, lng },
      });
    }

    return resultItems;
  }

  async createRequest(patientId: string, data: any) {
    const service = await this.prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) throw new NotFoundException('Servicio no encontrado');

    const address = await this.prisma.address.findUnique({
      where: { id: data.addressId },
    });

    if (!address || address.user_id !== patientId) {
      throw new BadRequestException('Dirección inválida');
    }

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.serviceRequest.create({
        data: {
          patient_user_id: patientId,
          address_id: data.addressId,
          request_type: data.scheduledDate ? 'scheduled' : 'immediate',
          scheduled_start_at: data.scheduledDate ? new Date(data.scheduledDate) : null,
          status: 'draft',
          subtotal_amount: service.base_price,
          total_amount: service.base_price,
          patient_notes: data.notes,
        },
      });

      await tx.serviceRequestItem.create({
        data: {
          service_request_id: request.id,
          service_id: service.id,
          unit_price: service.base_price,
          line_total: service.base_price,
          quantity: 1,
        },
      });

      const published = await tx.serviceRequest.update({
        where: { id: request.id },
        data: {
          status: 'published',
          published_at: new Date(),
        },
        include: {
          items: { include: { service: true } },
          address: true,
        },
      });

      await tx.serviceRequestStatusHistory.create({
        data: {
          service_request_id: request.id,
          from_status: 'draft',
          to_status: 'published',
          changed_by: patientId,
          change_source: 'patient',
        },
      });

      return published;
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.serviceRequest.findMany({
      where: { patient_user_id: userId },
      include: {
        items: { include: { service: true } },
        address: true,
        assigned_nurse: { include: { nurse_profile: true } },
        clinical_report: { include: { vital_signs_records: true } },
        payments: { where: { status: 'completed' }, take: 1 },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAvailableRequests() {
    const requests = await this.prisma.serviceRequest.findMany({
      where: { status: 'published', assigned_nurse_id: null },
      include: {
        items: { include: { service: true } },
        address: true,
        patient: { include: { patient_profile: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return this.attachAddressCoordinates(requests);
  }

  async acceptRequest(requestId: string, nurseId: string) {
    const nurse = await this.prisma.user.findUnique({ where: { id: nurseId } });
    if (!nurse || nurse.role !== 'nurse' || nurse.status !== 'active') {
      throw new BadRequestException('Tu cuenta de enfermero no está activa para aceptar servicios');
    }

    const request = await this.prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'published') {
      throw new BadRequestException('La solicitud no está disponible o ya fue aceptada');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.serviceRequest.update({
        where: { id: requestId },
        data: {
          assigned_nurse_id: nurseId,
          status: 'accepted',
          accepted_at: new Date(),
        },
        include: {
          items: { include: { service: true } },
          address: true,
          patient: { include: { patient_profile: true } },
        },
      });

      await tx.serviceRequestStatusHistory.create({
        data: {
          service_request_id: requestId,
          from_status: 'published',
          to_status: 'accepted',
          changed_by: nurseId,
          change_source: 'nurse',
        },
      });

      await tx.conversation.create({
        data: { service_request_id: requestId },
      });

      const serviceName = updated.items[0]?.service?.name || 'Servicio';
      await tx.nursePatientRelationship.upsert({
        where: {
          nurse_user_id_patient_user_id: {
            nurse_user_id: nurseId,
            patient_user_id: request.patient_user_id,
          },
        },
        update: {
          total_services: { increment: 1 },
          last_service_at: new Date(),
          last_service_name: serviceName,
        },
        create: {
          nurse_user_id: nurseId,
          patient_user_id: request.patient_user_id,
          total_services: 1,
          last_service_at: new Date(),
          last_service_name: serviceName,
        },
      });

      return updated;
    });
  }

  async getMySchedule(nurseId: string) {
    return this.prisma.serviceRequest.findMany({
      where: {
        assigned_nurse_id: nurseId,
        status: { notIn: ['completed', 'cancelled'] },
      },
      include: {
        items: { include: { service: true } },
        address: true,
        patient: { include: { patient_profile: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async getNurseRequests(nurseId: string) {
    return this.prisma.serviceRequest.findMany({
      where: {
        assigned_nurse_id: nurseId,
      },
      include: {
        items: { include: { service: true } },
        address: true,
        patient: { include: { patient_profile: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateStatus(requestId: string, nurseId: string, status: string) {
    const validStatuses = ['en_camino', 'arrived', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Estado no válido');
    }

    const request = await this.prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request || request.assigned_nurse_id !== nurseId) {
      throw new BadRequestException('No tienes permiso para actualizar esta solicitud');
    }

    const data: Record<string, unknown> = { status };
    if (status === 'in_progress') data.started_at = new Date();
    if (status === 'completed') data.completed_at = new Date();

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.serviceRequest.update({
        where: { id: requestId },
        data,
      });

      await tx.serviceRequestStatusHistory.create({
        data: {
          service_request_id: requestId,
          from_status: request.status,
          to_status: status,
          changed_by: nurseId,
          change_source: 'nurse',
        },
      });

      return updated;
    });
  }

  async cancelRequest(requestId: string, userId: string, reason?: string) {
    const request = await this.prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    const isPatient = request.patient_user_id === userId;
    const isAssignedNurse = request.assigned_nurse_id === userId;
    if (!isPatient && !isAssignedNurse) {
      throw new BadRequestException('No tienes permiso para cancelar esta solicitud');
    }

    if (['completed', 'cancelled'].includes(request.status)) {
      throw new BadRequestException('Esta solicitud ya no puede cancelarse');
    }

    if (isPatient && request.assigned_nurse_id) {
      throw new BadRequestException('No puedes cancelar una solicitud ya aceptada por un enfermero');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.serviceRequest.update({
        where: { id: requestId },
        data: {
          status: 'cancelled',
          cancelled_at: new Date(),
          cancellation_reason: reason || 'Cancelado por el usuario',
        },
      });

      await tx.serviceRequestStatusHistory.create({
        data: {
          service_request_id: requestId,
          from_status: request.status,
          to_status: 'cancelled',
          changed_by: userId,
          change_source: isPatient ? 'patient' : 'nurse',
          notes: reason,
        },
      });

      return updated;
    });
  }

  async getNurseStats(nurseId: string) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [weekAppointments, activePatients, completedThisWeek, wallet] = await Promise.all([
      this.prisma.serviceRequest.count({
        where: {
          assigned_nurse_id: nurseId,
          created_at: { gte: weekAgo },
        },
      }),
      this.prisma.nursePatientRelationship.count({
        where: { nurse_user_id: nurseId },
      }),
      this.prisma.serviceRequest.findMany({
        where: {
          assigned_nurse_id: nurseId,
          status: 'completed',
          completed_at: { gte: weekAgo },
        },
        include: { items: { include: { service: true } } },
      }),
      this.prisma.nurseWallet.findUnique({ where: { nurse_user_id: nurseId } }),
    ]);

    const hoursWorked = completedThisWeek.reduce((sum, r) => {
      const mins = r.items[0]?.service?.estimated_duration_min || 30;
      return sum + mins / 60;
    }, 0);

    const monthEarnings = await this.prisma.walletTransaction.aggregate({
      where: {
        wallet: { nurse_user_id: nurseId },
        transaction_type: 'service_income',
        created_at: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    return {
      weekAppointments,
      activePatients,
      hoursWorked: Math.round(hoursWorked * 10) / 10,
      monthEarnings: Number(monthEarnings._sum.amount || 0),
      walletBalance: Number(wallet?.balance || 0),
    };
  }

  async getTodayRoute(nurseId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stops = await this.prisma.serviceRequest.findMany({
      where: {
        assigned_nurse_id: nurseId,
        status: { in: ['accepted', 'en_camino', 'arrived', 'in_progress'] },
        OR: [
          { scheduled_start_at: { gte: today, lt: tomorrow } },
          { scheduled_start_at: null, created_at: { gte: today } },
          { status: { in: ['accepted', 'en_camino', 'arrived', 'in_progress'] } },
        ],
      },
      include: {
        items: { include: { service: true } },
        address: true,
        patient: { include: { patient_profile: true } },
      },
      orderBy: [{ scheduled_start_at: 'asc' }, { created_at: 'asc' }],
    });

    const stopsWithCoords = await this.attachAddressCoordinates(stops);

    return {
      stops: stopsWithCoords,
      totalStops: stopsWithCoords.length,
      totalEarnings: stopsWithCoords.reduce((s, r) => s + Number(r.total_amount), 0),
    };
  }
}
