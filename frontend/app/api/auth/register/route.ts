import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";
// @ts-ignore - nodemailer types not available
const nodemailer = require("nodemailer");

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.string().min(1, "Role is required"),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
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

// Send verification email
const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@talentsync.ai',
    to: email,
    subject: "Verify your email address - TalentSync AI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Welcome to TalentSync AI!</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hello ${name || 'there'},</p>
          <p>Thank you for creating an account with TalentSync AI. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
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
    const validatedData = registerSchema.parse(body);
    
    const { name, email, password, roleId, avatarUrl } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user and verification token in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          roleId,
          image: avatarUrl || null,
          isVerified: false, // Will be set to true after email verification
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create verification token
      await tx.emailVerificationToken.create({
        data: {
          token: verificationToken,
          expiresAt: tokenExpiresAt,
          userId: newUser.id,
        },
      });

      return newUser;
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the registration if email sending fails
      // User can always request a new verification email
    }

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.",
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
