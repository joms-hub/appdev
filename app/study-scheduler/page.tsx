"use client";

import { useEffect, useState } from "react";
//import { useRouter } from "next/navigation";

interface ScheduleItem {
  day: string;
  subjects: { topic: string; minutes: number }[];
}

export default function StudySchedulerPage() {
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);
  const [ready, setReady] = useState(false);
  //const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("studyPrefs");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const body = {
      topics: parsed.topics,
      confidence: parsed.confidence,
    };

    fetch("/api/generate-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.schedule || typeof data.schedule !== "object") {
          console.error("Invalid schedule received:", data);
          setReady(true);
          return;
        }

        const formatted = Object.entries(data.schedule).map(
          ([day, subjects]) => ({
            day,
            subjects: Array.isArray(subjects) ? subjects : [],
          }),
        );
        setSchedule(formatted);
        setReady(true);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setReady(true);
      });
  }, []);

  if (!ready) return <p className="p-6 text-white">Loading your schedule...</p>;

  return (
    <div className="mx-auto max-w-xl p-6 text-white">
      <h1 className="mb-4 rounded bg-black/60 px-4 py-2 text-3xl font-bold text-white shadow">
        Your AI-Powered Study Plan
      </h1>

      {schedule && (
        <div className="space-y-4">
          {schedule.map((dayItem, index) => (
            <div
              key={dayItem.day}
              className={`rounded border border-white p-4 ${
                index % 2 === 0 ? "bg-white/10" : "bg-white/5"
              }`}
            >
              <h2 className="mb-2 text-xl font-semibold">
                {dayItem.day} – Total:{" "}
                {dayItem.subjects.reduce((sum, s) => sum + s.minutes, 0)} min
              </h2>
              <ul className="list-disc pl-6">
                {dayItem.subjects.map((s, idx) => (
                  <li key={idx} className="mb-2">
                    {s.topic}: {s.minutes} minutes
                    <div className="mt-1 h-2 w-full rounded bg-white/20">
                      <div
                        className="h-full rounded bg-green-400"
                        style={{ width: `${Math.min(s.minutes * 3, 100)}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
