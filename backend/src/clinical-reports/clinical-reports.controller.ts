import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ClinicalReportsService } from './clinical-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('clinical-reports')
@UseGuards(JwtAuthGuard)
export class ClinicalReportsController {
  constructor(private readonly clinicalReportsService: ClinicalReportsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async createReport(@Request() req: any, @Body() data: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.clinicalReportsService.createReport(userId, data);
  }

  @Get('my-reports')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async getMyReports(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.clinicalReportsService.getNurseReports(userId);
  }

  @Get(':requestId')
  async getReportByRequest(@Request() req: any, @Param('requestId') requestId: string) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.clinicalReportsService.getReportByRequest(requestId, userId);
  }
}
