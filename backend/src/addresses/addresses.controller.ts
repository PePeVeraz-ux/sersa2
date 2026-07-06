import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async getMyAddresses(@Request() req: any) {
    return this.addressesService.getUserAddresses(req.user.userId);
  }

  @Post()
  async createAddress(@Request() req: any, @Body() data: any) {
    console.log('--- REQ.USER IN CREATE ADDRESS ---', req.user);
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.addressesService.createAddress(userId, data);
  }

  @Delete(':id')
  async deleteAddress(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.deleteAddress(req.user.userId, id);
  }
}
