import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpires },
    });

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (apiKey && fromEmail) {
      const recipientName = user.name?.trim() || 'User';
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: user.email }], subject: 'Alerto Verification: New One-Time Password (OTP)' }],
          from: { email: fromEmail, name: 'Alerto Accounts' },
          content: [
            {
              type: 'text/html',
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
                  <h2 style="color: #0b1723; margin-top: 0;">ALERTO NEW VERIFICATION CODE</h2>
                  <p>Dear <strong>${recipientName}</strong>,</p>
                  <p>Here is your new 6-digit verification code:</p>
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px; background: #f7fafc; text-align: center; border-radius: 6px;">
                    ${otp}
                  </div>
                  <p style="color: #718096; font-size: 13px;">This code is valid for 10 minutes.</p>
                </div>
              `,
            },
          ],
        }),
      });
    }

    return NextResponse.json({ success: true, message: 'A new verification code has been dispatched to your email.' });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
