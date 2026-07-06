import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Configuración básica de Multer para almacenamiento local
const storage = diskStorage({
  destination: './uploads/kyc',
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('auth/kyc')
export class KycController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'professional_license', maxCount: 1 },
      { name: 'degree_title', maxCount: 1 },
    ], { storage }),
  )
  async uploadKycDocuments(
    @Req() req: any,
    @UploadedFiles()
    files: {
      professional_license?: any[];
      degree_title?: any[];
    },
  ) {
    const userId = req.user.userId;

    if (!files.professional_license || !files.degree_title) {
      throw new BadRequestException('Se requiere Cédula y Título');
    }

    const licenseFile = files.professional_license[0];
    const titleFile = files.degree_title[0];

    await this.prisma.$transaction(async (tx) => {
      // Upsert Cédula
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

      // Upsert Título
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
}
