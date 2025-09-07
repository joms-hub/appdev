import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topics, confidence } = await req.json();

  const userPrompt = topics
    .map((topic: string, i: number) => {
      const conf = confidence[i] ?? 3;
      return `Topic: ${topic}, Confidence: ${conf}/5`;
    })
    .join("\n");

  const systemPrompt = `You are a strict JSON generator. Based only on the topic list and confidence ratings, output a 5-day study schedule. Use this exact format and return ONLY valid JSON:

{
  "Day 1": [{ "topic": "Topic name", "minutes": number }],
  "Day 2": [{ "topic": "Topic name", "minutes": number }],
  ...
}

Rules:
- Lower confidence = more minutes (25 max)
- Each topic appears across multiple days
- No explanations. No comments. No markdown.
`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
        "Cohere-Version": "2022-12-06",
      },
      body: JSON.stringify({
        message: fullPrompt,
        model: "command-r",
        temperature: 0.7,
        chat_history: [],
        stream: false,
        return_prompt: false,
      }),
    });

    const result = await response.json();

    const raw = result?.text || "{}";
    console.log("Cohere response:", raw);

    let schedule = {};
    try {
      const cleaned = raw
        .replace(/```json|```/g, "")
        .replace(/(\w+):/g, '"$1":')
        .replace(/,\s*]/g, "]")
        .replace(/,\s*}/g, "}");

      schedule = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse error after cleaning:", err);
    }

    return NextResponse.json({ schedule });
  } catch (err) {
    console.error("Cohere API Error:", err);
    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 },
    );
  }
}
