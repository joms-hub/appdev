import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
    "X-Title": "DevMate App",
  },
});

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user preferences with related data
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      include: {
        track: true,
        topicInterests: {
          include: {
            topic: true,
          },
        },
        confidenceScores: true,
      },
    });

    if (!userPreferences) {
      return NextResponse.json(
        { error: "User preferences not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Calculate average confidence score
    const avgConfidence = userPreferences.confidenceScores.reduce(
  (sum: number, score: { score: number }) => sum + score.score,
      0
    ) / userPreferences.confidenceScores.length;

    // Get difficulty level based on confidence
    const getDifficultyLevel = (confidence: number) => {
      if (confidence <= 2) return "Beginner";
      if (confidence <= 3.5) return "Intermediate";
      return "Advanced";
    };

    const difficultyLevel = getDifficultyLevel(avgConfidence);
    const interestedTopics = userPreferences.topicInterests.map(
  (interest: { topic: { name: string } }) => interest.topic.name
    );

    // Create OpenAI prompt
    const prompt = `Generate a personalized learning roadmap for a ${difficultyLevel} level student in ${userPreferences.track.name}.

User Profile:
- Track: ${userPreferences.track.name}
- Difficulty Level: ${difficultyLevel}
- Average Confidence Score: ${avgConfidence.toFixed(1)}/5
- Interested Topics: ${interestedTopics.join(", ")}

Please generate a roadmap with the following structure:
1. Overall roadmap title and description
2. Estimated total duration in days
3. Number of activities/milestones
4. 3 distinct learning phases, each with:
   - Phase name and description
   - Specific learning objectives
   - Key topics to cover
   - Estimated duration
   - Activities and milestones
   - Prerequisites (if any)

Format the response as JSON with this exact structure:
{
  "title": "Roadmap title",
  "description": "Overall roadmap description",
  "difficultyLevel": "${difficultyLevel}",
  "estimatedDays": number,
  "totalActivities": number,
  "phases": [
    {
      "name": "Phase name",
      "description": "Phase description",
      "objectives": ["objective1", "objective2"],
      "topics": ["topic1", "topic2"],
      "estimatedDays": number,
      "activities": [
        {
          "name": "Activity name",
          "description": "Activity description",
          "type": "project|reading|exercise|quiz",
          "estimatedHours": number
        }
      ],
      "prerequisites": ["prerequisite1"]
    }
  ]
}

Make sure the roadmap is practical, actionable, and tailored to the user's specific interests and skill level.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are an expert educational curriculum designer. Generate comprehensive, practical learning roadmaps based on user preferences and skill levels. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let roadmap;
    try {
      roadmap = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Invalid JSON response from OpenAI");
    }

    // Add user-specific metadata
    const enhancedRoadmap = {
      ...roadmap,
      userId: session.user.id,
      trackName: userPreferences.track.name,
      userTopics: interestedTopics,
      confidenceLevel: avgConfidence,
      generatedAt: new Date().toISOString(),
      progress: 0, // Initial progress
    };

    return NextResponse.json({
      success: true,
      roadmap: enhancedRoadmap,
    });

  } catch (error) {
    console.error("Error generating roadmap:", error);
    return NextResponse.json(
      {
        error: "Failed to generate roadmap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
