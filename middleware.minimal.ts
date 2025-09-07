import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    const pathname = request.nextUrl.pathname;
    const isAuthenticated = !!token;
    
    console.log(`[MINIMAL MIDDLEWARE] ${pathname} - Auth: ${isAuthenticated}`);

    // Public routes that don't need auth
    if (pathname.startsWith("/login") || pathname.startsWith("/sign-up")) {
      if (isAuthenticated) {
        // Redirect authenticated users away from auth pages
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Protected routes that need auth
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/roadmap") || pathname.startsWith("/settings")) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }

    // All other routes - allow through
    return NextResponse.next();
    
  } catch (error) {
    console.error(`[MINIMAL MIDDLEWARE] Error:`, error);
    // On error, allow through to avoid blocking users
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/roadmap/:path*", 
    "/settings/:path*",
    "/login",
    "/sign-up"
  ],
};
