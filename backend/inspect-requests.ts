import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.serviceRequest.findMany({
    include: {
      assigned_nurse: {
        include: {
          nurse_profile: true
        }
      }
    }
  });
  console.log('--- ALL REQUESTS ---');
  for (const r of requests) {
    console.log(`Request ID: ${r.id}, Status: ${r.status}`);
    console.log('Assigned Nurse:', JSON.stringify(r.assigned_nurse, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
