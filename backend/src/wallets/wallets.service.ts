import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async getNurseWallet(nurseId: string) {
    const wallet = await this.prisma.nurseWallet.findUnique({
      where: { nurse_user_id: nurseId },
      include: {
        transactions: {
          orderBy: { created_at: 'desc' },
          include: {
            service_request: {
              include: {
                items: { include: { service: true } },
              },
            },
          },
        },
      },
    });

    if (!wallet) {
      return this.prisma.nurseWallet.create({
        data: { nurse_user_id: nurseId },
        include: { transactions: true },
      });
    }

    return wallet;
  }

  async requestWithdrawal(
    nurseId: string,
    data: { amount: number; clabe: string; bankName?: string },
  ) {
    const amount = Number(data.amount);
    if (!amount || amount < 100) {
      throw new BadRequestException('El monto mínimo de retiro es $100 MXN');
    }

    if (!/^\d{18}$/.test(data.clabe)) {
      throw new BadRequestException('CLABE interbancaria inválida (18 dígitos)');
    }

    const wallet = await this.getNurseWallet(nurseId);
    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('Saldo insuficiente');
    }

    return this.prisma.$transaction(async (tx) => {
      let payoutMethod = await tx.nursePayoutMethod.findFirst({
        where: { nurse_user_id: nurseId, clabe_masked: `****${data.clabe.slice(-4)}`, deleted_at: null },
      });

      if (!payoutMethod) {
        payoutMethod = await tx.nursePayoutMethod.create({
          data: {
            nurse_user_id: nurseId,
            method_type: 'bank_account',
            bank_name: data.bankName || 'Banco',
            clabe_masked: `****${data.clabe.slice(-4)}`,
            account_last_four: data.clabe.slice(-4),
            is_primary: true,
          },
        });
      }

      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          wallet_id: wallet.id,
          payout_method_id: payoutMethod.id,
          amount,
          status: 'processing',
        },
      });

      const newBalance = Number(wallet.balance) - amount;
      await tx.nurseWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.walletTransaction.create({
        data: {
          wallet_id: wallet.id,
          transaction_type: 'withdrawal',
          amount: -amount,
          balance_after: newBalance,
          description: `Retiro a CLABE ****${data.clabe.slice(-4)}`,
          status: 'processing',
        },
      });

      // Demo: auto-complete withdrawal after creation
      await tx.withdrawalRequest.update({
        where: { id: withdrawal.id },
        data: { status: 'completed', processed_at: new Date() },
      });

      return { withdrawal, newBalance };
    });
  }

  async getPatientPayments(patientId: string) {
    return this.prisma.payment.findMany({
      where: { patient_user_id: patientId },
      include: {
        service_request: {
          include: {
            items: { include: { service: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
