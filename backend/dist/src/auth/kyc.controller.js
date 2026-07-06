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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const multer_1 = require("multer");
const path_1 = require("path");
const storage = (0, multer_1.diskStorage)({
    destination: './uploads/kyc',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
    },
});
let KycController = class KycController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadKycDocuments(req, files) {
        const userId = req.user.userId;
        if (!files.professional_license || !files.degree_title) {
            throw new common_1.BadRequestException('Se requiere Cédula y Título');
        }
        const licenseFile = files.professional_license[0];
        const titleFile = files.degree_title[0];
        await this.prisma.$transaction(async (tx) => {
            await tx.nurseCredential.upsert({
                where: {
                    nurse_user_id_document_type: {
                        nurse_user_id: userId,
                        document_type: 'professional_license',
                    },
                },
                update: {
                    file_url: licenseFile.path,
                    review_status: 'pending',
                },
                create: {
                    nurse_user_id: userId,
                    document_type: 'professional_license',
                    file_url: licenseFile.path,
                    review_status: 'pending',
                },
            });
            await tx.nurseCredential.upsert({
                where: {
                    nurse_user_id_document_type: {
                        nurse_user_id: userId,
                        document_type: 'degree_title',
                    },
                },
                update: {
                    file_url: titleFile.path,
                    review_status: 'pending',
                },
                create: {
                    nurse_user_id: userId,
                    document_type: 'degree_title',
                    file_url: titleFile.path,
                    review_status: 'pending',
                },
            });
        });
        return { message: 'Documentos KYC subidos correctamente. Pendientes de revisión.' };
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'professional_license', maxCount: 1 },
        { name: 'degree_title', maxCount: 1 },
    ], { storage })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "uploadKycDocuments", null);
exports.KycController = KycController = __decorate([
    (0, common_1.Controller)('auth/kyc'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map