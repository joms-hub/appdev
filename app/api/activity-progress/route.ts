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
      return NextResponse.json({ error: "Activity ID and completion status are required" }, { status: 400 });
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
          }
        }
      }
    });

    // Calculate phase progress
    const phaseActivities = updatedActivity.phase.activities;
  const completedActivities = phaseActivities.filter((activity: { completed: boolean }) => activity.completed);
    const phaseProgress = (completedActivities.length / phaseActivities.length) * 100;

    // Update phase progress
    await prisma.roadmapPhase.update({
      where: { id: updatedActivity.phase.id },
      data: { progress: phaseProgress }
    });

    // Calculate overall roadmap progress
    const allPhases = await prisma.roadmapPhase.findMany({
      where: { roadmapId: updatedActivity.phase.roadmapId },
      include: { activities: true }
    });

    let totalActivities = 0;
    let totalCompletedActivities = 0;

    allPhases.forEach((phase: { activities: { completed: boolean }[] }) => {
      totalActivities += phase.activities.length;
      totalCompletedActivities += phase.activities.filter((activity: { completed: boolean }) => activity.completed).length;
    });

    const overallProgress = totalActivities > 0 ? (totalCompletedActivities / totalActivities) * 100 : 0;

    // Update roadmap progress
    await prisma.userRoadmap.update({
      where: { id: updatedActivity.phase.roadmapId },
      data: { overallProgress }
    });

    return NextResponse.json({ 
      success: true, 
      activity: updatedActivity,
      phaseProgress,
      overallProgress 
    });

  } catch (error) {
    console.error("Error updating activity progress:", error);
    return NextResponse.json(
      { error: "Failed to update activity progress" },
      { status: 500 }
    );
  }
}
