import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if already confirmed
    if (verificationToken.confirmedAt) {
      return NextResponse.json(
        { error: "Email has already been verified" },
        { status: 400 }
      );
    }

    // Update user as verified and mark token as confirmed
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { confirmedAt: new Date() },
      }),
    ]);

    return NextResponse.json(
      { 
        success: true,
        message: "Email verified successfully! You can now sign in." 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Email verification error:", error);
    
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
