import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If the request is for PostHog proxy or other public metrics, skip auth logic
    if (pathname.startsWith('/ph')) {
      return NextResponse.next();
    }

    // If user is authenticated but has no role, redirect to role selection
    if (
      token && 
      !token.role && 
      pathname !== "/select-role" && 
      pathname !== "/auth" && 
      pathname !== "/" &&
      !pathname.startsWith("/api/") &&
      !pathname.startsWith("/_next/") &&
      !pathname.includes(".")
    ) {
      return NextResponse.redirect(new URL("/select-role", req.url));
    }

    // If user has role but is on select-role page, redirect to dashboard
    if (token && token.role && pathname === "/select-role") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public pages (including PostHog proxy)
        if (
          pathname === "/" || 
          pathname === "/about" ||
          pathname === "/auth" || 
          pathname.startsWith("/auth/verify-email") ||
          pathname.startsWith("/auth/resend-verification") ||
          pathname.startsWith("/auth/forgot-password") ||
          pathname.startsWith("/auth/reset-password") ||
          pathname.startsWith("/api/") ||
          pathname.startsWith("/_next/") ||
          pathname.startsWith("/ph") ||
          pathname.includes(".")
        ) {
          return true;
        }

        // For select-role page, require authentication but not role
        if (pathname === "/select-role") {
          return !!token;
        }

        // For protected pages, require authentication and role
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Exclude API, next internals, static assets, favicon and PostHog proxy paths
    "/((?!api/auth|_next/static|_next/image|favicon.ico|ph).*)",
  ],
};
