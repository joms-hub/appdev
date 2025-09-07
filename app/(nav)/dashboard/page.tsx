// app/(nav)/dashboard/page.tsx
export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";


export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  // Fetch user's roadmap and progress data
  const userRoadmap = await prisma.userRoadmap.findUnique({
    where: { userId: user.id },
    include: {
      phases: {
        include: {
          activities: true,
        },
        orderBy: { phaseIndex: 'asc' },
      },
    },
  });

  // Calculate progress statistics
  const progressStats = userRoadmap ? {
    overallProgress: Math.round(userRoadmap.overallProgress),
    totalActivities: userRoadmap.totalActivities,
    completedActivities: userRoadmap.phases.reduce(
      (total, phase) => total + phase.activities.filter(activity => activity.completed).length,
      0
    ),
    currentPhase: userRoadmap.phases.find(phase => phase.progress < 100) || userRoadmap.phases[userRoadmap.phases.length - 1],
    totalPhases: userRoadmap.phases.length,
    completedPhases: userRoadmap.phases.filter(phase => phase.progress === 100).length,
    estimatedDaysLeft: userRoadmap.totalDays - Math.floor(
      (userRoadmap.overallProgress / 100) * userRoadmap.totalDays
    ),
  } : null;

  return (
    <DashboardClient
      userName={user.firstName ?? user.name ?? "Friend"}
      hasRoadmap={!!userRoadmap}
      roadmapData={userRoadmap}
      progressStats={progressStats}
    />
  );
}
