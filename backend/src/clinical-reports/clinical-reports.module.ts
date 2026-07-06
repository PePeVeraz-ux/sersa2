import { Module } from '@nestjs/common';
import { ClinicalReportsService } from './clinical-reports.service';
import { ClinicalReportsController } from './clinical-reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ClinicalReportsService],
  controllers: [ClinicalReportsController],
})
export class ClinicalReportsModule {}
