"use client";

import { useState } from "react";
import OnlineCompiler from "@/app/components/online-compiler";
import ChatBox from "@/app/components/ChatBox";

export default function PlaygroundPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-black pt-24 px-8 relative flex transition-all duration-500">
      <div className={`transition-all duration-500 ${chatOpen ? "w-2/3" : "w-full"} p-6`}>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Playground</h1>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="cursor-pointer rounded-lg border border-white bg-black px-6 py-2 text-lg font-semibold text-white transition duration-500 hover:border hover:bg-white hover:text-black"
          >
            {chatOpen ? "Close Buddy" : "Study Buddy"}
          </button>
        </div>

        <OnlineCompiler />
      </div>

      {chatOpen && (
        <div className="w-1/3 h-screen border-l border-white">
          <ChatBox onClose={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
