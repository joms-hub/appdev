import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "../../../lib/generated/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const userPreferencesSchema = z.object({
  trackId: z.number().int().positive(),
  topicIds: z.array(z.number().int().positive()),
  confidence: z.array(z.number().int().min(0).max(5)).length(10),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = userPreferencesSchema.parse(data);

    // Check if user already has preferences
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (existingPreferences) {
      return NextResponse.json({ success: false, error: "User preferences already exist" }, { status: 400 });
    }

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: validatedData.trackId },
    });

    if (!track) {
      return NextResponse.json({ success: false, error: "Invalid track selected" }, { status: 400 });
    }

    // Verify all topics exist
    const topics = await prisma.topic.findMany({
      where: { id: { in: validatedData.topicIds } },
    });

    if (topics.length !== validatedData.topicIds.length) {
      return NextResponse.json({ success: false, error: "One or more invalid topics selected" }, { status: 400 });
    }

    // Create user preferences in a transaction
  await prisma.$transaction(async (tx) => {
      const userPreferences = await tx.userPreferences.create({
        data: {
          userId: session.user.id,
          trackId: validatedData.trackId,
        },
      });
      await tx.confidenceScore.createMany({
        data: validatedData.confidence.map((score, index) => ({
          preferencesId: userPreferences.id,
          questionId: index + 1, // 1-based question IDs
          score,
        })),
      });
      await tx.userTopicInterest.createMany({
        data: validatedData.topicIds.map((topicId) => ({
          userId: session.user.id,
          topicId,
          preferencesId: userPreferences.id,
        })),
      });
      return userPreferences;
    });
    // Force revalidation
    revalidatePath("/dashboard");
    revalidatePath("/track-selection");
    revalidatePath("/");

    // Create a response that will trigger a session refresh
    const response = NextResponse.json({ 
      success: true, 
      redirectUrl: "/dashboard",
      message: "Preferences saved successfully" 
    });

    // Force JWT token refresh by setting a header that the client can use
    response.headers.set('X-Refresh-Session', 'true');
    
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input data" }, { status: 400 });
    }

    if (process.env.NODE_ENV === "development") { console.error("Error saving user preferences:", error); }
    return NextResponse.json({ success: false, error: "Failed to save preferences" }, { status: 500 });
  }
}
