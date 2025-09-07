import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: true, // This was the only critical fix needed for Vercel
  });

  const isAuthenticated = !!token?.id;
  const pathname = request.nextUrl.pathname;
  
  // Define route types
  const publicRoutes = ["/login", "/sign-up"];
  const onboardingRoute = "/track-selection";
  const protectedRoutes = ["/dashboard", "/roadmap", "/settings"];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isOnboardingRoute = pathname.startsWith(onboardingRoute);
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Handle unauthenticated users
  if (!isAuthenticated) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle authenticated users
  if (isAuthenticated && token?.id) {
    const hasCompletedOnboarding = token.onboardingCompleted === true;

    // If onboarding is completed
    if (hasCompletedOnboarding) {
      // Redirect away from public routes
      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      // Redirect away from onboarding
      if (isOnboardingRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      // Allow access to protected routes
      if (isProtectedRoute) {
        return NextResponse.next();
      }
    } else {
      // If onboarding is NOT completed
      // Allow access to onboarding route
      if (isOnboardingRoute) {
        return NextResponse.next();
      }
      
      // Redirect from protected routes to onboarding
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/track-selection", request.url));
      }
      
      // Redirect from public routes to onboarding (user is logged in but needs onboarding)
      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/track-selection", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Apply middleware to protected routes
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*", 
    "/roadmap",
    "/roadmap/:path*", 
    "/settings",
    "/settings/:path*", 
    "/track-selection",
    "/track-selection/:path*",
    "/login",
    "/sign-up"
  ],
};
