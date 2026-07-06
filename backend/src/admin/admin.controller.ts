import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('nurses/pending')
  async getPendingNurses() {
    return this.adminService.getPendingNurses();
  }

  @Get('patients')
  async getPatients() {
    return this.adminService.getPatients();
  }

  @Post('nurses/:id/approve')
  async approveNurse(@Param('id') nurseId: string) {
    return this.adminService.approveNurse(nurseId);
  }

  @Post('nurses/:id/reject')
  async rejectNurse(@Param('id') nurseId: string, @Body('reason') reason?: string) {
    return this.adminService.rejectNurse(nurseId, reason);
  }
}
