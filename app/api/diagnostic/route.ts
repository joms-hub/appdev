import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // 1. Check environment variables
    const envCheck = {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
    };

    // 2. Test JWT token (middleware method)
    let jwtResult: { 
      success: boolean; 
      error: string | null; 
      data: { userId: unknown; email: string | null | undefined; onboardingCompleted: unknown } | null; 
      timing: number 
    } = { 
      success: false, 
      error: null, 
      data: null, 
      timing: 0 
    };
    try {
      const jwtStart = Date.now();
      const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
      });
      jwtResult = {
        success: true,
        error: null,
        data: token ? {
          userId: token.id,
          email: token.email,
          onboardingCompleted: token.onboardingCompleted,
        } : null,
        timing: Date.now() - jwtStart
      };
    } catch (error) {
      jwtResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown JWT error',
        data: null,
        timing: Date.now() - startTime
      };
    }

    // 3. Test server auth (dashboard method)
    let authResult: { 
      success: boolean; 
      error: string | null; 
      data: { userId: string | undefined; email: string | undefined } | null; 
      timing: number 
    } = { 
      success: false, 
      error: null, 
      data: null, 
      timing: 0 
    };
    try {
      const authStart = Date.now();
      const session = await auth();
      authResult = {
        success: true,
        error: null,
        data: session ? {
          userId: session.user?.id,
          email: session.user?.email,
        } : null,
        timing: Date.now() - authStart
      };
    } catch (error) {
      authResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown auth error',
        data: null,
        timing: Date.now() - startTime
      };
    }

    // 4. Test database connection
    let dbResult: { success: boolean; error: string | null; timing: number } = { 
      success: false, 
      error: null, 
      timing: 0 
    };
    try {
      const dbStart = Date.now();
      const { prisma } = await import("@/lib/prisma");
      await prisma.$connect();
      await prisma.user.count();
      await prisma.$disconnect();
      dbResult = {
        success: true,
        error: null,
        timing: Date.now() - dbStart
      };
    } catch (error) {
      dbResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown DB error',
        timing: Date.now() - startTime
      };
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      jwt: jwtResult,
      auth: authResult,
      database: dbResult,
      totalTime,
      status: "DIAGNOSTIC_COMPLETE"
    });

  } catch (error) {
    return NextResponse.json({
      error: "Diagnostic failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
