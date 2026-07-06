"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log("Dropping old trigger...");
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_service_request_status_history`);
        console.log("Creating new trigger...");
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_service_request_status_history
      AFTER UPDATE ON service_requests
      FOR EACH ROW
      BEGIN
        IF OLD.status != NEW.status THEN
          INSERT INTO service_request_status_history (
            id, service_request_id, from_status, to_status, change_source, created_at
          ) VALUES (UUID(), NEW.id, OLD.status, NEW.status, 'system', NOW());
        END IF;
      END
    `);
        console.log("Success");
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=fix-trigger.js.map