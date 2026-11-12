import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Find or create today's challenge
    let challenge = await prisma.dailyChallenge.findUnique({
      where: { date: today },
    });

    if (!challenge) {
      challenge = await prisma.dailyChallenge.create({
        data: {
          date: today,
          title: "Introduce Your Background in 60 Seconds",
          description: "Practice spontaneous speaking: record or speak out loud your name, hometown, university field, and one reason why traveling abroad in 2027 matters to you.",
          targetSkill: "SPEAKING",
          targetMinutes: 10,
          difficulty: "Medium",
          prompt: "Tell me about yourself, what you study in Indonesia, and what excites you about going abroad!",
        },
      });
    }

    const completion = await prisma.challengeCompletion.findUnique({
      where: {
        userId_challengeId: {
          userId: "default-user",
          challengeId: challenge.id,
        },
      },
    });

    // Get completions for the past 7 days for the calendar widget
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCompletions = await prisma.challengeCompletion.findMany({
      where: {
        userId: "default-user",
        completedAt: { gte: sevenDaysAgo },
      },
      include: {
        user: false,
      },
    });

    return NextResponse.json({
      challenge,
      isCompleted: Boolean(completion),
      completion,
      weeklyCompletionsCount: recentCompletions.length,
    });
  } catch (error) {
    console.error("Challenges GET error:", error);
    return NextResponse.json({ error: "Failed to fetch daily challenge" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challengeId, proofText = "" } = body;

    const completion = await prisma.challengeCompletion.upsert({
      where: {
        userId_challengeId: {
          userId: "default-user",
          challengeId,
        },
      },
      update: {
        proofText,
        score: 100,
        completedAt: new Date(),
      },
      create: {
        userId: "default-user",
        challengeId,
        proofText,
        score: 100,
      },
    });

    // Record session duration
    await prisma.learningSession.create({
      data: {
        userId: "default-user",
        activityType: "SPEAKING",
        durationMinutes: 10,
        score: 100,
      },
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error("Challenge completion error:", error);
    return NextResponse.json({ error: "Failed to complete challenge" }, { status: 500 });
  }
}
