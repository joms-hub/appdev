"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-white">Loading editor...</div>
});

interface OnlineCompilerProps {
  exerciseName?: string | null;
}

export default function OnlineCompiler({ exerciseName }: OnlineCompilerProps) {
  const [language, setLanguage] = useState("C");
  const [output, setOutput] = useState("// Output will appear here...");
  const [code, setCode] = useState(
    exerciseName 
      ? `// Exercise: ${exerciseName}\n// Write your solution here...\n\n` 
      : "// Write your code here..."
  );

  const handleRun = async () => {
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });

      const data = await res.json();

      if (data.run?.output) {
        setOutput(data.run.output.trim());
      } else if (data.run?.stderr) {
        setOutput(data.run.stderr.trim());
      } else if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput("Unknown error occurred.");
      }
    } catch (err) {
      console.error("Run failed:", err);
      setOutput("Failed to run the code.");
    }
  };


  // Optional: Map languages to Monaco-supported ones
  const monacoLanguageMap: Record<string, string> = {
    C: "c",
    Java: "java",
    Python: "python",
  };

  return (
    <div className="flex h-[80vh] w-full overflow-hidden rounded-md border border-gray-700 bg-black text-white">
      <div className="flex flex-col w-2/3 border-r border-gray-700">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Code Editor</span>
            {exerciseName && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                Exercise: {exerciseName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              className="flex items-center gap-2 rounded bg-white px-4 py-1 text-black hover:bg-gray-200"
            >
              <Play size={16} />
              Run
            </button>
            <select
              aria-label="Select programming language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#1e1e1e] border border-white text-white px-2 py-1 rounded text-sm"
            >
              <option value="C">C</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage={monacoLanguageMap[language]}
            value={code}
            onChange={(newValue: string | undefined) => setCode(newValue || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>

      {/* Right: Output */}
      <div className="w-1/3 p-4 bg-[#0a0a0a] text-sm font-mono overflow-auto">
        <h3 className="text-white font-semibold mb-2">Output:</h3>
        <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}
