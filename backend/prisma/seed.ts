import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // Create Super Admin
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@nop.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // =============================================
  // Create Real Branches - Kuwait
  // =============================================

  const daiya = await prisma.branch.create({
    data: {
      name: 'الدعية (Daiya)',
      location: 'قطعة 2، شارع 26، منزل 1 - الدعية، محافظة العاصمة',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const shuhada = await prisma.branch.create({
    data: {
      name: 'الشهداء (Shuhada)',
      location: 'قطعة 4، شارع 420، منزل 18 - الشهداء، محافظة حولي',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const salam = await prisma.branch.create({
    data: {
      name: 'السلام (Salam)',
      location: 'قطعة 2، شارع علي الجسار، منزل 69 - السلام، محافظة حولي',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const mishref = await prisma.branch.create({
    data: {
      name: 'مشرف (Mishref)',
      location: 'قطعة 4، شارع 6، منزل 1 - مشرف، محافظة حولي',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const rumaithiya = await prisma.branch.create({
    data: {
      name: 'الرميثية (Rumaithiya)',
      location: 'قطعة 6، شارع ناصر المبارك، منزل 5 - الرميثية، محافظة حولي',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const fahadAlAhmad = await prisma.branch.create({
    data: {
      name: 'فهد الأحمد (Fahad Al Ahmad)',
      location: 'قطعة 2، شارع 208، منزل 29 - فهد الأحمد، محافظة الأحمدي',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const sabahAlAhmad = await prisma.branch.create({
    data: {
      name: 'صباح الأحمد 3 (Sabah Al Ahmad 3)',
      location: 'قطعة 4، شارع 406، منزل 53 - مدينة صباح الأحمد السكنية، محافظة الأحمدي',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const mutlaa = await prisma.branch.create({
    data: {
      name: 'المطلاع (Al-Mutlaa)',
      location: 'الضاحية 9، قطعة 4، مبنى 560 - المطلاع الضاحية، محافظة الجهراء',
      capacity: 80,
      numClasses: 3,
      status: 'ACTIVE',
    },
  });

  const maarefinSalwa = await prisma.branch.create({
    data: {
      name: 'معرفي سلوى (Maarefi Salwa)',
      location: 'قطعة 12، شارع 4، منزل 84 - سلوى، محافظة حولي',
      capacity: 60,
      numClasses: 2,
      status: 'ACTIVE',
    },
  });

  const maarefMessila = await prisma.branch.create({
    data: {
      name: 'معرفي المسيلة (Maarefi Messila)',
      location: 'قطعة 7، شارع 7، منزل 33 - المسيلة، محافظة مبارك الكبير',
      capacity: 60,
      numClasses: 2,
      status: 'ACTIVE',
    },
  });

  const stepByStep = await prisma.branch.create({
    data: {
      name: 'خطوة بخطوة (Step by Step)',
      location: 'قطعة 6، شارع 7، قسيمة 88، منزل 14 - الأندلس، محافظة الفروانية',
      capacity: 60,
      numClasses: 2,
      status: 'ACTIVE',
    },
  });

  // =============================================
  // Create Branch Managers
  // =============================================
  const managerPassword = await bcrypt.hash('Manager@123', 10);

  const daiyaManager = await prisma.user.create({
    data: {
      name: 'مدير فرع الدعية',
      email: 'manager.daiya@nop.com',
      passwordHash: managerPassword,
      role: 'BRANCH_MANAGER',
      branchId: daiya.id,
      isActive: true,
    },
  });

  const shuhadaManager = await prisma.user.create({
    data: {
      name: 'مدير فرع الشهداء',
      email: 'manager.shuhada@nop.com',
      passwordHash: managerPassword,
      role: 'BRANCH_MANAGER',
      branchId: shuhada.id,
      isActive: true,
    },
  });

  const fahadManager = await prisma.user.create({
    data: {
      name: 'مدير فرع فهد الأحمد',
      email: 'manager.fahad@nop.com',
      passwordHash: managerPassword,
      role: 'BRANCH_MANAGER',
      branchId: fahadAlAhmad.id,
      isActive: true,
    },
  });

  // =============================================
  // Create Classes for Daiya branch
  // =============================================
  const daiyaNursery = await prisma.class.create({
    data: { name: 'حضانة أ', level: 'NURSERY', capacity: 20, branchId: daiya.id },
  });
  const daiyaKg1 = await prisma.class.create({
    data: { name: 'KG1 أ', level: 'KG1', capacity: 25, branchId: daiya.id },
  });
  const daiyaKg2 = await prisma.class.create({
    data: { name: 'KG2 أ', level: 'KG2', capacity: 25, branchId: daiya.id },
  });

  // Classes for Shuhada branch
  const shuhadaNursery = await prisma.class.create({
    data: { name: 'حضانة ب', level: 'NURSERY', capacity: 20, branchId: shuhada.id },
  });
  const shuhadaKg1 = await prisma.class.create({
    data: { name: 'KG1 ب', level: 'KG1', capacity: 25, branchId: shuhada.id },
  });

  // Classes for Fahad Al Ahmad branch
  const fahadNursery = await prisma.class.create({
    data: { name: 'حضانة ج', level: 'NURSERY', capacity: 20, branchId: fahadAlAhmad.id },
  });
  const fahadKg1 = await prisma.class.create({
    data: { name: 'KG1 ج', level: 'KG1', capacity: 25, branchId: fahadAlAhmad.id },
  });

  // =============================================
  // Create Students (sample Kuwaiti names)
  // =============================================
  const daiyaStudents = await Promise.all([
    prisma.student.create({ data: { name: 'أحمد عبدالله العنزي', age: 3, branchId: daiya.id, classId: daiyaNursery.id, status: 'ACTIVE' } }),
    prisma.student.create({ data: { name: 'فاطمة خالد المطيري', age: 3, branchId: daiya.id, classId: daiyaNursery.id, status: 'ACTIVE' } }),
    prisma.student.create({ data: { name: 'سارة محمد الرشيدي', age: 4, branchId: daiya.id, classId: daiyaKg1.id, status: 'ACTIVE' } }),
    prisma.student.create({ data: { name: 'عمر يوسف الحربي', age: 4, branchId: daiya.id, classId: daiyaKg1.id, status: 'ACTIVE' } }),
    prisma.student.create({ data: { name: 'نورة سالم العجمي', age: 5, branchId: daiya.id, classId: daiyaKg2.id, status: 'ACTIVE' } }),
  ]);

  const shuhadaStudents = await Promise.all([
    prisma.student.create({ data: { name: 'مريم عبدالعزيز الشمري', age: 3, branchId: shuhada.id, classId: shuhadaNursery.id, status: 'ACTIVE' } }),
    prisma.student.create({ data: { name: 'زياد ناصر العتيبي', age: 4, branchId: shuhada.id, classId: shuhadaKg1.id, status: 'ACTIVE' } }),
    prisma.student.create({ data: { name: 'ليلى أحمد المنصور', age: 4, branchId: shuhada.id, classId: shuhadaKg1.id, status: 'ACTIVE' } }),
  ]);

  const fahadStudents = await Promise.all([
    prisma.student.create({ data: { name: 'عبدالله محمد الكندي', age: 3, branchId: fahadAlAhmad.id, classId: fahadNursery.id, status: 'ACTIVE' } }),
    prisma.student.create({ data: { name: 'هند علي السبيعي', age: 4, branchId: fahadAlAhmad.id, classId: fahadKg1.id, status: 'ACTIVE' } }),
  ]);

  // =============================================
  // Create Fees (amount in Kuwaiti Dinar - KD)
  // =============================================
  await Promise.all([
    prisma.fee.create({ data: { studentId: daiyaStudents[0].id, amount: 150, paymentStatus: 'PAID', paymentDate: new Date('2026-03-15') } }),
    prisma.fee.create({ data: { studentId: daiyaStudents[1].id, amount: 150, paymentStatus: 'UNPAID' } }),
    prisma.fee.create({ data: { studentId: daiyaStudents[2].id, amount: 150, paymentStatus: 'PAID', paymentDate: new Date('2026-04-10') } }),
    prisma.fee.create({ data: { studentId: daiyaStudents[3].id, amount: 150, paymentStatus: 'PAID', paymentDate: new Date('2026-04-05') } }),
    prisma.fee.create({ data: { studentId: daiyaStudents[4].id, amount: 150, paymentStatus: 'UNPAID' } }),
    prisma.fee.create({ data: { studentId: shuhadaStudents[0].id, amount: 150, paymentStatus: 'PAID', paymentDate: new Date('2026-03-20') } }),
    prisma.fee.create({ data: { studentId: shuhadaStudents[1].id, amount: 150, paymentStatus: 'UNPAID' } }),
    prisma.fee.create({ data: { studentId: fahadStudents[0].id, amount: 150, paymentStatus: 'PAID', paymentDate: new Date('2026-04-01') } }),
    prisma.fee.create({ data: { studentId: fahadStudents[1].id, amount: 150, paymentStatus: 'UNPAID' } }),
  ]);

  // =============================================
  // Create Expenses (amounts in KD)
  // =============================================
  await Promise.all([
    prisma.expense.create({
      data: { branchId: daiya.id, category: 'RENT', amount: 800, date: new Date('2026-04-01'), description: 'إيجار شهري - فرع الدعية', createdById: admin.id },
    }),
    prisma.expense.create({
      data: { branchId: daiya.id, category: 'SALARIES', amount: 1200, date: new Date('2026-04-05'), description: 'رواتب الكادر التعليمي - فرع الدعية', createdById: admin.id },
    }),
    prisma.expense.create({
      data: { branchId: shuhada.id, category: 'RENT', amount: 750, date: new Date('2026-04-01'), description: 'إيجار شهري - فرع الشهداء', createdById: admin.id },
    }),
    prisma.expense.create({
      data: { branchId: shuhada.id, category: 'OPERATIONS', amount: 300, date: new Date('2026-04-08'), description: 'مستلزمات ولوازم تعليمية', createdById: admin.id },
    }),
    prisma.expense.create({
      data: { branchId: fahadAlAhmad.id, category: 'SALARIES', amount: 1100, date: new Date('2026-04-05'), description: 'رواتب الكادر التعليمي - فهد الأحمد', createdById: admin.id },
    }),
  ]);

  // =============================================
  // Create Maintenance Requests
  // =============================================
  await Promise.all([
    prisma.maintenanceRequest.create({
      data: { branchId: daiya.id, type: 'PLUMBING', description: 'تسرب مياه في دورة المياه', priority: 'HIGH', status: 'NEW', createdById: daiyaManager.id },
    }),
    prisma.maintenanceRequest.create({
      data: { branchId: shuhada.id, type: 'ELECTRICAL', description: 'إضاءة معطلة في الفصل الدراسي', priority: 'MEDIUM', status: 'IN_PROGRESS', createdById: shuhadaManager.id },
    }),
    prisma.maintenanceRequest.create({
      data: { branchId: fahadAlAhmad.id, type: 'PAINTING', description: 'طلاء جدار الممر الخارجي', priority: 'LOW', status: 'NEW', createdById: fahadManager.id },
    }),
  ]);

  console.log('✅ تم تحميل بيانات الكويت بنجاح!');
  console.log('📍 تم إنشاء 11 فرع في الكويت');
  console.log('👤 بيانات الدخول: admin@nop.com / Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
