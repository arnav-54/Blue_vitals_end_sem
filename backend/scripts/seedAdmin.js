require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bluevitals.com' },
    update: { password: hashedPassword },
    create: {
      name: 'System Admin',
      email: 'admin@bluevitals.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin seeded:', admin.email);
}

main()
  .catch(e => { console.error('❌ Failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
