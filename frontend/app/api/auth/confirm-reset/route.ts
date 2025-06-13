import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcrypt";

const confirmResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = confirmResetSchema.parse(body);

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new password reset." },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "This reset token has already been used. Please request a new password reset if needed." },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hash(password, 12);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json(
      { 
        success: true,
        message: "Password reset successfully! You can now sign in with your new password." 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Password reset confirmation error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
