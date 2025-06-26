import { PrismaClient, RequestType, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEmployeeRequests() {
  console.log('🗑️ Clearing existing employee requests...');
  await prisma.employeeRequest.deleteMany({});

  console.log('📝 Seeding 50 Employee Requests from Jan 2023 to Jun 2025...');

  const purposes = [
    'Office maintenance', 'Project A supplies', 'Routine checkup tools',
    'Field operations', 'Emergency repairs', 'Training consumables',
    'Seminar kits', 'Warehouse usage', 'Client demo materials',
    'Monthly restock', 'IT Department stock', 'Temporary site supply',
    'Annual inventory', 'Transportation team request', 'COVID-19 supplies',
    'Back-office usage', 'Quality check tools', 'Admin restock',
    'Special project', 'Urgent procurement'
  ];

  const requests = [];
  let total = 20;
  let year = 2023;
  let month = 1;

  while (total > 0 && (year < 2025 || (year === 2025 && month <= 6))) {
    const requestsThisMonth = total >= 2 ? Math.floor(Math.random() * 2) + 1 : 1;

    for (let j = 0; j < requestsThisMonth && total > 0; j++) {
      const index = 20 - total;
      const request_id = `REQ-${(index + 1).toString().padStart(5, '0')}`;
      const item_id = index % 2 === 0 ? 'ITEM-00002' : 'ITEM-00003';
      const emp_id = `EMP-${(index + 1).toString().padStart(5, '0')}`;
      const quantity = Math.floor(Math.random() * 401) + 100; // 100–500
      const req_purpose = purposes[index % purposes.length];
      const date_created = new Date(`${year}-${month.toString().padStart(2, '0')}-15`);

      requests.push(prisma.employeeRequest.create({
        data: {
          request_id,
          item_id,
          emp_id,
          request_type: RequestType.CONSUME,
          quantity,
          req_purpose,
          status: RequestStatus.CONSUMED,
          expected_return_date: null,
          actual_return_date: null,
          date_created,
          created_by: 1
        }
      }));

      total--;
    }

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  await Promise.all(requests);
  console.log('🎉 50 Employee requests seeded successfully with quantity between 100 and 500!');
}

seedEmployeeRequests()
  .catch((err) => {
    console.error('❌ Error during seeding:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
