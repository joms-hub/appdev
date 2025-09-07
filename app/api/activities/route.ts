import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId, completed } = await request.json();

    if (!activityId || typeof completed !== 'boolean') {
      return NextResponse.json({ 
        error: "Activity ID and completion status are required" 
      }, { status: 400 });
    }

    // Update the activity completion status
    const updatedActivity = await prisma.activityProgress.update({
      where: { id: activityId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        phase: {
          include: {
            roadmap: true,
            activities: true,
          },
        },
      },
    });

    // Calculate phase progress
    const phaseActivities = updatedActivity.phase.activities;
  const completedActivities = phaseActivities.filter((a: { completed: boolean }) => a.completed).length;
    const phaseProgress = (completedActivities / phaseActivities.length) * 100;

    // Update phase progress
    await prisma.roadmapPhase.update({
      where: { id: updatedActivity.phase.id },
      data: { progress: phaseProgress },
    });

    // Calculate overall roadmap progress
    const allPhases = await prisma.roadmapPhase.findMany({
      where: { roadmapId: updatedActivity.phase.roadmapId },
      include: { activities: true },
    });

  const totalActivities = allPhases.reduce((sum: number, phase: { activities: { completed: boolean }[] }) => sum + phase.activities.length, 0);
    const totalCompleted = allPhases.reduce(
  (sum: number, phase: { activities: { completed: boolean }[] }) => sum + phase.activities.filter((a: { completed: boolean }) => a.completed).length, 
      0
    );
    const overallProgress = totalActivities > 0 ? (totalCompleted / totalActivities) * 100 : 0;

    // Update roadmap overall progress
    await prisma.userRoadmap.update({
      where: { id: updatedActivity.phase.roadmapId },
      data: { overallProgress },
    });

    return NextResponse.json({
      success: true,
      activity: {
        id: updatedActivity.id,
        completed: updatedActivity.completed,
        completedAt: updatedActivity.completedAt,
      },
      phaseProgress,
      overallProgress,
    });

  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}
