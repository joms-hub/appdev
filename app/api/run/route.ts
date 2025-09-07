// app/api/run/route.ts

import { NextRequest, NextResponse } from "next/server";

const RUNTIME_MAP: Record<string, { language: string; version: string }> = {
  C: { language: "c", version: "10.2.0" },
  Java: { language: "java", version: "15.0.2" },
  Python: { language: "python3", version: "3.10.0" },
};

export async function POST(req: NextRequest) {
  try {
    const { language, code } = await req.json();

    if (!language || !code) {
      return NextResponse.json({ error: "Missing language or code" }, { status: 400 });
    }

    const runtime = RUNTIME_MAP[language];
    if (!runtime) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
        }),
        });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error running code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
