import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { mobileRegisterSchema, validateInput, formatValidationError } from '@/lib/validationSchemas';

async function sendRegistrationOtpEmail(user: { email: string; name: string | null }, otp: string) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      console.warn('Missing SendGrid config, skipping registration OTP email.');
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
            value: `Dear ${recipientName},\n\nThank you for registering with Alerto. To complete your account verification, please enter the One-Time Password (OTP) below:\n\n${otp}\n\nThis code is valid for ten (10) minutes.\n\nIf you did not initiate this request, please disregard this message or contact us at alerto.system2026@gmail.com.\n\nSincerely,\nAlerto Verification Services\nalerto.system2026@gmail.com`,
          },
          {
            type: 'text/html',
            value: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #0b1723; padding: 22px; text-align: center; color: #ffffff;">
                  <h2 style="margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.5px;">ALERTO ACCOUNT VERIFICATION</h2>
                </div>
                <div style="padding: 28px; color: #1a202c; line-height: 1.6;">
                  <p style="font-size: 15px;">Dear <strong>${recipientName}</strong>,</p>
                  <p style="font-size: 14px; color: #4a5568;">
                    Thank you for registering with Alerto. To complete your account creation and verify your email address, please use the One-Time Password (OTP) provided below:
                  </p>
                  
                  <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                    <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0b1723; font-family: monospace;">
                      ${otp}
                    </div>
                    <p style="margin: 8px 0 0 0; color: #718096; font-size: 13px;">
                      This verification code expires in <strong>10 minutes</strong>.
                    </p>
                  </div>

                  <p style="font-size: 13px; color: #4a5568;">
                    <strong>Security Reminders:</strong><br/>
                    • Never share this code with anyone.<br/>
                    • If you did not register for an Alerto account, please disregard this email or report the incident to <a href="mailto:alerto.system2026@gmail.com" style="color: #3b4fb0; text-decoration: none;">alerto.system2026@gmail.com</a>.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #edf2f7; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                    Alerto Verification Services<br/>
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
      console.error('Registration OTP email failed:', response.status, errorText);
    } else {
      console.log('Registration OTP email sent successfully to:', user.email);
    }
  } catch (e) {
    console.error('Failed to send registration OTP email:', e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = validateInput(mobileRegisterSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatValidationError(validation.errors!) },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      if (existingUser.status === 'Active') {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
      } else {
        // Update pending unverified account
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            name: name || normalizedEmail.split('@')[0],
            otpCode: otp,
            otpExpires,
          },
        });

        void sendRegistrationOtpEmail({ email: normalizedEmail, name }, otp);

        return NextResponse.json({
          success: true,
          requireOtp: true,
          email: normalizedEmail,
          message: "Verification code sent to your email.",
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || normalizedEmail.split('@')[0],
        role: "USER",
        status: "PendingVerification",
        otpCode: otp,
        otpExpires,
      },
    });

    void sendRegistrationOtpEmail({ email: user.email, name: user.name }, otp);

    return NextResponse.json({
      success: true,
      requireOtp: true,
      email: user.email,
      message: "Verification code sent to your email.",
    });

  } catch (error) {
    console.error("Registration API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
