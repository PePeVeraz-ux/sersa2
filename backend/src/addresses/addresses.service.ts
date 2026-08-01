import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) { }

  async getUserAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { is_default: 'desc' },
    });
  }

  async createAddress(userId: string, data: any) {
    // Si es la primera, hacerla default
    const count = await this.prisma.address.count({ where: { user_id: userId, deleted_at: null } });

    // Geocode or use passed coordinates
    let lat = data.lat;
    let lng = data.lng;

    if (!lat || !lng) {
      const addressText = `${data.street_line1}, ${data.neighborhood || ''}, ${data.city}, Mexico`;
      console.log(`Geocoding new address: "${addressText}"`);

      let geocodedLat = 32.5149; // Default to Tijuana Center
      let geocodedLng = -117.0382;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1`, {
          headers: { 'User-Agent': 'SersaAppGeocoder/1.0' }
        });
        const results = await res.json();
        if (results && results.length > 0) {
          geocodedLat = parseFloat(results[0].lat);
          geocodedLng = parseFloat(results[0].lon);
        } else {
          // Broad search
          const broadText = `${data.neighborhood || ''}, ${data.city}, Mexico`;
          const resBroad = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(broadText)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'SersaAppGeocoder/1.0' }
          });
          const resultsBroad = await resBroad.json();
          if (resultsBroad && resultsBroad.length > 0) {
            geocodedLat = parseFloat(resultsBroad[0].lat);
            geocodedLng = parseFloat(resultsBroad[0].lon);
          }
        }
      } catch (e) {
        console.error('Geocoding during creation failed:', e);
      }

      lat = geocodedLat;
      lng = geocodedLng;
    }

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

    const wkt = `POINT(${lng} ${lat})`;

    await this.prisma.$executeRaw`
      INSERT INTO addresses (id, user_id, label, custom_label, street_line1, street_line2, neighborhood, city, state, postal_code, country_code, references_text, location, is_default, created_at, updated_at)
      VALUES (${id}, ${userId}, ${validLabel}::"AddressLabel", ${customLabel}, ${data.street_line1}, ${data.street_line2 || null}, ${data.neighborhood || null}, ${data.city}, ${data.state || null}, ${data.postal_code}, ${data.country_code || 'MX'}, ${data.references_text || null}, ST_GeomFromText(${wkt}, 4326), ${count === 0}, NOW(), NOW())
    `;

    return this.prisma.address.findUnique({ where: { id } });
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const addr = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!addr || addr.user_id !== userId) throw new NotFoundException('Dirección no encontrada');

    // Re-geocode if address text changed
    let lat = data.lat;
    let lng = data.lng;

    if (!lat || !lng) {
      const addressText = `${data.street_line1}, ${data.neighborhood || ''}, ${data.city}, Mexico`;
      let geocodedLat = 32.5149;
      let geocodedLng = -117.0382;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1`, {
          headers: { 'User-Agent': 'SersaAppGeocoder/1.0' }
        });
        const results = await res.json();
        if (results && results.length > 0) {
          geocodedLat = parseFloat(results[0].lat);
          geocodedLng = parseFloat(results[0].lon);
        }
      } catch (e) {
        console.error('Geocoding during update failed:', e);
      }
      lat = geocodedLat;
      lng = geocodedLng;
    }

    let validLabel = 'other';
    const inputLabel = (data.label || '').toLowerCase();
    if (['home', 'work', 'other'].includes(inputLabel)) validLabel = inputLabel;
    const customLabel = validLabel === 'other' && data.label && !['home', 'work', 'other'].includes(inputLabel)
      ? data.label
      : (data.custom_label || null);

    const wkt = `POINT(${lng} ${lat})`;

    await this.prisma.$executeRaw`
      UPDATE addresses
      SET label = ${validLabel}::"AddressLabel",
          custom_label = ${customLabel},
          street_line1 = ${data.street_line1},
          street_line2 = ${data.street_line2 || null},
          neighborhood = ${data.neighborhood || null},
          city = ${data.city},
          state = ${data.state || null},
          postal_code = ${data.postal_code},
          references_text = ${data.references_text || null},
          location = ST_GeomFromText(${wkt}, 4326),
          updated_at = NOW()
      WHERE id = ${addressId}
    `;

    return this.prisma.address.findUnique({ where: { id: addressId } });
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
