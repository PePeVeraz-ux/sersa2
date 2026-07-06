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
exports.ClinicalReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClinicalReportsService = class ClinicalReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReport(nurseId, data) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: data.serviceRequestId }
        });
        if (!request || request.assigned_nurse_id !== nurseId) {
            throw new common_1.BadRequestException('Solicitud inválida o no asignada a ti');
        }
        if (request.status === 'completed') {
            throw new common_1.BadRequestException('Esta solicitud ya ha sido completada');
        }
        return this.prisma.$transaction(async (tx) => {
            const report = await tx.clinicalReport.create({
                data: {
                    service_request_id: data.serviceRequestId,
                    nurse_user_id: nurseId,
                    observations: data.observations,
                    wound_status: data.woundStatus,
                    procedures_done: data.proceduresDone,
                    recommendations: data.recommendations,
                }
            });
            if (data.vitalSigns) {
                await tx.vitalSignsRecord.create({
                    data: {
                        clinical_report_id: report.id,
                        blood_pressure_sys: data.vitalSigns.blood_pressure_sys ? Number(data.vitalSigns.blood_pressure_sys) : null,
                        blood_pressure_dia: data.vitalSigns.blood_pressure_dia ? Number(data.vitalSigns.blood_pressure_dia) : null,
                        heart_rate_bpm: data.vitalSigns.heart_rate_bpm ? Number(data.vitalSigns.heart_rate_bpm) : null,
                        temperature_c: data.vitalSigns.temperature_c ? Number(data.vitalSigns.temperature_c) : null,
                        glucose_mg_dl: data.vitalSigns.glucose_mg_dl ? Number(data.vitalSigns.glucose_mg_dl) : null,
                        oxygen_saturation: data.vitalSigns.oxygen_saturation ? Number(data.vitalSigns.oxygen_saturation) : null,
                        respiratory_rate: data.vitalSigns.respiratory_rate ? Number(data.vitalSigns.respiratory_rate) : null,
                    }
                });
            }
            await tx.serviceRequest.update({
                where: { id: data.serviceRequestId },
                data: {
                    status: 'completed',
                    completed_at: new Date(),
                },
            });
            if (data.signatureImageUrl) {
                await tx.digitalSignature.create({
                    data: {
                        service_request_id: data.serviceRequestId,
                        signed_by_user_id: request.patient_user_id,
                        signature_image_url: data.signatureImageUrl,
                    },
                });
            }
            const totalAmount = Number(request.total_amount) || 0;
            const commissionPct = 15;
            const platformFee = totalAmount * (commissionPct / 100);
            const nurseNetAmount = totalAmount - platformFee;
            const payment = await tx.payment.create({
                data: {
                    service_request_id: request.id,
                    patient_user_id: request.patient_user_id,
                    amount: totalAmount,
                    platform_fee: platformFee,
                    nurse_net_amount: nurseNetAmount,
                    status: 'completed',
                    paid_at: new Date()
                }
            });
            let wallet = await tx.nurseWallet.findUnique({
                where: { nurse_user_id: nurseId }
            });
            if (!wallet) {
                wallet = await tx.nurseWallet.create({ data: { nurse_user_id: nurseId } });
            }
            const balanceAfterIncome = Number(wallet.balance) + totalAmount;
            await tx.walletTransaction.create({
                data: {
                    wallet_id: wallet.id,
                    payment_id: payment.id,
                    service_request_id: request.id,
                    transaction_type: 'service_income',
                    amount: totalAmount,
                    balance_after: balanceAfterIncome,
                    description: `Ingreso por servicio ${request.id.slice(-6)}`
                }
            });
            const finalBalance = balanceAfterIncome - platformFee;
            await tx.walletTransaction.create({
                data: {
                    wallet_id: wallet.id,
                    payment_id: payment.id,
                    service_request_id: request.id,
                    transaction_type: 'platform_commission',
                    amount: -platformFee,
                    balance_after: finalBalance,
                    description: `Comisión de plataforma (${commissionPct}%)`
                }
            });
            await tx.nurseWallet.update({
                where: { id: wallet.id },
                data: { balance: finalBalance }
            });
            return report;
        });
    }
    async getNurseReports(nurseId) {
        return this.prisma.clinicalReport.findMany({
            where: { nurse_user_id: nurseId },
            include: {
                service_request: {
                    include: {
                        patient: { include: { patient_profile: true } },
                        items: { include: { service: true } },
                    },
                },
                vital_signs_records: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getReportByRequest(requestId, userId) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Solicitud no encontrada');
        const isPatient = request.patient_user_id === userId;
        const isNurse = request.assigned_nurse_id === userId;
        if (!isPatient && !isNurse) {
            throw new common_1.ForbiddenException('No tienes acceso a este reporte');
        }
        const report = await this.prisma.clinicalReport.findUnique({
            where: { service_request_id: requestId },
            include: {
                vital_signs_records: true,
                service_request: {
                    include: {
                        items: { include: { service: true } },
                        address: true,
                        assigned_nurse: { include: { nurse_profile: true } },
                    },
                },
            },
        });
        if (!report)
            throw new common_1.NotFoundException('Reporte no encontrado');
        return report;
    }
};
exports.ClinicalReportsService = ClinicalReportsService;
exports.ClinicalReportsService = ClinicalReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClinicalReportsService);
//# sourceMappingURL=clinical-reports.service.js.map