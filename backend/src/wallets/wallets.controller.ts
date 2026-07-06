import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('my-wallet')
  @Roles('nurse')
  async getMyWallet(@Request() req: any) {
    return this.walletsService.getNurseWallet(req.user.userId);
  }

  @Post('withdraw')
  @Roles('nurse')
  async requestWithdrawal(
    @Request() req: any,
    @Body() body: { amount: number; clabe: string; bankName?: string },
  ) {
    return this.walletsService.requestWithdrawal(req.user.userId, body);
  }

  @Get('payments/patient')
  @Roles('patient')
  async getPatientPayments(@Request() req: any) {
    return this.walletsService.getPatientPayments(req.user.userId);
  }
}
