import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'alerto.system2026@gmail.com';
  const plainPassword = 'adminpassword123';

  //check if it already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('Admin already exists:', existingAdmin);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      role: 'super-admin',
    },
  });

  console.log('Admin created successfully:', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
