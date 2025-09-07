import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check if user exists and has credentials account
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Account: true,
      },
    });

    // For security, always return success message even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, we've sent you password reset instructions."
      });
    }

    // Check if user has a credentials account (not just OAuth)
    const hasCredentialsAccount = user.Account.some((account) => account.provider === 'credentials');
    if (!hasCredentialsAccount) {
      // User only has OAuth accounts, still return success for security
      return NextResponse.json({
        message: "If an account with that email exists, we've sent you password reset instructions."
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    try {
      // Send email in production, fallback to console in development
      if (process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
        await sendPasswordResetEmail({
          to: email,
          resetUrl,
        });
      } else {
        // Development fallback - log to console
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Development Mode - Password Reset Link:');
          console.log('Email:', email);
          console.log('Reset URL:', resetUrl);
          console.log('Token expires:', resetTokenExpiry.toISOString());
        }
      }
    } catch (emailError) {
      if (process.env.NODE_ENV === "development") { console.error('Email sending failed:', emailError); }
      // Don't fail the request if email fails - user still gets success message for security
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent you password reset instructions.",
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === 'development' && {
        resetUrl,
        note: "Check console for reset link (development only)"
      })
    });

  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error("Error in forgot password:", error); }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
