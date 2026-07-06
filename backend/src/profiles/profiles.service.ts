import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async updatePatientProfile(userId: string, data: any) {
    // Upsert to handle missing profile gracefully
    return this.prisma.patientProfile.upsert({
      where: { user_id: userId },
      update: {
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        gender: data.gender,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
      },
      create: {
        user_id: userId,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        gender: data.gender,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
      }
    });
  }

  async updateNurseProfile(userId: string, data: any) {
    return this.prisma.nurseProfile.upsert({
      where: { user_id: userId },
      update: {
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        professional_license: data.professional_license,
      },
      create: {
        user_id: userId,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        bio: data.bio,
        professional_license: data.professional_license || 'PENDING',
      }
    });
  }

  async uploadCredential(userId: string, filename: string, type: string) {
    const docType = type === 'title' ? 'degree_title' : 'professional_license';
    
    // Create or update credential
    return this.prisma.nurseCredential.upsert({
      where: { nurse_user_id_document_type: { nurse_user_id: userId, document_type: docType as any } },
      update: {
        file_url: `/uploads/${filename}`,
        review_status: 'pending'
      },
      create: {
        nurse_user_id: userId,
        document_type: docType as any,
        file_url: `/uploads/${filename}`,
        review_status: 'pending'
      }
    });
  }

  async getCredentials(userId: string) {
    return this.prisma.nurseCredential.findMany({
      where: { nurse_user_id: userId },
    });
  }

  async getNursePatients(nurseId: string) {
    const relations = await this.prisma.nursePatientRelationship.findMany({
      where: { nurse_user_id: nurseId },
      include: {
        patient: {
          include: {
            patient_profile: true,
          },
        },
      },
      orderBy: { last_service_at: 'desc' },
    });

    return relations.map((r) => ({
      id: r.patient_user_id,
      clinical_status: r.clinical_status,
      total_services: r.total_services,
      last_service_at: r.last_service_at,
      last_service_name: r.last_service_name,
      patient: r.patient,
      profile: r.patient.patient_profile,
    }));
  }
}
