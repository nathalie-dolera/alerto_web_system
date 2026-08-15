import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminAuthToken')?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string, role: string };
        return NextResponse.json({
          user: {
            email: decoded.email,
            role: decoded.role,
          }
        });
      } catch {
        // Token invalid or expired, continue to fallback
      }
    }

    const defaultAdmin = await prisma.admin.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      user: {
        email: defaultAdmin?.email || 'nathaliedolera124@gmail.com',
        role: defaultAdmin?.role || 'super-admin',
      }
    });
  } catch (error) {
    return NextResponse.json({
      user: {
        email: 'nathaliedolera124@gmail.com',
        role: 'super-admin',
      }
    });
  }
}
