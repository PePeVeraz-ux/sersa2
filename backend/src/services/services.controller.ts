import { Controller, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('categories')
  async getCategories() {
    return this.servicesService.getCategories();
  }

  @Get()
  async getServices() {
    return this.servicesService.getServices();
  }

  @Get('category/:id')
  async getServicesByCategory(@Param('id') id: string) {
    return this.servicesService.getServicesByCategory(id);
  }
}
