import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async getUserAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { is_default: 'desc' },
    });
  }

  async createAddress(userId: string, data: any) {
    // Si es la primera, hacerla default
    const count = await this.prisma.address.count({ where: { user_id: userId, deleted_at: null } });
    
    // Crear un punto espacial POINT(lng lat) dummy si no se manda
    const lng = data.lng || -99.1332;
    const lat = data.lat || 19.4326;

    // Prisma no soporta crear POINT nativamente tan simple, hay que usar raw:
    const id = randomUUID();
    
    // Validar ENUM label
    let validLabel = 'other';
    const inputLabel = (data.label || '').toLowerCase();
    if (['home', 'work', 'other'].includes(inputLabel)) {
      validLabel = inputLabel;
    }
    
    // Si el label no es del ENUM, lo guardamos como custom_label
    const customLabel = validLabel === 'other' && data.label && !['home', 'work', 'other'].includes(inputLabel) ? data.label : (data.custom_label || null);

    await this.prisma.$executeRaw`
      INSERT INTO addresses (id, user_id, label, custom_label, street_line1, street_line2, neighborhood, city, state, postal_code, country_code, references_text, location, is_default, created_at, updated_at)
      VALUES (${id}, ${userId}, ${validLabel}, ${customLabel}, ${data.street_line1}, ${data.street_line2 || null}, ${data.neighborhood || null}, ${data.city}, ${data.state || null}, ${data.postal_code}, ${data.country_code || 'MX'}, ${data.references_text || null}, ST_GeomFromText(${'POINT(' + lat + ' ' + lng + ')'}, 4326), ${count === 0}, NOW(), NOW())
    `;

    return this.prisma.address.findUnique({ where: { id } });
  }

  async deleteAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!addr || addr.user_id !== userId) throw new NotFoundException('Dirección no encontrada');

    return this.prisma.address.update({
      where: { id: addressId },
      data: { deleted_at: new Date() }
    });
  }
}
