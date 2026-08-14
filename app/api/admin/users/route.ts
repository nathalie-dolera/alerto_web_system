import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

async function getAuthorizedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuthToken')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string, role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const adminUser = await getAuthorizedUser();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    const activeTripThreshold = new Date(now - 30 * 60 * 1000); // 30 minutes
    const recentAlertThreshold = new Date(now - 15 * 60 * 1000); // 15 minutes

    const [users, admins, activeTrips, recentAlerts] = await Promise.all([
      prisma.user.findMany({
        include: {
          _count: {
            select: { savedPlaces: true, trips: true, userAlerts: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.admin.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.trip.findMany({
        where: { date: { gte: activeTripThreshold } },
        select: { userId: true },
      }),
      prisma.userAlert.findMany({
        where: { createdAt: { gte: recentAlertThreshold } },
        select: { userId: true },
      })
    ]);

    const activeTripUserIds = new Set(activeTrips.map(t => t.userId));
    const recentAlertUserIds = new Set(recentAlerts.map(a => a.userId).filter(Boolean) as string[]);

    const formattedUsers = [
      ...admins.map(admin => ({
        id: admin.id,
        name: admin.email.split('@')[0],
        email: admin.email,
        role: admin.role === 'super-admin' ? 'System Admin' : 'Sub Admin',
        joinDate: admin.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: admin.status || 'Active',
        isAdmin: true,
        alarmCount: 0,
        tripCount: 0,
        isOnline: admin.email === adminUser.email
      })),
      ...users.map(user => {
        const hasBluetooth = Boolean(user.isOnline && user.lastActive && (now - new Date(user.lastActive).getTime() <= STALE_THRESHOLD_MS));
        const hasActiveTrip = activeTripUserIds.has(user.id);
        const hasRecentAlert = recentAlertUserIds.has(user.id);

        const isUserActive = user.isOnline !== false && (hasBluetooth || hasActiveTrip || hasRecentAlert);

        return {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          role: 'Commuter',
          joinDate: user.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          status: user.status || 'Active',
          isAdmin: false,
          alarmCount: user._count.savedPlaces + user._count.userAlerts,
          tripCount: user._count.trips,
          isOnline: isUserActive
        };
      })
    ];

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
