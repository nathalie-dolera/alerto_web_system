const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { savedPlaces: true, trips: true, userAlerts: true }
      }
    }
  });
  console.log(JSON.stringify(users.map(u => ({ email: u.email, count: u._count })), null, 2));
}

main().finally(() => prisma.$disconnect());
