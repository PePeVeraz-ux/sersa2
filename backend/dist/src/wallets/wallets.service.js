"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WalletsService = class WalletsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNurseWallet(nurseId) {
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
    async requestWithdrawal(nurseId, data) {
        const amount = Number(data.amount);
        if (!amount || amount < 100) {
            throw new common_1.BadRequestException('El monto mínimo de retiro es $100 MXN');
        }
        if (!/^\d{18}$/.test(data.clabe)) {
            throw new common_1.BadRequestException('CLABE interbancaria inválida (18 dígitos)');
        }
        const wallet = await this.getNurseWallet(nurseId);
        if (Number(wallet.balance) < amount) {
            throw new common_1.BadRequestException('Saldo insuficiente');
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
            await tx.withdrawalRequest.update({
                where: { id: withdrawal.id },
                data: { status: 'completed', processed_at: new Date() },
            });
            return { withdrawal, newBalance };
        });
    }
    async getPatientPayments(patientId) {
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
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map