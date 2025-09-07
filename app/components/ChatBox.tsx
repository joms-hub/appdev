"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { X } from "lucide-react";
import clsx from "clsx";

type ChatBoxProps = {
  onClose: () => void;
};

export default function ChatBox({ onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      if (!res.ok) {
        if (process.env.NODE_ENV === "development") { console.error(`Error: Received status ${res.status} from API`); }
        return;
      }
      const data = await res.json();
      const newAIMessage = { role: "assistant" as const, content: data.reply };
      setMessages((prev) => [...prev, newAIMessage]);
    } catch (err) {
      if (process.env.NODE_ENV === "development") { console.error("Error sending prompt:", err); }
      alert("Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-black border border-white shadow-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white p-2 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
          <p className="text-white font-bold text-lg text-center">
            What can I help you with today?
          </p>
        </div>
        ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={clsx(
              "max-w-md px-4 py-2 rounded-lg",
              msg.role === "user" ? "bg-blue-900 self-start text-white" : "bg-gray-900 self-start text-white"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))
      )}
      {loading && <p className="text-sm text-gray-400">Thinking...</p>}
      </div>

      <div className="border-t p-4 bg-black flex items-center gap-2">
        <input
          className="bg-black text-white flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className="bg-blue-900 hover:bg-blue-800 text-white rounded-full p-2 transition"
          disabled={loading}
          aria-label="Send message"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
