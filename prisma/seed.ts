import {
  PrismaClient,
  BodyBuilder,
  BusType,
  BusStatus,
  BusCondition,
  AcquisitionMethod,
  RegistrationStatus,
  BusSource,
} from '@prisma/client';
import { generateId } from '../src/app/lib/idGenerator';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Clearing existing data...');
    await prisma.bus.deleteMany({});
    await prisma.inventoryItem.deleteMany({});
    await prisma.category.deleteMany({});

    console.log('📦 Seeding categories...');
    const categoryData = [
      { category_name: 'Consumable', date_created: new Date('2025-04-01') },
      { category_name: 'Bus', date_created: new Date('2025-04-16') },
      { category_name: 'Tool', date_created: new Date('2025-04-30') },
      { category_name: 'Equipment', date_created: new Date('2025-04-30') },
      { category_name: 'Machine', date_created: new Date('2025-04-30') },
    ];

    const categoryMap: Record<string, string> = {};

    for (const category of categoryData) {
      const category_id = await generateId('category', 'CAT');
      const created = await prisma.category.create({
        data: { category_id, ...category },
      });
      categoryMap[created.category_name] = created.category_id;
    }

    console.log('🛠️ Seeding 1 inventory item for buses...');
    await prisma.inventoryItem.create({
      data: {
        item_id: 'ITEM-00001',
        category_id: categoryMap['Bus'],
        item_name: 'Bus Unit',
        unit_measure: 'unit',
        current_stock: 0,
        reorder_level: 0,
        status: 'AVAILABLE',
        created_by: 'USR-00001',
      },
    });

    console.log('🚌 Seeding 15 buses...');
    for (let i = 1; i <= 15; i++) {
      const bus_id = await generateId('bus', 'BUS');
      const isSecondHand = i % 2 === 0;

      await prisma.bus.create({
        data: {
          bus_id,
          item_id: 'ITEM-00001', // Use same inventory item for all buses
          plate_number: `NAB 10${i.toString().padStart(2, '0')}`,
          body_number: `B10${i.toString().padStart(2, '0')}`,
          body_builder: i % 3 === 0 ? BodyBuilder.DARJ : i % 2 === 0 ? BodyBuilder.RBM : BodyBuilder.AGILA,
          bus_type: i % 2 === 0 ? BusType.ORDINARY : BusType.AIRCONDITIONED,
          manufacturer: i % 2 === 0 ? 'Iveco' : 'Daewoo Bus',
          status: BusStatus.ACTIVE,
          chasis_number: `CHS00${i}`,
          engine_number: `ENG00${i}`,
          seat_capacity: 40 + i,
          model: `Model ${i}`,
          year_model: 2020 + (i % 5),
          route: i % 3 === 0 ? 'MNL-BTN' : 'QC-BGC',
          condition: isSecondHand ? BusCondition.SECOND_HAND : BusCondition.BRAND_NEW,
          acquisition_date: new Date('2025-01-01'),
          acquisition_method: isSecondHand ? AcquisitionMethod.DONATED : AcquisitionMethod.PURCHASED,
          warranty_expiration_date: isSecondHand ? null : new Date('2027-01-01'),
          registration_status: RegistrationStatus.REGISTERED,
          created_by: 1,
          ...(isSecondHand
            ? {
                secondHandDetails: {
                  create: {
                    previous_owner: `Owner ${i}`,
                    previous_owner_contact: `09${i}81234567`,
                    source: BusSource.PRIVATE_INDIVIDUAL,
                    odometer_reading: 30000 + i * 500,
                    last_registration_date: new Date(`2023-0${(i % 9) + 1}-10`),
                    last_maintenance_date: new Date(`2024-0${(i % 9) + 1}-20`),
                    bus_condition_notes: `Used but reliable unit ${i}`,
                  },
                },
              }
            : {
                brandNewDetails: {
                  create: {
                    dealer_name: `Dealer ${i}`,
                    dealer_contact: `0917${i}56789`,
                  },
                },
              }),
        },
      });

      console.log(`✅ Created Bus NAB 10${i.toString().padStart(2, '0')}`);
    }

    console.log('🎉 All categories and 15 buses seeded successfully using 1 inventory item.');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
