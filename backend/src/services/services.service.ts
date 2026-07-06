import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }

  async getServices() {
    return this.prisma.service.findMany({
      where: { is_active: true },
      include: { category: true },
    });
  }

  async getServicesByCategory(categoryId: string) {
    return this.prisma.service.findMany({
      where: { is_active: true, category_id: categoryId },
    });
  }
}
