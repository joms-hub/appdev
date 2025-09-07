"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OnlineCompiler from "@/app/components/online-compiler";
import ChatBox from "@/app/components/ChatBox";

function AssessmentContent() {
  const searchParams = useSearchParams();
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState("100vh");

  // Get quiz/exercise information from URL parameters
  const quizName = searchParams.get('quiz');
  const codeName = searchParams.get('code');
  const activityId = searchParams.get('id');
  const phaseName = searchParams.get('phase');
  const activityType = searchParams.get('type');

  // Auto-switch to Code tab for exercises
  useEffect(() => {
    if (activityType === 'exercise' && codeName) {
      setActiveTab("Code");
    }
  }, [activityType, codeName]);

  // Function to mark quiz/exercise as completed
  const completeActivity = async () => {
    if (!activityId) return;
    
    const activityTypeText = activityType === 'exercise' ? 'exercise' : 'quiz';
    
    try {
      const response = await fetch("/api/activities", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId,
          completed: true,
        }),
      });

      if (response.ok) {
        // Show success message and redirect
        alert(`${activityTypeText.charAt(0).toUpperCase() + activityTypeText.slice(1)} completed successfully! Redirecting to roadmap...`);
        window.location.href = "/roadmap";
      } else {
        alert(`Failed to mark ${activityTypeText} as completed. Please try again.`);
      }
    } catch (error) {
      console.error(`Error completing ${activityTypeText}:`, error);
      alert(`Error completing ${activityTypeText}. Please try again.`);
    }
  };

  // Match the height of the parent container
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(`${containerRef.current.offsetHeight}px`);
    }
  }, [chatOpen]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div className="text-white p-4">
            {(quizName || codeName) ? (
              <div className="space-y-4">
                <div className="border-b border-white/20 pb-4">
                  <h2 className="text-xl font-bold mb-2">
                    {activityType === 'exercise' ? 'Code Exercise' : 'Quiz Assessment'}
                  </h2>
                  <h3 className="text-lg text-blue-400">{quizName || codeName}</h3>
                  {phaseName && (
                    <p className="text-sm text-gray-400">Phase: {phaseName}</p>
                  )}
                </div>
                
                {activityType === 'exercise' ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Exercise Instructions:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      <li>Complete the coding exercise in the Code tab</li>
                      <li>Test your solution thoroughly before submitting</li>
                      <li>Use the Study Buddy for guidance if needed</li>
                      <li>Make sure your code meets the requirements</li>
                    </ul>
                    
                    <div className="mt-6 p-4 bg-green-600/20 border border-green-500/50 rounded">
                      <h5 className="font-semibold mb-2">Exercise: {codeName}</h5>
                      <p className="mb-4">This is a coding exercise for &quot;{codeName}&quot;. Switch to the Code tab to start working on your solution.</p>
                      
                      <div className="mt-4 flex gap-3">
                        <button 
                          onClick={() => setActiveTab("Code")}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          💻 Start Coding
                        </button>
                        <button 
                          onClick={completeActivity}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Mark as Complete
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <a 
                        href="/roadmap" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        ← Back to Roadmap
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Instructions:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      <li>Read each question carefully before answering</li>
                      <li>You can use the Code tab to test your solutions</li>
                      <li>Use the Study Buddy for hints if you get stuck</li>
                      <li>Submit your answers when you&apos;re confident</li>
                    </ul>
                    
                    <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/50 rounded">
                      <h5 className="font-semibold mb-2">Sample Question:</h5>
                      <p className="mb-4">This is a placeholder quiz question for &quot;{quizName}&quot;. In a real implementation, this would load the actual quiz questions from your database.</p>
                      
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="sample" className="text-blue-600" />
                          <span>Option A</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="sample" className="text-blue-600" />
                          <span>Option B</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="sample" className="text-blue-600" />
                          <span>Option C</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="sample" className="text-blue-600" />
                          <span>Option D</span>
                        </label>
                      </div>
                      
                      <div className="mt-4 flex gap-3">
                        <button 
                          onClick={completeActivity}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Submit Quiz & Complete
                        </button>
                        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                          Skip Question
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <a 
                        href="/roadmap" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        ← Back to Roadmap
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Assessment Center</h2>
                <p className="text-gray-300">
                  Welcome to the Assessment Center! Select a quiz or exercise from your roadmap to get started.
                </p>
                <div className="mt-6">
                  <a 
                    href="/roadmap" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Go to Roadmap
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      case "Code":
        return <OnlineCompiler exerciseName={codeName || quizName} />;
      default:
        return null;
    }
  };

  const tabs = ["Description", "Code"];

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-black pt-12 px-8 relative flex transition-all duration-500"
    >
      <div
        className={`fixed left-0 top-24 z-50 w-64 border-r border-white bg-black text-white p-6 transform transition-transform duration-500 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ height: containerHeight }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {activityType === 'exercise' && codeName ? `Exercise: ${codeName}` :
             quizName ? `Quiz: ${quizName}` : "Assessment Menu"}
          </h3>
          <button onClick={() => setMenuOpen(false)} className="text-white text-lg">
            ✕
          </button>
        </div>
        
        <ul className="space-y-4">
          <li>
            <a href="/roadmap" className="hover:text-gray-400 block">
              📋 Back to Roadmap
            </a>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab("Description")} 
              className="hover:text-gray-400 w-full text-left"
            >
              📖 Quiz Description
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab("Code")} 
              className="hover:text-gray-400 w-full text-left"
            >
              💻 Code Practice
            </button>
          </li>
          {quizName && (
            <li className="pt-4 border-t border-white/20">
              <div className="text-sm text-gray-400 mb-2">Quiz Info:</div>
              <div className="text-xs space-y-1">
                <div>Name: {quizName}</div>
                {phaseName && <div>Phase: {phaseName}</div>}
                {activityId && <div>ID: {activityId}</div>}
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className={`transition-all duration-500 ${chatOpen ? "w-2/3" : "w-full"} p-6`}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="cursor-pointer rounded-lg border border-white bg-black px-4 py-2 text-lg font-semibold text-white transition duration-300 hover:bg-white hover:text-black"
            >
              ☰ Menu
            </button>
            {quizName && (
              <h1 className="text-xl font-semibold text-white">
                Quiz: {quizName}
              </h1>
            )}
          </div>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="cursor-pointer rounded-lg border border-white bg-black px-6 py-2 text-lg font-semibold text-white transition duration-500 hover:border hover:bg-white hover:text-black"
          >
            {chatOpen ? "Close Buddy" : "Study Buddy"}
          </button>
        </div>

        <div className="border border-white rounded-md overflow-hidden w-full min-h-[400px] bg-black">
          <div className="flex border-b border-white">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-medium ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "bg-black text-gray-400"
                } border-r border-white last:border-r-0`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4">{renderTabContent()}</div>
        </div>
      </div>

      {chatOpen && (
        <div className="w-1/3 h-screen border-l border-white">
          <ChatBox onClose={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full min-h-screen bg-black pt-12 px-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading assessment...</p>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AssessmentContent />
    </Suspense>
  );
}