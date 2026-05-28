import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId?: string; adminId?: string }> }
) {
  try {
    const resolvedParams = await params; 
    const rawId = resolvedParams.id || resolvedParams.userId || resolvedParams.adminId;
    
    if (!rawId) {
      return NextResponse.json({ error: "Missing ID in URL" }, { status: 400 });
    }
    const cleanId = rawId.trim();

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const passwordRules = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>\-_]/.test(password),
    };

    const isPasswordStrong = Object.values(passwordRules).every(rule => rule === true);
    if (!isPasswordStrong) {
      return NextResponse.json({
        error: 'Password does not meet security requirements. Must include uppercase, lowercase, number, and special character.'
      }, { status: 400 });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { id: cleanId }
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Account not found in the Admin database." }, 
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.update({
      where: { id: cleanId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
    
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Could not update password." }, 
      { status: 500 }
    );
  }
}