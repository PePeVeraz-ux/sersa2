import { PrismaService } from '../prisma/prisma.service';
export declare class WalletsService {
    private prisma;
    constructor(prisma: PrismaService);
    getNurseWallet(nurseId: string): Promise<{
        transactions: {
            id: string;
            wallet_id: string;
            payment_id: string | null;
            service_request_id: string | null;
            transaction_type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            balance_after: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            status: import(".prisma/client").$Enums.PaymentStatus;
            created_at: Date;
        }[];
    } & {
        id: string;
        nurse_user_id: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        pending_balance: import("@prisma/client/runtime/library").Decimal;
        currency_code: string;
        updated_at: Date;
    }>;
    requestWithdrawal(nurseId: string, data: {
        amount: number;
        clabe: string;
        bankName?: string;
    }): Promise<{
        withdrawal: {
            id: string;
            wallet_id: string;
            payout_method_id: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.WithdrawalStatus;
            provider_payout_id: string | null;
            processed_at: Date | null;
            created_at: Date;
        };
        newBalance: number;
    }>;
    getPatientPayments(patientId: string): Promise<({
        service_request: {
            items: ({
                service: {
                    id: string;
                    category_id: string;
                    name: string;
                    slug: string;
                    description: string;
                    base_price: import("@prisma/client/runtime/library").Decimal;
                    estimated_duration_min: number;
                    icon_key: string | null;
                    requires_prescription: boolean;
                    is_active: boolean;
                    created_at: Date;
                    updated_at: Date;
                };
            } & {
                id: string;
                service_request_id: string;
                service_id: string;
                quantity: number;
                unit_price: import("@prisma/client/runtime/library").Decimal;
                line_total: import("@prisma/client/runtime/library").Decimal;
                pricing_rule_id: string | null;
                created_at: Date;
            })[];
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
        patient_user_id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        platform_fee: import("@prisma/client/runtime/library").Decimal;
        nurse_net_amount: import("@prisma/client/runtime/library").Decimal;
        currency_code: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        provider: string;
        provider_payment_id: string | null;
        provider_payload: import(".prisma/client").Prisma.JsonValue | null;
        paid_at: Date | null;
        created_at: Date;
        updated_at: Date;
    })[]>;
}
