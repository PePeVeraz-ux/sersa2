import { PrismaService } from '../prisma/prisma.service';
export declare class KycController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    uploadKycDocuments(req: any, files: {
        professional_license?: any[];
        degree_title?: any[];
    }): Promise<{
        message: string;
    }>;
}
