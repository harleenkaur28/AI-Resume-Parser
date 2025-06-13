import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
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
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (process.env.NODE_ENV === "development") {
        console.log("SignIn callback:", { user: { ...user, image: user.image }, account: account?.provider, profile: profile?.picture });
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
