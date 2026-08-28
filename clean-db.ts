import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Database Cleanup...');

  // 1. Delete trips that lasted less than 60 seconds AND had no alerts or anomalies
  const shortTrips = await prisma.trip.findMany({
    where: {
      durationMs: { lt: 60000 },
      alertsTriggeredCount: 0,
      anomalyCount: 0
    }
  });

  // 2. Delete trips with empty destination
  const emptyDestTrips = await prisma.trip.findMany({
    where: {
      destinationName: {
        equals: ''
      }
    }
  });

  const idsToDelete = new Set([
    ...shortTrips.map((t: any) => t.id),
    ...emptyDestTrips.map((t: any) => t.id)
  ]);

  if (idsToDelete.size === 0) {
    console.log('No redundant trips found. Database is clean!');
    return;
  }

  console.log(`Found ${idsToDelete.size} redundant/invalid trips to delete.`);

  // Execute deletion
  const deleteResult = await prisma.trip.deleteMany({
    where: {
      id: { in: Array.from(idsToDelete) }
    }
  });

  console.log(`Successfully deleted ${deleteResult.count} trips.`);
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
