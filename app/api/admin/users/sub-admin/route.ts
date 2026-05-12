import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addSubAdminSchema, validateInput, formatValidationError } from '@/lib/validationSchemas';

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

    const body = await request.json();

    // Validate input with zod schema
    const validation = validateInput(addSubAdminSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatValidationError(validation.errors!) },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });
    }

    // Validate password strength on server
    const passwordRules = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>\-_]/.test(password),
    };

    const isPasswordStrong = Object.values(passwordRules).every(rule => rule === true);
    if (!isPasswordStrong) {
      return NextResponse.json({
        error: 'Password does not meet security requirements. Must include uppercase, lowercase, number, and special character.'
      }, { status: 400 });
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
