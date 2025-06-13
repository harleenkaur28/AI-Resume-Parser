import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            role: true
          }
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Check if user is verified for email-based accounts
        if (!user.isVerified) {
          throw new Error("Please verify your email before signing in. Check your inbox for a verification link.");
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role?.name,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  events: {
    async createUser({ user }: { user: any }) {
      // Set isVerified to true for OAuth users (they don't have passwordHash)
      if (!user.email) return;
      
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email }
      });
      
      if (dbUser && !dbUser.passwordHash && !dbUser.isVerified) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { isVerified: true }
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (process.env.NODE_ENV === "development") {
        console.log("SignIn callback:", { user: { ...user, image: user.image }, account: account?.provider, profile: profile?.picture });
      }
      
      // For OAuth providers (Google, GitHub), automatically mark as verified
      if (account?.provider && account.provider !== "credentials" && account.provider !== "email") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (existingUser && !existingUser.isVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { isVerified: true }
            });
          }
        } catch (error) {
          console.error("Error updating OAuth user verification status:", error);
        }
      }
      
      // For credentials provider, check if user is verified
      if (account?.provider === "credentials") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (dbUser && !dbUser.isVerified) {
            return "/auth/verify-email?error=unverified";
          }
        } catch (error) {
          console.error("Error checking user verification status:", error);
          return false;
        }
      }
      
      // For OAuth providers, ensure image is captured
      if (account?.provider !== "credentials" && profile?.picture && !user.image) {
        user.image = profile.picture;
      }
      
      return true;
    },
    async session({ session, token }: any) {
      if (process.env.NODE_ENV === "development") {
        console.log("Session callback:", { session, token });
      }
      if (token.sub && session.user) {
        (session.user as { id: string }).id = token.sub;
        (session.user as { role?: string }).role = token.role as string;
        // Ensure image is properly passed from token to session
        if (token.picture) {
          session.user.image = token.picture;
        }
      }
      return session;
    },
    async jwt({ token, user, account, trigger }: any) {
      if (process.env.NODE_ENV === "development") {
        console.log("JWT callback:", { token, user, account, trigger });
      }
      // If this is a token refresh or update, fetch the latest user data
      if (trigger === "update" || (token.sub && !user)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { role: true }
        });
        if (dbUser) {
          token.role = dbUser.role?.name;
          // Always update the image from database on token refresh
          token.picture = dbUser.image;
        }
      } else if (user) {
        // For OAuth users, check if they have a role
        if (account?.provider !== "credentials") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { role: true }
          });
          token.role = dbUser?.role?.name;
          // Preserve the image for OAuth users
          if (user.image) {
            token.picture = user.image;
          }
        } else {
          token.role = (user as { role?: string }).role;
          // For credentials users, preserve image if available
          if (user.image) {
            token.picture = user.image;
          }
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth", 
  },
  debug: process.env.NODE_ENV === "development",
};
