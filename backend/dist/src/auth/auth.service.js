"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    jwtService;
    prisma;
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async registerPatient(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email ya registrado');
        const hashedPassword = await this.hashPassword(dto.password);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password_hash: hashedPassword,
                    role: 'patient',
                    status: 'active',
                    phone: dto.phone,
                },
            });
            const profile = await tx.patientProfile.create({
                data: {
                    user_id: user.id,
                    first_name: dto.firstName,
                    last_name: dto.lastName,
                    second_last_name: dto.secondLastName,
                    date_of_birth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                    gender: dto.gender,
                },
            });
            return { user: { id: user.id, email: user.email, role: user.role }, profile };
        });
    }
    async registerNurse(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email ya registrado');
        const hashedPassword = await this.hashPassword(dto.password);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password_hash: hashedPassword,
                    role: 'nurse',
                    phone: dto.phone,
                },
            });
            const wallet = await tx.nurseWallet.create({
                data: {
                    nurse_user_id: user.id,
                }
            });
            const profile = await tx.nurseProfile.create({
                data: {
                    user_id: user.id,
                    first_name: dto.firstName,
                    last_name: dto.lastName,
                    second_last_name: dto.secondLastName,
                    professional_license: dto.professionalLicense,
                    license_state: dto.licenseState,
                    wallet_id: wallet.id,
                },
            });
            return { user: { id: user.id, email: user.email, role: user.role }, profile };
        });
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.password_hash) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password_hash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status
            }
        };
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                phone: true,
                profile_photo_url: true,
                patient_profile: true,
                nurse_profile: true,
                admin_profile: true,
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        return user;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.password_hash)
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch)
            throw new common_1.BadRequestException('La contraseña actual es incorrecta');
        if (newPassword.length < 8) {
            throw new common_1.BadRequestException('La nueva contraseña debe tener al menos 8 caracteres');
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedPassword },
        });
        return { message: 'Contraseña actualizada correctamente' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map