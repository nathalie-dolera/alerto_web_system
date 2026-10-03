import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true },
    });

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      console.warn('Missing SendGrid configuration in backend .env');
      return NextResponse.json({ success: true, message: 'SendGrid not configured, skipped' });
    }

    const recipientName = user?.name?.trim() || 'User';
    const alertDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: normalizedEmail }],
            subject: 'Security Notice: Account Temporarily Locked Due to Multiple Failed Attempts',
          },
        ],
        from: {
          email: fromEmail,
          name: 'Alerto Security',
        },
        content: [
          {
            type: 'text/plain',
            value: `Dear ${recipientName},\n\nWe detected three (3) consecutive failed password attempts on your Alerto account.\n\nFor your security, access on this device has been temporarily suspended for fifteen (15) minutes.\n\nDate and Time: ${alertDate} (PHT)\nAccount: ${normalizedEmail}\n\nIf you have forgotten your password, please utilize the "Forgot Password" feature in the mobile application to securely reset your credentials.\n\nIf you did not initiate these login attempts, please contact our support team immediately at alerto.system2026@gmail.com.\n\nSincerely,\nAlerto Security Team\nalerto.system2026@gmail.com`,
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
                    This automated security notification is to inform you that three (3) consecutive failed password attempts were detected on your account.
                  </p>
                  
                  <div style="background-color: #f7fafc; border-left: 4px solid #3b4fb0; padding: 14px 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #2d3748; font-weight: 600; font-size: 14px;">
                      Temporary Account Lockout
                    </p>
                    <p style="margin: 4px 0 0 0; color: #4a5568; font-size: 13px;">
                      Login attempts on this device have been suspended for <strong>15 minutes</strong> to prevent unauthorized access.
                    </p>
                  </div>

                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: 600; width: 130px; color: #718096;">Date &amp; Time:</td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #2d3748;">${alertDate} (PHT)</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #718096;">Account Email:</td>
                      <td style="padding: 8px 0; color: #2d3748;">${normalizedEmail}</td>
                    </tr>
                  </table>

                  <p style="font-size: 13px; color: #4a5568;">
                    • If you forgot your password, please use the <strong>Forgot Password</strong> option in the mobile application to securely reset your credentials.<br/>
                    • If you did not perform these attempts, please contact our support team immediately at <a href="mailto:alerto.system2026@gmail.com" style="color: #3b4fb0; text-decoration: none; font-weight: 500;">alerto.system2026@gmail.com</a>.
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
      console.error('SendGrid Lockout Notice failed:', response.status, errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Formal lockout notice dispatched' });
  } catch (error) {
    console.error('Lockout Notice API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
