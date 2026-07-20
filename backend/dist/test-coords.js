"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const addresses = await prisma.address.findMany();
    console.log('Total addresses in prisma:', addresses.length);
    if (addresses.length > 0) {
        console.log('Sample address without spatial query:', JSON.stringify(addresses[0], null, 2));
        const addressIds = addresses.map(a => a.id);
        try {
            const rows = await prisma.$queryRaw `
        SELECT id, ST_Y(location::geometry)::float8 AS lat, ST_X(location::geometry)::float8 AS lng
        FROM addresses
        WHERE id IN (${addressIds[0]})
      `;
            console.log('Raw query results for first address:', rows);
        }
        catch (e) {
            console.error('Error executing ST_Y / ST_X spatial query:', e);
        }
    }
    else {
        console.log('No addresses found in database.');
    }
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=test-coords.js.map