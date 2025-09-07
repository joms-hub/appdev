"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ShowDetails from "./ui/client/ShowDetails";
import { toast } from "react-hot-toast";

interface Activity {
  id?: string;
  name: string;
  description: string;
  type: "project" | "reading" | "exercise" | "quiz";
  estimatedHours: number;
  completed?: boolean;
  completedAt?: string;
}

interface Phase {
  name: string;
  description: string;
  objectives: string[];
  topics: string[];
  estimatedDays: number;
  activities: Activity[];
  prerequisites: string[];
  progress?: number;
}

interface Roadmap {
  title: string;
  description: string;
  difficultyLevel: string;
  estimatedDays: number;
  totalActivities: number;
  phases: Phase[];
  trackName: string;
  userTopics: string[];
  confidenceLevel: number;
  progress: number;
}

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(true);
  const [updatingActivity, setUpdatingActivity] = useState<string | null>(null);

  const generateNewRoadmap = useCallback(async () => {
    try {
      setGenerating(true);
      toast.loading("Generating your personalized roadmap...");

      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if the error is due to missing user preferences
        if (response.status === 404 && errorData.error.includes("User preferences not found")) {
          setHasPreferences(false);
          toast.dismiss();
          toast.error("Please complete your onboarding first!");
          setLoading(false);
          setGenerating(false);
          return;
        }
        
        throw new Error(errorData.error || "Failed to generate roadmap");
      }

      const data = await response.json();
      
      // Save the roadmap to database for progress tracking
      const saveResponse = await fetch("/api/roadmap-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roadmapData: data.roadmap }),
      });

      if (!saveResponse.ok) {
        console.warn("Failed to save roadmap progress, but continuing...");
      }

      setRoadmap(data.roadmap);
      setHasPreferences(true);
      toast.dismiss();
      toast.success("Roadmap generated successfully!");

    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "Failed to generate roadmap"
      );
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }, []);

  const loadOrGenerateRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      
      // First, check if user has completed preferences
      const preferencesResponse = await fetch("/api/check-preferences");
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        if (!preferencesData.hasPreferences || !preferencesData.isComplete) {
          setHasPreferences(false);
          setLoading(false);
          return;
        }
      }
      
      // Next, try to load existing roadmap with progress
      const progressResponse = await fetch("/api/roadmap-progress");
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        if (progressData.roadmap) {
          setRoadmap(progressData.roadmap);
          setHasPreferences(true);
          setLoading(false);
          return;
        }
      }
      
      // If no existing roadmap but has preferences, generate a new one
      await generateNewRoadmap();
      
    } catch (error) {
      console.error("Error loading roadmap:", error);
      toast.error("Failed to load roadmap");
      setLoading(false);
    }
  }, [generateNewRoadmap]);

  // Helper function to determine if a phase is unlocked
  const isPhaseUnlocked = useCallback((phaseIndex: number, phases: Phase[]) => {
    // First phase is always unlocked
    if (phaseIndex === 0) return true;
    
    // Check if the previous phase is completed (100% progress)
    const previousPhase = phases[phaseIndex - 1];
    return previousPhase && (previousPhase.progress || 0) >= 100;
  }, []);

  const toggleActivityCompletion = useCallback(async (activityId: string, currentCompleted: boolean) => {
    if (!activityId) {
      toast.error("Activity ID not found");
      return;
    }

    try {
      setUpdatingActivity(activityId);
      
      const response = await fetch("/api/activities", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId,
          completed: !currentCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update activity");
      }

      const data = await response.json();

      // Update the roadmap state with new completion status and progress
      setRoadmap(prevRoadmap => {
        if (!prevRoadmap) return null;

        const updatedRoadmap = { ...prevRoadmap };
        updatedRoadmap.progress = data.overallProgress;

        // Find and update the activity
        updatedRoadmap.phases = prevRoadmap.phases.map(phase => {
          const updatedPhase = { ...phase };
          updatedPhase.activities = phase.activities.map(activity => {
            if (activity.id === activityId) {
              return {
                ...activity,
                completed: data.activity.completed,
                completedAt: data.activity.completedAt,
              };
            }
            return activity;
          });

          // Update phase progress
          const completedActivities = updatedPhase.activities.filter(a => a.completed).length;
          updatedPhase.progress = (completedActivities / updatedPhase.activities.length) * 100;

          return updatedPhase;
        });

        return updatedRoadmap;
      });

      toast.success(
        !currentCompleted ? "Activity marked as completed!" : "Activity marked as incomplete"
      );

    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Failed to update activity");
    } finally {
      setUpdatingActivity(null);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      loadOrGenerateRoadmap();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session, loadOrGenerateRoadmap]);

  if (status === "loading" || loading) {
    return (
      <main className="w-full bg-black p-32 px-8">
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading your roadmap...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="w-full bg-black p-32 px-8">
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Please log in to view your roadmap
            </h1>
            <p className="text-white mb-8">
              Sign in to get a personalized learning roadmap based on your preferences.
            </p>
            <a
              href="/login"
              className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-black p-32 px-8">
      <div className="mx-auto mt-16 max-w-7xl">
        <div className="relative mt-6 min-h-[300px] overflow-hidden rounded-lg border-2 border-white p-12 shadow-md">
          <Image
            src="/roadmap_background.png"
            alt="Roadmap Background"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            className="z-0"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="relative z-10 flex h-full w-full flex-col items-start justify-center">
            {roadmap ? (
              <>
                <div className="mb-6 flex w-full items-center">
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${roadmap.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 font-semibold text-white">
                    {roadmap.progress || 0}%
                  </span>
                </div>
                <p className="text-md text-white">Track</p>
                <h2 className="mt-5 text-3xl font-bold text-white">
                  {roadmap.title}
                </h2>
                <button 
                  className="mt-8 cursor-pointer rounded-lg border border-transparent bg-white px-12 py-3 text-lg font-semibold text-black transition duration-500 hover:border-1 hover:border-white hover:bg-black hover:text-white"
                  onClick={() => {
                    // You can add navigation logic here
                    toast("Continue learning functionality coming soon!");
                  }}
                >
                  Continue learning
                </button>
                <div className="mt-6 flex flex-row items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons/bar_icon.png"
                      alt="icon"
                      width={16}
                      height={16}
                    />
                    <p className="text-white">{roadmap.difficultyLevel}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-white/20 px-4 py-2">
                    <Image
                      src="/icons/time_icon.png"
                      alt="icon"
                      width={16}
                      height={16}
                    />
                    <p className="text-white">{roadmap.estimatedDays} days</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-white/20 px-4 py-2">
                    <Image
                      src="/icons/activity_icon.png"
                      alt="icon"
                      width={16}
                      height={16}
                    />
                    <p className="text-white">{roadmap.totalActivities} Activities</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {hasPreferences ? (
                  <>
                    <p className="mt-8 text-2xl font-bold text-white">
                      Create your personalized roadmap.
                    </p>
                    <p className="text-md mt-5 text-white">
                      Generate a learning path tailored to your interests and skill level.
                    </p>
                    <button 
                      className="mt-8 rounded-lg bg-white px-12 py-3 text-lg font-semibold text-black transition hover:bg-blue-700 disabled:opacity-50"
                      onClick={generateNewRoadmap}
                      disabled={generating}
                    >
                      {generating ? "Generating..." : "Generate Roadmap"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-8 text-2xl font-bold text-white">
                      Complete your onboarding first!
                    </p>
                    <p className="text-md mt-5 text-white">
                      We need to know your learning preferences to create a personalized roadmap.
                    </p>
                    <div className="mt-8 flex gap-4">
                      <a
                        href="/track-selection"
                        className="rounded-lg bg-blue-600 px-12 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
                      >
                        Complete Onboarding
                      </a>
                      <button 
                        className="rounded-lg border border-white bg-transparent px-8 py-3 text-lg font-semibold text-white transition hover:bg-white hover:text-black"
                        onClick={generateNewRoadmap}
                        disabled={generating}
                      >
                        {generating ? "Checking..." : "Try Again"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {roadmap && (
        <div className="mx-auto max-w-7xl">
          <h4 className="mt-10 text-2xl font-bold text-white">Description</h4>
          <p className="text-md mt-5 text-white">
            {roadmap.description}
          </p>
          
          <div className="mt-8 p-6 bg-white/10 rounded-lg">
            <h5 className="text-lg font-semibold text-white mb-3">Your Learning Profile</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
              <div>
                <span className="font-medium">Track:</span> {roadmap.trackName}
              </div>
              <div>
                <span className="font-medium">Confidence Level:</span> {roadmap.confidenceLevel?.toFixed(1) || 'N/A'}/5.0
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Interested Topics:</span> {roadmap.userTopics?.join(", ") || 'None specified'}
              </div>
            </div>
          </div>

          {roadmap.phases?.map((phase, index) => {
            const isUnlocked = isPhaseUnlocked(index, roadmap.phases);
            
            return (
            <div
              key={index}
              className={`relative mt-10 min-h-[300px] overflow-hidden rounded-lg border-2 p-12 shadow-md transition-all ${
                isUnlocked 
                  ? 'border-white' 
                  : 'border-gray-600 opacity-60 bg-gray-900/50'
              }`}
            >
              {/* Lock indicator for locked phases */}
              {!isUnlocked && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-2 bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-600">
                    <span className="text-sm">🔒</span>
                    <span className="text-xs">Complete previous phase</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src={`/icons/phase${index + 1}_icon.png`}
                  alt="icon"
                  width={24}
                  height={24}
                  className={!isUnlocked ? 'grayscale opacity-60' : ''}
                />
                <p className={`text-xl font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                  {phase.name}
                </p>
                <div className="flex-1"></div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-84 overflow-hidden rounded-full bg-white/30">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isUnlocked ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                      style={{ width: `${phase.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 font-semibold text-white">{Math.round(phase.progress || 0)}%</span>
                </div>
              </div>
              
              <p className="text-md mb-6 text-white">
                {phase.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h6 className="font-semibold text-white mb-2">Learning Objectives:</h6>
                  <ul className="text-sm text-white/90 space-y-1">
                    {phase.objectives?.map((objective, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-white mb-2">Key Topics:</h6>
                  <div className="flex flex-wrap gap-2">
                    {phase.topics?.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-600/30 text-white text-sm rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h6 className="font-semibold text-white mb-2">
                  Activities ({phase.activities?.length || 0}) - Est. {phase.estimatedDays} days
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.activities?.map((activity, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-lg transition-all relative ${
                        !isUnlocked 
                          ? 'bg-gray-800/30 border border-gray-600 cursor-not-allowed opacity-50'
                          : `cursor-pointer ${
                              activity.completed 
                                ? 'bg-green-600/20 border border-green-500/50' 
                                : activity.type === 'quiz'
                                ? 'bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/15'
                                : 'bg-white/10 hover:bg-white/15'
                            }`
                      } ${updatingActivity === activity.id ? 'opacity-50' : ''}`}
                      onClick={() => {
                        if (isUnlocked && activity.id) {
                          toggleActivityCompletion(activity.id, activity.completed || false);
                        } else if (!isUnlocked) {
                          toast.error("Complete the previous phase to unlock this activity");
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded uppercase ${
                          activity.completed 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {activity.type}
                        </span>
                        <span className="text-xs text-white/70">
                          {activity.estimatedHours}h
                        </span>
                        {activity.completed && (
                          <span className="text-xs text-green-400 ml-auto">✓ Completed</span>
                        )}
                        {updatingActivity === activity.id && (
                          <span className="text-xs text-yellow-400 ml-auto">Updating...</span>
                        )}
                      </div>
                      <div className="font-medium text-white">{activity.name}</div>
                      <p className="text-sm text-white/80 mt-1">{activity.description}</p>
                      
                      {/* Special handling for quiz activities */}
                      {activity.type === 'quiz' && (
                        <div className="mt-3">
                          {isUnlocked ? (
                            <a
                              href={`/assessments?quiz=${encodeURIComponent(activity.name)}&id=${activity.id}&phase=${encodeURIComponent(phase.name)}`}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📝 Take Quiz
                            </a>
                          ) : (
                            <div className="inline-flex items-center px-3 py-1 bg-gray-600 text-gray-300 text-xs rounded cursor-not-allowed">
                              🔒 Quiz Locked
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Special handling for exercise activities */}
                      {activity.type === 'exercise' && (
                        <div className="mt-3">
                          {isUnlocked ? (
                            <a
                              href={`/assessments?code=${encodeURIComponent(activity.name)}&id=${activity.id}&phase=${encodeURIComponent(phase.name)}&type=exercise`}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                              onClick={(e) => e.stopPropagation()}
                            >
                              💻 Code Exercise
                            </a>
                          ) : (
                            <div className="inline-flex items-center px-3 py-1 bg-gray-600 text-gray-300 text-xs rounded cursor-not-allowed">
                              🔒 Exercise Locked
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activity.completedAt && (
                        <p className="text-xs text-green-400/80 mt-1">
                          Completed on {new Date(activity.completedAt).toLocaleDateString()}
                        </p>
                      )}
                      
                      {/* Click indicator */}
                      <div className="absolute top-2 right-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          activity.completed 
                            ? 'bg-green-600 border-green-500' 
                            : 'border-white/30 hover:border-white/60'
                        }`}>
                          {activity.completed && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {phase.prerequisites?.length > 0 && (
                <div className="mb-6">
                  <h6 className="font-semibold text-white mb-2">Prerequisites:</h6>
                  <ul className="text-sm text-white/90">
                    {phase.prerequisites?.map((prereq, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">⚠</span>
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <hr className="my-8 border-t-3 border-white/40" />
              <ShowDetails index={index} activities={phase.activities} />
            </div>
            );
          })}
          
          <div className="mt-10 text-center">
            <button
              onClick={generateNewRoadmap}
              disabled={generating}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate New Roadmap"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
