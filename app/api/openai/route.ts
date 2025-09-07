import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1", // 👈 important!
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000", // � production-ready
    "X-Title": "DevMate App", // 🟣 any short name you want
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free", // ✅ FREE model
      messages,
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") { console.error("OpenRouter error:", err); }
    return NextResponse.json(
      { reply: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}