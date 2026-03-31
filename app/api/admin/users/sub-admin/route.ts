import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';

//ensuring its the super admin
async function getAuthorizedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuthToken')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string, role: string };
    if (decoded.role !== 'super-admin') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthorizedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Only super-admins can perform this action.' }, { status: 403 });
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const subAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role: 'sub-admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Sub admin created successfully',
      admin: { id: subAdmin.id, email: subAdmin.email, role: subAdmin.role }
    }, { status: 201 });

  } catch (error) {
    console.error('Sub admin creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
