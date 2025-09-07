import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has completed preferences
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      include: {
        track: true,
        topicInterests: {
          include: {
            topic: true,
          },
        },
        confidenceScores: true,
      },
    });

    if (!userPreferences) {
      return NextResponse.json({
        hasPreferences: false,
        message: "User preferences not found. Please complete onboarding.",
      });
    }

    // Check if preferences are complete
    const isComplete = 
      userPreferences.track &&
      userPreferences.topicInterests.length > 0 &&
      userPreferences.confidenceScores.length > 0;

    return NextResponse.json({
      hasPreferences: true,
      isComplete,
      track: userPreferences.track?.name,
      topicsCount: userPreferences.topicInterests.length,
      confidenceScoresCount: userPreferences.confidenceScores.length,
    });

  } catch (error) {
    console.error("Error checking user preferences:", error);
    return NextResponse.json(
      { error: "Failed to check user preferences" },
      { status: 500 }
    );
  }
}
