"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let AddressesService = class AddressesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserAddresses(userId) {
        return this.prisma.address.findMany({
            where: { user_id: userId, deleted_at: null },
            orderBy: { is_default: 'desc' },
        });
    }
    async createAddress(userId, data) {
        const count = await this.prisma.address.count({ where: { user_id: userId, deleted_at: null } });
        const lng = data.lng || -99.1332;
        const lat = data.lat || 19.4326;
        const id = (0, crypto_1.randomUUID)();
        let validLabel = 'other';
        const inputLabel = (data.label || '').toLowerCase();
        if (['home', 'work', 'other'].includes(inputLabel)) {
            validLabel = inputLabel;
        }
        const customLabel = validLabel === 'other' && data.label && !['home', 'work', 'other'].includes(inputLabel) ? data.label : (data.custom_label || null);
        await this.prisma.$executeRaw `
      INSERT INTO addresses (id, user_id, label, custom_label, street_line1, street_line2, neighborhood, city, state, postal_code, country_code, references_text, location, is_default, created_at, updated_at)
      VALUES (${id}, ${userId}, ${validLabel}, ${customLabel}, ${data.street_line1}, ${data.street_line2 || null}, ${data.neighborhood || null}, ${data.city}, ${data.state || null}, ${data.postal_code}, ${data.country_code || 'MX'}, ${data.references_text || null}, ST_GeomFromText(${'POINT(' + lat + ' ' + lng + ')'}, 4326), ${count === 0}, NOW(), NOW())
    `;
        return this.prisma.address.findUnique({ where: { id } });
    }
    async deleteAddress(userId, addressId) {
        const addr = await this.prisma.address.findUnique({ where: { id: addressId } });
        if (!addr || addr.user_id !== userId)
            throw new common_1.NotFoundException('Dirección no encontrada');
        return this.prisma.address.update({
            where: { id: addressId },
            data: { deleted_at: new Date() }
        });
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map