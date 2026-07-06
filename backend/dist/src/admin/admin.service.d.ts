import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalPatients: number;
        totalNurses: number;
        activeRequests: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        totalPlatformFees: number | import("@prisma/client/runtime/library").Decimal;
    }>;
    getPendingNurses(): Promise<({
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
        credentials: {
            id: string;
            nurse_user_id: string;
            document_type: import(".prisma/client").$Enums.DocumentType;
            file_url: string;
            file_hash: string | null;
            issued_at: Date | null;
            expires_at: Date | null;
            review_status: import(".prisma/client").$Enums.ReviewStatus;
            reviewed_by: string | null;
            reviewed_at: Date | null;
            rejection_reason: string | null;
            created_at: Date;
        }[];
    } & {
        id: string;
        email: string;
        password_hash: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        phone: string | null;
        phone_verified_at: Date | null;
        email_verified_at: Date | null;
        last_login_at: Date | null;
        profile_photo_url: string | null;
        preferred_locale: string;
        timezone: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    })[]>;
    approveNurse(nurseId: string): Promise<{
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
    } & {
        id: string;
        email: string;
        password_hash: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        phone: string | null;
        phone_verified_at: Date | null;
        email_verified_at: Date | null;
        last_login_at: Date | null;
        profile_photo_url: string | null;
        preferred_locale: string;
        timezone: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
    rejectNurse(nurseId: string, reason?: string): Promise<{
        id: string;
        email: string;
        password_hash: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        phone: string | null;
        phone_verified_at: Date | null;
        email_verified_at: Date | null;
        last_login_at: Date | null;
        profile_photo_url: string | null;
        preferred_locale: string;
        timezone: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
    getPatients(): Promise<({
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
        patient_requests: {
            id: string;
            created_at: Date;
            status: import(".prisma/client").$Enums.RequestStatus;
        }[];
    } & {
        id: string;
        email: string;
        password_hash: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        phone: string | null;
        phone_verified_at: Date | null;
        email_verified_at: Date | null;
        last_login_at: Date | null;
        profile_photo_url: string | null;
        preferred_locale: string;
        timezone: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    })[]>;
}
