import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';

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

    //fetch all users, commuters
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { savedPlaces: true, trips: true, userAlerts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    //fetch all admins, admin
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' }
    });

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
        tripCount: 0
      })),
      ...users.map(user => ({
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: 'Commuter',
        joinDate: user.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: user.status || 'Active',
        isAdmin: false,
        alarmCount: user._count.savedPlaces + user._count.userAlerts,
        tripCount: user._count.trips
      }))
    ];

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
