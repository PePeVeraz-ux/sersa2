import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOrCreateConversation(serviceRequestId: string): Promise<{
        service_request: {
            patient: {
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
            assigned_nurse: {
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
            } | null;
        } & {
            id: string;
            patient_user_id: string;
            assigned_nurse_id: string | null;
            address_id: string;
            operational_zone_id: string | null;
            request_type: import(".prisma/client").$Enums.RequestType;
            status: import(".prisma/client").$Enums.RequestStatus;
            scheduled_start_at: Date | null;
            scheduled_end_at: Date | null;
            published_at: Date | null;
            accepted_at: Date | null;
            started_at: Date | null;
            completed_at: Date | null;
            cancelled_at: Date | null;
            cancellation_reason: string | null;
            patient_notes: string | null;
            subtotal_amount: import("@prisma/client/runtime/library").Decimal;
            surcharge_amount: import("@prisma/client/runtime/library").Decimal;
            total_amount: import("@prisma/client/runtime/library").Decimal;
            currency_code: string;
            created_at: Date;
            updated_at: Date;
        };
    } & {
        id: string;
        service_request_id: string;
        created_at: Date;
        closed_at: Date | null;
    }>;
    saveMessage(conversationId: string, senderId: string, body: string): Promise<{
        sender: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        conversation_id: string;
        sender_id: string;
        message_type: import(".prisma/client").$Enums.MessageType;
        body: string | null;
        attachment_url: string | null;
        created_at: Date;
        deleted_at: Date | null;
    }>;
    getMessages(conversationId: string): Promise<({
        sender: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        conversation_id: string;
        sender_id: string;
        message_type: import(".prisma/client").$Enums.MessageType;
        body: string | null;
        attachment_url: string | null;
        created_at: Date;
        deleted_at: Date | null;
    })[]>;
    createNotification(userId: string, title: string, body: string, payload?: any): Promise<{
        id: string;
        user_id: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        title: string;
        body: string;
        payload: import(".prisma/client").Prisma.JsonValue | null;
        read_at: Date | null;
        sent_at: Date | null;
        created_at: Date;
    }>;
    getUserNotifications(userId: string): Promise<{
        id: string;
        user_id: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        title: string;
        body: string;
        payload: import(".prisma/client").Prisma.JsonValue | null;
        read_at: Date | null;
        sent_at: Date | null;
        created_at: Date;
    }[]>;
    markNotificationsAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
