const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all users
  const users = await prisma.user.findMany();

  // Update each user to explicitly set status to 'Active'
  for (const user of users) {
    if (user.status === 'Active') {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'Active' }
      });
    }
  }

  console.log('Database updated successfully.');

  console.log('All Users:', await prisma.user.count());
  console.log('Status Active Users:', await prisma.user.count({ where: { status: 'Active' } }));
}

main().finally(() => prisma.$disconnect());
