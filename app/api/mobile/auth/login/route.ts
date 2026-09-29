import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { mobileLoginSchema, validateInput, formatValidationError } from '@/lib/validationSchemas';

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
            value: `Hi ${recipientName},\n\nWe noticed a successful sign-in to your Alerto account.\n\nDate & Time: ${loginDate} (PHT)\nAccount: ${user.email}\n\nIf this was you, you can safely ignore this email.\nIf you did not authorize this sign-in, please change your password immediately and contact support.\n\nStay safe,\nThe Alerto Team`,
          },
          {
            type: 'text/html',
            value: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f43f5e; padding: 20px; text-align: center; color: white;">
                  <h2 style="margin: 0;">Alerto Security</h2>
                </div>
                <div style="padding: 20px; color: #333;">
                  <p>Hello ${recipientName},</p>
                  <p>We noticed a successful sign-in to your Alerto account.</p>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 100px;">Date &amp; Time:</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${loginDate} (PHT)</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Account:</td>
                      <td style="padding: 8px 0;">${user.email}</td>
                    </tr>
                  </table>
                  <p>If this was you, you can safely ignore this email.</p>
                  <p style="color: #f43f5e; font-weight: bold;">If you did not authorize this sign-in, please change your password immediately and contact support.</p>
                  <br/>
                  <p>Stay safe,<br/>The Alerto Team</p>
                </div>
              </div>
            `,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with zod schema
    const validation = validateInput(mobileLoginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatValidationError(validation.errors!) },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === 'Inactive') {
      return NextResponse.json({ error: "Your account has been disabled. Please contact support." }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastActive: new Date(),
      },
    }).catch(() => {});

    // Send login notification email (fire and forget - don't block the login response)
    void sendLoginNotificationEmail({ email: user.email, name: user.name });

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
