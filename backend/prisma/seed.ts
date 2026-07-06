import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();

  const catEnfermeria = await prisma.serviceCategory.create({
    data: {
      name: 'Enfermería General',
      slug: 'enfermeria-general',
      description: 'Servicios básicos de enfermería a domicilio.',
      sort_order: 1,
    },
  });

  const catCuidados = await prisma.serviceCategory.create({
    data: {
      name: 'Cuidados Especiales',
      slug: 'cuidados-especiales',
      description: 'Cuidado prolongado y atención especializada.',
      sort_order: 2,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        category_id: catEnfermeria.id,
        name: 'Inyección Intramuscular',
        slug: 'inyeccion-intramuscular',
        description: 'Aplicación de medicamento vía intramuscular.',
        base_price: 150.0,
        estimated_duration_min: 20,
        icon_key: 'Syringe',
        requires_prescription: true,
      },
      {
        category_id: catEnfermeria.id,
        name: 'Toma de Signos Vitales',
        slug: 'toma-signos-vitales',
        description: 'Medición de presión arterial, glucosa, temperatura y oxigenación.',
        base_price: 200.0,
        estimated_duration_min: 30,
        icon_key: 'Activity',
      },
      {
        category_id: catEnfermeria.id,
        name: 'Curación de Heridas',
        slug: 'curacion-heridas',
        description: 'Limpieza y vendaje de heridas postoperatorias o úlceras.',
        base_price: 350.0,
        estimated_duration_min: 45,
        icon_key: 'Bandage',
      },
      {
        category_id: catCuidados.id,
        name: 'Turno Nocturno (8 hrs)',
        slug: 'turno-nocturno',
        description: 'Cuidados y vigilancia del paciente durante la noche.',
        base_price: 1200.0,
        estimated_duration_min: 480,
        icon_key: 'Moon',
      },
      {
        category_id: catCuidados.id,
        name: 'Turno Diurno (8 hrs)',
        slug: 'turno-diurno',
        description: 'Atención continua, movilización y alimentación del paciente.',
        base_price: 1000.0,
        estimated_duration_min: 480,
        icon_key: 'Sun',
      },
    ],
  });

  const password = await bcrypt.hash('Demo1234!', 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@sersa.mx' } });
  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sersa.mx',
        password_hash: password,
        role: 'admin',
        status: 'active',
      },
    });
    await prisma.adminProfile.create({
      data: { user_id: admin.id, first_name: 'Admin', last_name: 'SERSA', department: 'Operaciones' },
    });
    console.log('Admin demo: admin@sersa.mx / Demo1234!');
  }

  const existingPatient = await prisma.user.findUnique({ where: { email: 'paciente@sersa.mx' } });
  if (!existingPatient) {
    const patient = await prisma.user.create({
      data: {
        email: 'paciente@sersa.mx',
        password_hash: password,
        role: 'patient',
        status: 'active',
        phone: '+526641234567',
      },
    });
    await prisma.patientProfile.create({
      data: { user_id: patient.id, first_name: 'Juan', last_name: 'Pérez', second_last_name: 'García' },
    });
    console.log('Paciente demo: paciente@sersa.mx / Demo1234!');
  }

  const existingNurse = await prisma.user.findUnique({ where: { email: 'enfermero@sersa.mx' } });
  if (!existingNurse) {
    const nurse = await prisma.user.create({
      data: {
        email: 'enfermero@sersa.mx',
        password_hash: password,
        role: 'nurse',
        status: 'active',
        phone: '+526641987654',
      },
    });
    const wallet = await prisma.nurseWallet.create({ data: { nurse_user_id: nurse.id } });
    await prisma.nurseProfile.create({
      data: {
        user_id: nurse.id,
        first_name: 'María',
        last_name: 'López',
        professional_license: 'TJ-12345678',
        license_state: 'Baja California',
        wallet_id: wallet.id,
        is_available: true,
      },
    });
    console.log('Enfermero demo: enfermero@sersa.mx / Demo1234!');
  }

  console.log('Seed exitoso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
