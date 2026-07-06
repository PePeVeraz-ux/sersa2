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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async approveNurse(nurseId) {
        return this.prisma.user.update({
            where: { id: nurseId },
            data: { status: 'active' },
            include: { nurse_profile: true },
        });
    }
    async rejectNurse(nurseId, reason) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map