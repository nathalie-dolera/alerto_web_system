import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, getPasswordResetLinks } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({
        error: "Email is required" 
      }, {
        status: 400 
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail 
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true 
      },
    });

    if (!user || user.status === "Inactive") {
      return NextResponse.json({
        success: true,
        message: "If an account exists for that email, a password reset link has been sent.",
      });
    }

    const { rawToken, hashedToken, expiresAt } = createPasswordResetToken();

    await prisma.user.update({
      where: {
        id: user.id 
      },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      },
    });

    const { webResetUrl } = getPasswordResetLinks(rawToken);

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      webResetUrl,
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Forgot password API error:", errorMsg);

    return NextResponse.json({
      error: errorMsg 
    }, {
      status: 500 
    });
  }
}
