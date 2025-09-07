import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {// Test basic auth function
    let authResult = null;
    try {
      authResult = await auth();} catch (authError) {
      if (process.env.NODE_ENV === "development") { console.error("❌ Auth function error:", authError); }
    }
    
    // Test environment variables
    const envCheck = {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    };// Test database connection
    let dbTest = null;
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$connect();
      dbTest = "Connected";
      await prisma.$disconnect();
    } catch (dbError) {
      if (process.env.NODE_ENV === "development") { console.error("❌ Database error:", dbError); }
      dbTest = `Error: ${dbError instanceof Error ? dbError.message : 'Unknown'}`;
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      auth: authResult ? { 
        userId: authResult.user?.id,
        email: authResult.user?.email,
      } : null,
      environment: envCheck,
      database: dbTest,
      status: "OK"
    });
    
  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error("❌ Auth test failed:", error); }
    return NextResponse.json({
      error: "Auth test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
