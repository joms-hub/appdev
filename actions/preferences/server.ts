"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { confidenceScoresToArray } from "@/lib/confidenceScoreUtils";

const userPreferencesSchema = z.object({
  trackId: z.number().int().positive(),
  topicIds: z.array(z.number().int().positive()),
  confidence: z.array(z.number().int().min(0).max(5)).length(10),
});

/**
 * Save user preferences after onboarding
 */
export async function saveUserPreferences(data: {
  trackId: number;
  topicIds: number[];
  confidence: number[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Validate input data
    const validatedData = userPreferencesSchema.parse(data);

    // Check if user already has preferences
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (existingPreferences) {
      return { success: false, error: "User preferences already exist" };
    }

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: validatedData.trackId },
    });

    if (!track) {
      return { success: false, error: "Invalid track selected" };
    }

    // Verify all topics exist
    const topics = await prisma.topic.findMany({
      where: { id: { in: validatedData.topicIds } },
    });

    if (topics.length !== validatedData.topicIds.length) {
      return { success: false, error: "One or more invalid topics selected" };
    }

    // Create user preferences in a transaction
    await prisma.$transaction(async (tx: PrismaClient) => {
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

    // Force a token refresh by revalidating auth-related paths
    revalidatePath("/dashboard");
    revalidatePath("/track-selection");
    revalidatePath("/");return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }

    if (process.env.NODE_ENV === "development") { console.error("Error saving user preferences:", error); }
    return { success: false, error: "Failed to save preferences" };
  }
}

/**
 * Check if user has completed onboarding (for polling after save)
 */
export async function checkOnboardingStatus(): Promise<{ completed: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { completed: false };
  }
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });
  return { completed: !!preferences };
}

/**
 * Check if user has completed onboarding
 */
export async function hasUserCompletedOnboarding(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });
  return !!preferences;
}
export async function getUserPreferences() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      include: {
        track: true,
        confidenceScores: {
          orderBy: { questionId: "asc" },
        },
        topicInterests: {
          include: {
            topic: true,
          },
        },
      },
    });

    return preferences;
  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error("Error fetching user preferences:", error); }
    return null;
  }
}

/**
 * Get all available tracks and topics for onboarding
 */
export async function getOnboardingData() {
  try {const [tracks, topics] = await Promise.all([
      prisma.track.findMany({
        orderBy: { id: "asc" },
      }),
      prisma.topic.findMany({
        orderBy: { id: "asc" },
      }),
    ]);const result = { tracks, topics };return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error("❌ Error fetching onboarding data:", error); }
    return { tracks: [], topics: [] };
  }
}
