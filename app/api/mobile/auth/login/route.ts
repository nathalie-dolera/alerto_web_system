import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) {
      return NextResponse.json({ error: "Your email is incorrect" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Your password is incorrect" }, { status: 401 });
    }

    if (user.status === 'Inactive') {
      return NextResponse.json({ error: "Your account has been disabled. Please contact support." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, image: user.image }
    });

  } catch (error) {
    console.error("Login API Error:", error); 
    
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}