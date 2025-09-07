import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    const isAuthenticated = !!token;
    const pathname = request.nextUrl.pathname;
    
    // Define route types
    const publicRoutes = ["/login", "/sign-up"];
    const onboardingRoute = "/track-selection";
    const protectedRoutes = ["/dashboard", "/roadmap", "/settings"];
    
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isOnboardingRoute = pathname.startsWith(onboardingRoute);
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    console.log(`[MIDDLEWARE] ${pathname} - Auth: ${isAuthenticated}, OnboardingCompleted: ${token?.onboardingCompleted}`);

    // Handle unauthenticated users
    if (!isAuthenticated) {
      if (isPublicRoute) {
        return NextResponse.next();
      }
      console.log(`[MIDDLEWARE] Redirecting unauthenticated user from ${pathname} to /login`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Handle authenticated users
    if (isAuthenticated && token?.id) {
      const hasCompletedOnboarding = token.onboardingCompleted === true;

      // If onboarding is completed
      if (hasCompletedOnboarding) {
        // Redirect away from public routes
        if (isPublicRoute) {
          console.log(`[MIDDLEWARE] Redirecting completed user from ${pathname} to /dashboard`);
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        
        // Redirect away from onboarding
        if (isOnboardingRoute) {
          console.log(`[MIDDLEWARE] Redirecting completed user from onboarding to /dashboard`);
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        
        // Allow access to protected routes
        if (isProtectedRoute) {
          console.log(`[MIDDLEWARE] Allowing access to protected route: ${pathname}`);
          return NextResponse.next();
        }
      } else {
        // If onboarding is NOT completed
        // Allow access to onboarding route
        if (isOnboardingRoute) {
          console.log(`[MIDDLEWARE] Allowing access to onboarding: ${pathname}`);
          return NextResponse.next();
        }
        
        // Redirect from protected routes to onboarding
        if (isProtectedRoute) {
          console.log(`[MIDDLEWARE] Redirecting incomplete user from ${pathname} to /track-selection`);
          return NextResponse.redirect(new URL("/track-selection", request.url));
        }
        
        // Redirect from public routes to onboarding (user is logged in but needs onboarding)
        if (isPublicRoute) {
          console.log(`[MIDDLEWARE] Redirecting incomplete user from ${pathname} to /track-selection`);
          return NextResponse.redirect(new URL("/track-selection", request.url));
        }
      }
    }

    console.log(`[MIDDLEWARE] Default: allowing access to ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error(`[MIDDLEWARE] Error processing ${request.nextUrl.pathname}:`, error);
    // On error, allow the request to proceed to avoid breaking the app
    // This is better than blocking legitimate users due to auth service issues
    return NextResponse.next();
  }
}

// Apply middleware to protected routes
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/roadmap/:path*", 
    "/settings/:path*", 
    "/track-selection/:path*",
    "/login",
    "/sign-up"
  ],
};
