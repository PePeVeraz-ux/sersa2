import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterPatientDto, RegisterNurseDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async registerPatient(dto: RegisterPatientDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email ya registrado');

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

  async registerNurse(dto: RegisterNurseDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email ya registrado');

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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
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

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async getProfile(userId: string) {
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
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password_hash) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw new BadRequestException('La contraseña actual es incorrecta');

    if (newPassword.length < 8) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 8 caracteres');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });
    return { message: 'Contraseña actualizada correctamente' };
  }
}
