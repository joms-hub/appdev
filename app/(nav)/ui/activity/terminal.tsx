"use client";
import { useState } from "react";

export default function Terminal() {
  const [terminal, setTerminal] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const handleRun = () => {
    setTerminal("Simulated run output...\n");
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-t-lg bg-zinc-900 px-4 py-2">
        <span className="text-sm text-gray-400">make.c</span>
        <button
          type="button"
          className="rounded-md bg-white px-3 py-1 text-sm text-black hover:bg-gray-200"
          onClick={handleRun}
        >
          Run
        </button>
      </div>
      <textarea
        className="h-52 resize-none border-t border-gray-700 bg-black p-4 font-mono text-sm text-white outline-none"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Write your code here"
      />
      <div className="h-28 overflow-auto rounded-b-lg bg-zinc-900 px-4 py-2">
        <pre className="text-sm whitespace-pre-wrap text-green-400">
          {terminal}
        </pre>
      </div>
    </>
  );
}
