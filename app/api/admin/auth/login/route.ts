import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { adminLoginSchema, validateInput, formatValidationError } from '@/lib/validationSchemas';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with zod schema
    const validation = validateInput(adminLoginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatValidationError(validation.errors!) },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (admin.status === 'Inactive') {
      return NextResponse.json({ error: 'Your account has been disabled. Please contact the administrator.' }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ success: true, message: 'Logged in successfully' }, { status: 200 });
    response.cookies.set('adminAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, //1day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
