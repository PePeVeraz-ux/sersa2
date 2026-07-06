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
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProfilesService = class ProfilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updatePatientProfile(userId, data) {
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
    async updateNurseProfile(userId, data) {
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
    async uploadCredential(userId, filename, type) {
        const docType = type === 'title' ? 'degree_title' : 'professional_license';
        return this.prisma.nurseCredential.upsert({
            where: { nurse_user_id_document_type: { nurse_user_id: userId, document_type: docType } },
            update: {
                file_url: `/uploads/${filename}`,
                review_status: 'pending'
            },
            create: {
                nurse_user_id: userId,
                document_type: docType,
                file_url: `/uploads/${filename}`,
                review_status: 'pending'
            }
        });
    }
    async getCredentials(userId) {
        return this.prisma.nurseCredential.findMany({
            where: { nurse_user_id: userId },
        });
    }
    async getNursePatients(nurseId) {
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
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map