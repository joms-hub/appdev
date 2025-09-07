interface ActivityProgress {
  id: string;
  phaseId: string;
  activityIndex: number;
  name: string;
  description?: string;
  type: string;
  estimatedHours: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface RoadmapPhase {
  id: string;
  roadmapId: string;
  phaseIndex: number;
  name: string;
  description: string;
  estimatedDays: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  activities: ActivityProgress[];
}

interface UserRoadmap {
  id: string;
  userId: string;
  title: string;
  description: string;
  trackName: string;
  difficulty: string;
  totalDays: number;
  totalActivities: number;
  overallProgress: number;
  createdAt: Date;
  updatedAt: Date;
  phases: RoadmapPhase[];
}
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's roadmap with all related data
    const userRoadmap = await prisma.userRoadmap.findUnique({
      where: { userId },
      include: {
        phases: {
          include: {
            activities: {
              orderBy: { activityIndex: 'asc' }
            }
          },
          orderBy: { phaseIndex: 'asc' }
        }
      }
    });

    if (!userRoadmap) {
      return NextResponse.json({ 
        hasRoadmap: false,
        message: "No roadmap found for user" 
      });
    }

    // Calculate comprehensive analytics
  const allActivities = userRoadmap.phases.flatMap((phase: RoadmapPhase) => phase.activities);
  const completedActivities = allActivities.filter((activity: ActivityProgress) => activity.completed);
    const totalActivities = allActivities.length;
    const completionRate = totalActivities > 0 ? Math.round((completedActivities.length / totalActivities) * 100) : 0;

    // Calculate learning streak (consecutive days with completed activities)
    const completedDates = completedActivities
  .filter((activity: ActivityProgress) => activity.completedAt)
  .map((activity: ActivityProgress) => activity.completedAt!.toDateString())
  .filter((date: string, index: number, arr: string[]) => arr.indexOf(date) === index) // Remove duplicates
      .sort()
      .reverse();

    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (completedDates.length > 0) {
      if (completedDates[0] === today || completedDates[0] === yesterday) {
        let checkDate = new Date();
        if (completedDates[0] === yesterday) {
          checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        }
        
        for (const dateStr of completedDates) {
          if (dateStr === checkDate.toDateString()) {
            currentStreak++;
            checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
          } else {
            break;
          }
        }
      }
    }

    // Get current phase info
  const currentPhase = userRoadmap.phases.find((phase: RoadmapPhase) => phase.progress < 100) || userRoadmap.phases[userRoadmap.phases.length - 1];
    const currentPhaseProgress = currentPhase?.progress || 0;

    // Get recent activities (last 5 completed)
    const recentActivities = completedActivities
      .filter((activity: ActivityProgress) => activity.completedAt)
      .sort((a: ActivityProgress, b: ActivityProgress) => b.completedAt!.getTime() - a.completedAt!.getTime())
      .slice(0, 5)
      .map((activity: ActivityProgress) => ({
        name: activity.name,
        type: activity.type,
        completedAt: activity.completedAt,
        phaseName: userRoadmap.phases.find((p: RoadmapPhase) => p.id === activity.phaseId)?.name || 'Unknown Phase'
      }));

    // Get next upcoming activity
  const nextActivity = allActivities.find((activity: ActivityProgress) => !activity.completed);
    const upcomingActivity = nextActivity ? {
      name: nextActivity.name,
      type: nextActivity.type,
      estimatedHours: nextActivity.estimatedHours,
  phaseName: userRoadmap.phases.find((p: RoadmapPhase) => p.id === nextActivity.phaseId)?.name || 'Unknown Phase'
    } : null;

    // Calculate estimated completion date
  const remainingActivities = allActivities.filter((activity: ActivityProgress) => !activity.completed);
  const totalRemainingHours = remainingActivities.reduce((sum: number, activity: ActivityProgress) => sum + activity.estimatedHours, 0);
    const estimatedDaysRemaining = Math.ceil(totalRemainingHours / 2); // Assuming 2 hours per day
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysRemaining);

    const analytics = {
      hasRoadmap: true,
      roadmapTitle: userRoadmap.title,
      trackName: userRoadmap.trackName,
      difficulty: userRoadmap.difficulty,
      overallProgress: Math.round(userRoadmap.overallProgress),
      
      // Progress Statistics
      completionRate,
      completedActivities: completedActivities.length,
      totalActivities,
      currentStreak,
      
      // Current Phase Info
      currentPhase: currentPhase ? {
        name: currentPhase.name,
        progress: Math.round(currentPhaseProgress),
        phaseIndex: currentPhase.phaseIndex + 1,
        totalPhases: userRoadmap.phases.length
      } : null,
      
      // Learning Insights
      recentActivities,
      upcomingActivity,
      estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
      estimatedDaysRemaining,
      
      // Time Analytics
  totalEstimatedHours: allActivities.reduce((sum: number, activity: ActivityProgress) => sum + activity.estimatedHours, 0),
  completedHours: completedActivities.reduce((sum: number, activity: ActivityProgress) => sum + activity.estimatedHours, 0),
      remainingHours: totalRemainingHours,
      
      // Activity Type Breakdown
      activityTypeBreakdown: {
        projects: allActivities.filter((a: ActivityProgress) => a.type === 'project').length,
        quizzes: allActivities.filter((a: ActivityProgress) => a.type === 'quiz').length,
        exercises: allActivities.filter((a: ActivityProgress) => a.type === 'exercise').length,
        reading: allActivities.filter((a: ActivityProgress) => a.type === 'reading').length,
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    );
  }
}
