"use client";

import Link from "next/link";
import Image from "next/image";
import ChatBox from "@/app/components/ChatBox";
import { useState } from "react";

// Type definitions for the roadmap data
interface ActivityProgress {
  id: string;
  name: string;
  description: string | null;
  type: string;
  completed: boolean;
  completedAt: Date | null;
}

interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  progress: number;
  activities: ActivityProgress[];
}

interface UserRoadmap {
  id: string;
  title: string;
  description: string;
  trackName: string;
  difficulty: string;
  totalDays: number;
  totalActivities: number;
  overallProgress: number;
  phases: RoadmapPhase[];
}

interface ProgressStats {
  overallProgress: number;
  totalActivities: number;
  completedActivities: number;
  currentPhase: RoadmapPhase;
  totalPhases: number;
  completedPhases: number;
  estimatedDaysLeft: number;
}

interface DashboardClientProps {
  userName: string;
  hasRoadmap: boolean;
  roadmapData?: UserRoadmap | null;
  progressStats?: ProgressStats | null;
}

export default function DashboardClient({ userName, hasRoadmap, roadmapData, progressStats }: DashboardClientProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-black pt-24 px-8 relative flex transition-all duration-500">
      <div className={`transition-all duration-500 ${chatOpen ? "w-2/3" : "w-full"} p-10`}>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Hi, {userName}!</h1>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="cursor-pointer rounded-lg border border-white bg-black px-6 py-2 text-lg font-semibold text-white transition duration-500 hover:border hover:bg-white hover:text-black"
          >
            Study Buddy
          </button>
        </div>

        <Link href="/roadmap" className="mb-4 text-lg">
          <span className="inline-flex items-center gap-2 border-b-3 border-transparent pb-2 hover:border-b-3 hover:border-white">
            <Image
              src="/icons/roadmap_icon.png"
              alt="icon"
              width={24}
              height={24}
              className="rounded-full"
            />
            Roadmap
            <Image
              src="/icons/right_arrow.png"
              alt="icon"
              width={18}
              height={18}
              className="rounded-full"
            />
          </span>
        </Link>

        {/* Progress Statistics Dashboard */}
        {hasRoadmap && progressStats ? (
          <div className="space-y-6">
            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Progress Card */}
              <div className="bg-gray-900 border border-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
                  <Image
                    src="/icons/bar_icon.png"
                    alt="Progress Icon"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Progress</span>
                    <span>{progressStats.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressStats.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {progressStats.completedActivities} of {progressStats.totalActivities} activities completed
                </p>
              </div>

              {/* Current Phase Card */}
              <div className="bg-gray-900 border border-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Current Phase</h3>
                  <Image
                    src="/icons/phase1_icon.png"
                    alt="Phase Icon"
                    width={24}
                    height={24}
                  />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{progressStats.currentPhase.name}</h4>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Phase Progress</span>
                    <span>{Math.round(progressStats.currentPhase.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressStats.currentPhase.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Phase {progressStats.completedPhases + 1} of {progressStats.totalPhases}
                </p>
              </div>

              {/* Time Estimate Card */}
              <div className="bg-gray-900 border border-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Time Remaining</h3>
                  <Image
                    src="/icons/time_icon.png"
                    alt="Time Icon"
                    width={24}
                    height={24}
                  />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  {progressStats.estimatedDaysLeft} days
                </h4>
                <p className="text-sm text-gray-400 mb-2">Estimated completion</p>
                <p className="text-xs text-gray-500">
                  Based on current progress rate
                </p>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Continue Learning Card */}
              <div className="relative overflow-hidden rounded-lg border-2 border-white p-6 shadow-md">
                <Image
                  src="/roadmap_background.png"
                  alt="Continue Learning Background"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  className="z-0"
                />
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <div className="relative flex flex-col items-start justify-center h-full min-h-[200px]">
                  <p className="text-md text-white">{progressStats.currentPhase.name}</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Continue Learning</h2>
                  <p className="mt-2 text-sm text-gray-300">{progressStats.currentPhase.description}</p>
                  <Link href="/roadmap">
                    <button className="mt-4 cursor-pointer rounded-lg border border-transparent bg-white px-8 py-3 text-lg font-semibold text-black transition duration-500 hover:border-1 hover:border-white hover:bg-black hover:text-white">
                      Go to Roadmap
                    </button>
                  </Link>
                </div>
              </div>

              {/* Quick Assessment Card */}
              <div className="bg-gray-900 border border-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Quick Assessment</h3>
                  <Image
                    src="/icons/assessment_icon.png"
                    alt="Assessment Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <p className="text-gray-300 mb-4">
                  Test your knowledge with quizzes and practice coding exercises.
                </p>
                <div className="space-y-3">
                  <Link href="/assessments">
                    <button className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-white transition-all duration-300">
                      <span className="text-white font-medium">Take Quiz</span>
                      <span className="block text-sm text-gray-400">General knowledge test</span>
                    </button>
                  </Link>
                  <Link href="/assessments?code=Practice Exercise&type=exercise">
                    <button className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-white transition-all duration-300">
                      <span className="text-white font-medium">Code Exercise</span>
                      <span className="block text-sm text-gray-400">Practice coding problems</span>
                    </button>
                  </Link>
                  <Link href="/assessments?quiz=current-phase">
                    <button className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-white transition-all duration-300">
                      <span className="text-white font-medium">Phase Assessment</span>
                      <span className="block text-sm text-gray-400">Test current phase knowledge</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Learning Insights */}
            <div className="bg-gray-900 border border-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Learning Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-2xl font-bold text-white">{progressStats.completedPhases}</h4>
                  <p className="text-sm text-gray-400">Phases Completed</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-2xl font-bold text-white">
                    {roadmapData?.trackName || "Programming"}
                  </h4>
                  <p className="text-sm text-gray-400">Learning Track</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-2xl font-bold text-white">
                    {roadmapData?.difficulty || "Beginner"}
                  </h4>
                  <p className="text-sm text-gray-400">Difficulty Level</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No Roadmap State */
          <div className="relative mt-6 min-h-[300px] overflow-hidden rounded-lg border-2 border-white p-8 shadow-md">
            <Image
              src="/roadmap_background.png"
              alt="Roadmap Background"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              className="z-0"
            />
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div className="relative m-8 flex h-full w-full flex-col items-start justify-center">
              <p className="mt-8 text-2xl font-bold text-white">
                Create your roadmap.
              </p>
              <p className="text-md mt-5 text-white">
                Start your learning journey with a personalized roadmap tailored to your goals.
              </p>
              <Link href="/track-selection">
                <button className="mt-8 cursor-pointer rounded-lg border border-transparent bg-white px-12 py-3 text-lg font-semibold text-black transition duration-500 hover:border-1 hover:border-white hover:bg-black hover:text-white">
                  Let&apos;s go
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* Chat box container */}
      {chatOpen && (
        <div className="w-1/3 h-screen border-l border-white">
          <ChatBox onClose={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
