"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface Activity {
  id?: string;
  name: string;
  description: string;
  type: "project" | "reading" | "exercise" | "quiz";
  estimatedHours: number;
  completed?: boolean;
  completedAt?: string;
}

interface ShowDetailsProps {
  index: number;
  activities?: Activity[];
}

export default function ShowDetails({ index, activities = [] }: ShowDetailsProps) {
  const [showDetails, setShowDetails] = useState([false, false, false]);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "project":
        return "/icons/activity_icon.png";
      case "quiz":
      case "assessment":
        return "/icons/assessment_icon.png";
      case "reading":
        return "/icons/reading_icon.png";
      case "exercise":
        return "/icons/exercise_icon.png";
      default:
        return "/icons/activity_icon.png";
    }
  };

  return (
    <div>
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-2 border-b border-transparent pb-2 focus:outline-none"
        onClick={() =>
          setShowDetails((prev) =>
            prev.map((item, i) => (i === index ? !item : item)),
          )
        }
      >
        <p className="text-md text-white">Show Chapter Details</p>
        <Image
          src={
            showDetails[index]
              ? "/icons/arrow_up_icon.png"
              : "/icons/arrow_down_icon.png"
          }
          alt="icon"
          width={24}
          height={24}
        />
      </button>
      {showDetails[index] && (
        <div className="mt-4 flex flex-col gap-4">
          {activities.length > 0 ? (
            activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Image
                  src={getActivityIcon(activity.type)}
                  alt="icon"
                  width={20}
                  height={20}
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.name}</p>
                  <p className="text-white/70 text-sm">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-600/30 text-white px-2 py-1 rounded uppercase">
                      {activity.type}
                    </span>
                    <span className="text-xs text-white/60">
                      {activity.estimatedHours}h
                    </span>
                    {activity.completed && (
                      <span className="text-xs text-green-400">✓ Completed</span>
                    )}
                  </div>
                  {/* Quiz navigation */}
                  {activity.type === 'quiz' && (
                    <div className="mt-2">
                      <Link
                        href="/assessments"
                        className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                      >
                        📝 Take Quiz
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Fallback for existing static content
            <>
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/icons/activity_icon.png"
                  alt="icon"
                  width={20}
                  height={20}
                />
                <p className="text-white">Activity 1</p>
              </Link>
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/icons/activity_icon.png"
                  alt="icon"
                  width={20}
                  height={20}
                />
                <p className="text-white">Activity 2</p>
              </Link>
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/icons/activity_icon.png"
                  alt="icon"
                  width={20}
                  height={20}
                />
                <p className="text-white">Activity 3</p>
              </Link>
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/icons/assessment_icon.png"
                  alt="icon"
                  width={20}
                  height={20}
                />
                <p className="text-white">Assessment</p>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
