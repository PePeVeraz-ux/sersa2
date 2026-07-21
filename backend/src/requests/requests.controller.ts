import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('my-requests')
  async getMyRequests(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.getMyRequests(userId);
  }

  @Get('available')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async getAvailableRequests() {
    return this.requestsService.getAvailableRequests();
  }

  @Get('nurse/stats')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async getNurseStats(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.getNurseStats(userId);
  }

  @Get('nurse/today-route')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async getTodayRoute(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.getTodayRoute(userId);
  }

  @Post(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async acceptRequest(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.acceptRequest(id, userId);
  }

  @Get('my-schedule')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async getMySchedule(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.getMySchedule(userId);
  }

  @Get('nurse/requests')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async getNurseRequests(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.getNurseRequests(userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('nurse')
  async updateStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.updateStatus(id, userId, status);
  }

  @Post(':id/cancel')
  async cancelRequest(@Request() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.cancelRequest(id, userId, reason);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('patient')
  async createRequest(@Request() req: any, @Body() data: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.requestsService.createRequest(userId, data);
  }
}
