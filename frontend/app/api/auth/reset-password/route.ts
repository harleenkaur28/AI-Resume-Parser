import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@talentsync.ai',
    to: email,
    subject: "Reset your password - TalentSync AI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hello ${name || 'there'},</p>
          <p>We received a request to reset your password for your TalentSync AI account. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #76ABAE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">TalentSync AI - Your AI-powered recruitment platform</p>
        </div>
      </div>
    `,
  });
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resetPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether the email exists or not for security
      return NextResponse.json(
        { message: "If an account with this email exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    // Check if user signed up with OAuth (they don't have a password to reset)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account was created with OAuth and doesn't have a password to reset. Please sign in with your OAuth provider." },
        { status: 400 }
      );
    }

    // Delete any existing password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new reset token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create password reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.name || '', token);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return NextResponse.json(
        { error: "Failed to send password reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "If an account with this email exists, a password reset link has been sent." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Password reset error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email format", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
