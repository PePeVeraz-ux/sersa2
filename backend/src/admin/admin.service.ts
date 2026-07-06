import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalPatients = await this.prisma.user.count({ where: { role: 'patient' } });
    const totalNurses = await this.prisma.user.count({ where: { role: 'nurse' } });
    
    const activeRequests = await this.prisma.serviceRequest.count({
      where: {
        status: { notIn: ['completed', 'cancelled', 'draft'] }
      }
    });

    const revenueResult = await this.prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true, platform_fee: true }
    });

    return {
      totalUsers,
      totalPatients,
      totalNurses,
      activeRequests,
      totalRevenue: revenueResult._sum.amount || 0,
      totalPlatformFees: revenueResult._sum.platform_fee || 0
    };
  }

  async getPendingNurses() {
    return this.prisma.user.findMany({
      where: {
        role: 'nurse',
        status: 'pending_verification'
      },
      include: {
        nurse_profile: true,
        credentials: true
      }
    });
  }

  async approveNurse(nurseId: string) {
    return this.prisma.user.update({
      where: { id: nurseId },
      data: { status: 'active' },
      include: { nurse_profile: true },
    });
  }

  async rejectNurse(nurseId: string, reason?: string) {
    await this.prisma.nurseCredential.updateMany({
      where: { nurse_user_id: nurseId, review_status: 'pending' },
      data: { review_status: 'rejected', rejection_reason: reason || 'Documentación no válida' },
    });
    return this.prisma.user.update({
      where: { id: nurseId },
      data: { status: 'rejected' },
    });
  }

  async getPatients() {
    return this.prisma.user.findMany({
      where: { role: 'patient', deleted_at: null },
      include: {
        patient_profile: true,
        patient_requests: {
          take: 1,
          orderBy: { created_at: 'desc' },
          select: { id: true, status: true, created_at: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
