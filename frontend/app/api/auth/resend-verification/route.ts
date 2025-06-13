import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

const resendVerificationSchema = z.object({
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resendVerificationSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Check if user signed up with OAuth (they shouldn't need email verification)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account was created with OAuth and doesn't require email verification" },
        { status: 400 }
      );
    }

    // Delete any existing verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create verification token
    await prisma.emailVerificationToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Send verification email using NextAuth's email configuration
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
    
    try {
      const transporter = createTransporter();
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@talentsync.ai',
        to: email,
        subject: "Verify your email address - TalentSync AI",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Hello ${user.name || 'there'},</p>
              <p>Thank you for creating an account with TalentSync AI. To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #76ABAE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                  Verify Email Address
                </a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Verification email sent successfully. Please check your inbox." 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Resend verification error:", error);
    
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
