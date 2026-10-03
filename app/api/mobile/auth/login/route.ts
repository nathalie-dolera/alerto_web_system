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
            subject: 'Security Notice: New Sign-In to Your Alerto Account',
          },
        ],
        from: {
          email: fromEmail,
          name: 'Alerto Security',
        },
        content: [
          {
            type: 'text/plain',
            value: `Dear ${recipientName},\n\nWe detected a successful sign-in to your Alerto account.\n\nDate and Time: ${loginDate} (PHT)\nAccount: ${user.email}\n\nIf this was authorized by you, no further action is required.\nIf you did not authorize this login, please reset your password immediately and contact support at alerto.system2026@gmail.com.\n\nSincerely,\nAlerto Security Team\nalerto.system2026@gmail.com`,
          },
          {
            type: 'text/html',
            value: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #0b1723; padding: 22px; text-align: center; color: #ffffff;">
                  <h2 style="margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.5px;">ALERTO SECURITY NOTICE</h2>
                </div>
                <div style="padding: 26px; color: #1a202c; line-height: 1.6;">
                  <p style="font-size: 15px;">Dear <strong>${recipientName}</strong>,</p>
                  <p style="font-size: 14px; color: #4a5568;">
                    This is an automated notification to inform you that a successful sign-in to your Alerto account was recorded.
                  </p>
                  
                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: 600; width: 130px; color: #718096;">Date &amp; Time:</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #2d3748;">${loginDate} (PHT)</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #718096;">Account Email:</td>
                      <td style="padding: 8px 0; color: #2d3748;">${user.email}</td>
                    </tr>
                  </table>

                  <p style="font-size: 13px; color: #4a5568;">
                    • If this was you, you can safely disregard this message.<br/>
                    • If you did not authorize this access, please change your password immediately in the app and report the incident to <a href="mailto:alerto.system2026@gmail.com" style="color: #3b4fb0; text-decoration: none; font-weight: 500;">alerto.system2026@gmail.com</a>.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #edf2f7; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                    Alerto Security Team<br/>
                    Support Contact: <a href="mailto:alerto.system2026@gmail.com" style="color: #a0aec0;">alerto.system2026@gmail.com</a>
                  </p>
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
