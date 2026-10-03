import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and 6-digit code are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    if (user.status === 'Active') {
      return NextResponse.json({
        success: true,
        message: 'Account is already verified. You may log in.',
        user: { id: user.id, email: user.email, name: user.name, image: user.image },
      });
    }

    if (!user.otpCode || !user.otpExpires) {
      return NextResponse.json({ error: 'No active verification code found. Please request a new code.' }, { status: 400 });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 });
    }

    if (user.otpCode.trim() !== otp.toString().trim()) {
      return NextResponse.json({ error: 'Invalid verification code. Please check your email and try again.' }, { status: 400 });
    }

    // Mark user as active and clear OTP
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'Active',
        otpCode: null,
        otpExpires: null,
        isOnline: true,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
      },
    });

  } catch (error) {
    console.error('Verify OTP API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
