import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { resetPasswordSchema, validateInput, formatValidationError } from "@/lib/validationSchemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with zod schema
    const validation = validateInput(resetPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatValidationError(validation.errors!) },
        { status: 400 }
      );
    }

    const { token } = body;
    const { password } = validation.data;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }

    const hashedToken = hashPasswordResetToken(token);

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password API error:", error);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
