import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Simple google auth validation schema
const googleAuthValidationSchema = z.object({
    email: z.string().email("Invalid email format"),
    name: z.string().min(1, "Name is required").optional(),
    googleId: z.string().min(1, "Google ID is required"),
    image: z.string().optional(),
});

async function sendLoginNotificationEmail(user: { email: string; name: string | null }) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      console.warn('Missing SendGrid config, skipping login notification email.');
      return;
    }

    const loginDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const recipientName = user.name?.trim() || 'User';

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: user.email }],
            subject: 'Security Alert: New Sign-In to Your Alerto Account',
          },
        ],
        from: {
          email: fromEmail,
          name: 'Alerto System',
        },
        content: [
          {
            type: 'text/plain',
            value: `Hi ${recipientName},\n\nWe noticed a successful sign-in to your Alerto account via Google.\n\nDate & Time: ${loginDate} (PHT)\nAccount: ${user.email}\nMethod: Google Sign-In\n\nIf this was you, you can safely ignore this email.\nIf you did not authorize this sign-in, please secure your Google account immediately and contact support.\n\nStay safe,\nThe Alerto Team`,
          },
          {
            type: 'text/html',
            value: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;"><div style="background-color: #f43f5e; padding: 20px; text-align: center; color: white;"><h2 style="margin: 0;">Alerto Security</h2></div><div style="padding: 20px; color: #333;"><p>Hello ${recipientName},</p><p>We noticed a successful sign-in to your Alerto account via <strong>Google</strong>.</p><p>Date &amp; Time: ${loginDate} (PHT)</p><p>If this was you, you can safely ignore this email.</p><p style="color: #f43f5e; font-weight: bold;">If you did not authorize this, please secure your account immediately.</p><p>Stay safe,<br/>The Alerto Team</p></div></div>`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login notification email failed:', response.status, errorText);
    } else {
      console.log('Login notification email sent to:', user.email);
    }
  } catch (e) {
    console.error('Failed to send login notification email:', e);
  }
}

async function sendGoogleOtpEmail(user: { email: string; name: string | null }, otp: string) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      console.warn('Missing SendGrid config, skipping Google OTP email.');
      return;
    }

    const recipientName = user.name?.trim() || 'User';

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: user.email }],
            subject: 'Alerto Account Verification: Your One-Time Password (OTP)',
          },
        ],
        from: {
          email: fromEmail,
          name: 'Alerto Accounts',
        },
        content: [
          {
            type: 'text/plain',
            value: `Dear ${recipientName},\n\nThank you for signing up with Alerto via Google. To complete your account verification, please enter the OTP below:\n\n${otp}\n\nThis code is valid for 10 minutes.\n\nSincerely,\nAlerto Verification Services`,
          },
          {
            type: 'text/html',
            value: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;"><div style="background-color: #0b1723; padding: 22px; text-align: center; color: #ffffff;"><h2 style="margin: 0; font-size: 19px;">ALERTO ACCOUNT VERIFICATION</h2></div><div style="padding: 28px; color: #1a202c;"><p>Dear <strong>${recipientName}</strong>,</p><p>Thank you for signing up with Alerto via <strong>Google</strong>. Please use the OTP below to verify your account:</p><div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;"><div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0b1723; font-family: monospace;">${otp}</div><p style="margin: 8px 0 0 0; color: #718096; font-size: 13px;">Expires in <strong>10 minutes</strong>.</p></div><p style="font-size: 13px; color: #4a5568;"><strong>Security:</strong> Never share this code. Contact alerto.system2026@gmail.com if you did not request this.</p></div></div>`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google OTP email failed:', response.status, errorText);
    } else {
      console.log('Google OTP email sent successfully to:', user.email);
    }
  } catch (e) {
    console.error('Failed to send Google OTP email:', e);
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = googleAuthValidationSchema.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        const { email, name, googleId, image } = validation.data;
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (existingUser) {
            // --- EXISTING USER: previously unverified ---
            if (existingUser.status === 'PendingVerification') {
                // Account exists but was never verified — send a fresh OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        googleId,
                        image: image || existingUser.image,
                        name: name || existingUser.name,
                        otpCode: otp,
                        otpExpires,
                    },
                });

                void sendGoogleOtpEmail({ email: normalizedEmail, name: name || existingUser.name }, otp);

                return NextResponse.json({
                    success: false,
                    requireOtp: true,
                    email: normalizedEmail,
                    message: 'Your account is not yet verified. A new verification code has been sent to your email.',
                }, { status: 200 });
            }

            // --- EXISTING USER: fully active — log in immediately ---
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    name: name || existingUser.name,
                    image: image || existingUser.image,
                    googleId,
                    isOnline: true,
                    lastActive: new Date(),
                },
            });

            // Send login notification email (fire and forget)
            void sendLoginNotificationEmail({ email: existingUser.email, name: existingUser.name });

            return NextResponse.json({
                success: true,
                message: 'User authenticated successfully',
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    name: name || existingUser.name,
                    image: image || existingUser.image,
                },
            }, { status: 200 });
        }

        // --- NEW USER: create with PendingVerification and send OTP ---
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const newUser = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: name || normalizedEmail.split('@')[0],
                image: image,
                googleId,
                role: 'USER',
                status: 'PendingVerification',
                otpCode: otp,
                otpExpires,
            },
        });

        void sendGoogleOtpEmail({ email: newUser.email, name: newUser.name }, otp);

        return NextResponse.json({
            success: false,
            requireOtp: true,
            email: newUser.email,
            message: 'A 6-digit verification code has been sent to your Google email address.',
        }, { status: 200 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Database connection failed',
        }, { status: 500 });
    }
}
