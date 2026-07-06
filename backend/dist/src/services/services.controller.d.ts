import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    getCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        sort_order: number;
        is_active: boolean;
        created_at: Date;
    }[]>;
    getServices(): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            sort_order: number;
            is_active: boolean;
            created_at: Date;
        };
    } & {
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
    })[]>;
    getServicesByCategory(id: string): Promise<{
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
    }[]>;
}
