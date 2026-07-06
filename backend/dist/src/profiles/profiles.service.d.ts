import { PrismaService } from '../prisma/prisma.service';
export declare class ProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    updatePatientProfile(userId: string, data: any): Promise<{
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
    }>;
    updateNurseProfile(userId: string, data: any): Promise<{
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
    }>;
    uploadCredential(userId: string, filename: string, type: string): Promise<{
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
    }>;
    getCredentials(userId: string): Promise<{
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
    }[]>;
    getNursePatients(nurseId: string): Promise<{
        id: string;
        clinical_status: import(".prisma/client").$Enums.ClinicalStatus;
        total_services: number;
        last_service_at: Date | null;
        last_service_name: string | null;
        patient: {
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
        } | null;
    }[]>;
}
