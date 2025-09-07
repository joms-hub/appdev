import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roadmapData } = await request.json();

    if (!roadmapData) {
      return NextResponse.json({ error: "Roadmap data is required" }, { status: 400 });
    }

    // Save or update the user's roadmap
    const savedRoadmap = await prisma.userRoadmap.upsert({
      where: { userId: session.user.id },
      update: {
        title: roadmapData.title,
        description: roadmapData.description,
        trackName: roadmapData.trackName,
        difficulty: roadmapData.difficultyLevel,
        totalDays: roadmapData.estimatedDays,
        totalActivities: roadmapData.totalActivities,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        title: roadmapData.title,
        description: roadmapData.description,
        trackName: roadmapData.trackName,
        difficulty: roadmapData.difficultyLevel,
        totalDays: roadmapData.estimatedDays,
        totalActivities: roadmapData.totalActivities,
      },
    });

    // Delete existing phases and create new ones
    await prisma.roadmapPhase.deleteMany({
      where: { roadmapId: savedRoadmap.id },
    });

    // Create phases with activities
    for (let i = 0; i < roadmapData.phases.length; i++) {
      const phase = roadmapData.phases[i];
      
      const savedPhase = await prisma.roadmapPhase.create({
        data: {
          roadmapId: savedRoadmap.id,
          phaseIndex: i,
          name: phase.name,
          description: phase.description,
          estimatedDays: phase.estimatedDays,
        },
      });

      // Create activities for this phase
      for (let j = 0; j < phase.activities.length; j++) {
        const activity = phase.activities[j];
        
        await prisma.activityProgress.create({
          data: {
            phaseId: savedPhase.id,
            activityIndex: j,
            name: activity.name,
            description: activity.description,
            type: activity.type,
            estimatedHours: activity.estimatedHours,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      roadmapId: savedRoadmap.id,
    });

  } catch (error) {
    console.error("Error saving roadmap:", error);
    return NextResponse.json(
      { error: "Failed to save roadmap" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's saved roadmap with progress
    const roadmap = await prisma.userRoadmap.findUnique({
      where: { userId: session.user.id },
      include: {
        phases: {
          orderBy: { phaseIndex: 'asc' },
          include: {
            activities: {
              orderBy: { activityIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "No roadmap found" }, { status: 404 });
    }

    // Transform the data back to the frontend format
    const transformedRoadmap = {
      title: roadmap.title,
      description: roadmap.description,
      difficultyLevel: roadmap.difficulty,
      estimatedDays: roadmap.totalDays,
      totalActivities: roadmap.totalActivities,
      trackName: roadmap.trackName,
      userTopics: [], // TODO: Fetch from user preferences
      confidenceLevel: 3.5, // TODO: Calculate from user preferences
      progress: roadmap.overallProgress,
      phases: roadmap.phases.map((phase: {
        name: string;
        description: string;
        estimatedDays: number;
        progress: number;
        activities: { id: string; name: string }[];
      }) => ({
        name: phase.name,
        description: phase.description,
        objectives: [], // TODO: Store in database or generate
        topics: [], // TODO: Store in database or generate
        estimatedDays: phase.estimatedDays,
        prerequisites: [], // TODO: Store in database or generate
        progress: phase.progress,
        activities: phase.activities.map((activity: {
          id: string;
          name: string;
          description?: string;
          type?: string;
          estimatedHours?: number;
          completed?: boolean;
          completedAt?: Date;
        }) => ({
          id: activity.id,
          name: activity.name,
          description: activity.description || `${activity.type} activity`,
          type: activity.type,
          estimatedHours: activity.estimatedHours,
          completed: activity.completed,
          completedAt: activity.completedAt?.toISOString(),
        })),
      })),
    };

    return NextResponse.json({
      success: true,
      roadmap: transformedRoadmap,
    });

  } catch (error) {
    console.error("Error loading roadmap:", error);
    return NextResponse.json(
      { error: "Failed to load roadmap" },
      { status: 500 }
    );
  }
}
