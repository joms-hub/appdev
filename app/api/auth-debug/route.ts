import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {// Check environment variables
    const hasAuthSecret = !!process.env.AUTH_SECRET;
    const hasGoogleId = !!process.env.AUTH_GOOGLE_ID;
    const hasGoogleSecret = !!process.env.AUTH_GOOGLE_SECRET;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;// Try to get token using JWT method
    let jwtToken = null;
    try {
      jwtToken = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
      });} catch (jwtError) {
      if (process.env.NODE_ENV === "development") { console.error("❌ JWT Token Error:", jwtError); }
    }
    
    // Try to get session using auth()
    let session = null;
    try {
      session = await auth();} catch (sessionError) {
      if (process.env.NODE_ENV === "development") { console.error("❌ Session Error:", sessionError); }
    }
    
    // Check cookies
    const cookies = request.cookies.getAll();
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('auth') || 
      cookie.name.includes('session') ||
      cookie.name.includes('next-auth')
    );
    
    console.log("🍪 Auth Cookies:", authCookies.map(c => c.name));
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        AUTH_SECRET: hasAuthSecret,
        AUTH_GOOGLE_ID: hasGoogleId,
        AUTH_GOOGLE_SECRET: hasGoogleSecret,
        DATABASE_URL: hasDatabaseUrl,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
      },
      authentication: {
        jwtToken: jwtToken ? {
          userId: jwtToken.id,
          email: jwtToken.email,
          onboardingCompleted: jwtToken.onboardingCompleted,
        } : null,
        session: session ? {
          userId: session.user?.id,
          email: session.user?.email,
        } : null,
      },
      cookies: authCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0,
      })),
      headers: {
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      }
    };
    
    return NextResponse.json(diagnostics, { status: 200 });
    
  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error("❌ Auth Debug Error:", error); }
    return NextResponse.json({ 
      error: "Auth debug failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
