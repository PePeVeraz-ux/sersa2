import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPatientDto, RegisterNurseDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    registerPatient(dto: RegisterPatientDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        profile: {
            user_id: string;
            first_name: string;
            last_name: string;
            second_last_name: string | null;
            date_of_birth: Date | null;
            gender: string | null;
            emergency_contact_name: string | null;
            emergency_contact_phone: string | null;
            medical_notes: string | null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    registerNurse(dto: RegisterNurseDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        profile: {
            user_id: string;
            first_name: string;
            last_name: string;
            second_last_name: string | null;
            professional_license: string;
            license_state: string | null;
            bio: string | null;
            years_experience: number | null;
            is_available: boolean;
            average_rating: import("@prisma/client/runtime/library").Decimal | null;
            total_services: number;
            wallet_id: string | null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    hashPassword(password: string): Promise<string>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        phone: string | null;
        profile_photo_url: string | null;
        patient_profile: {
            user_id: string;
            first_name: string;
            last_name: string;
            second_last_name: string | null;
            date_of_birth: Date | null;
            gender: string | null;
            emergency_contact_name: string | null;
            emergency_contact_phone: string | null;
            medical_notes: string | null;
            created_at: Date;
            updated_at: Date;
        } | null;
        nurse_profile: {
            user_id: string;
            first_name: string;
            last_name: string;
            second_last_name: string | null;
            professional_license: string;
            license_state: string | null;
            bio: string | null;
            years_experience: number | null;
            is_available: boolean;
            average_rating: import("@prisma/client/runtime/library").Decimal | null;
            total_services: number;
            wallet_id: string | null;
            created_at: Date;
            updated_at: Date;
        } | null;
        admin_profile: {
            user_id: string;
            first_name: string;
            last_name: string;
            department: string | null;
            created_at: Date;
        } | null;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
