import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isGeminiConfigured } from "@/lib/gemini";

export async function GET() {
  try {
    const user = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
      include: { preferences: true },
    });

    return NextResponse.json({
      user,
      isGeminiConfigured: isGeminiConfigured(),
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Handle destructive and export actions
    if (action === "export") {
      const user = await prisma.userProfile.findUnique({
        where: { id: "default-user" },
        include: {
          preferences: true,
          goals: true,
          progress: true,
          sessions: true,
          conversations: { include: { messages: true } },
          vocabulary: { include: { reviews: true } },
          listeningAttempts: true,
          scenarioAttempts: true,
          challengeCompletions: true,
          journalEntries: true,
        },
      });

      return NextResponse.json(user);
    }

    if (action === "reset_progress") {
      await prisma.lessonProgress.deleteMany({ where: { userId: "default-user" } });
      await prisma.learningSession.deleteMany({ where: { userId: "default-user" } });
      await prisma.challengeCompletion.deleteMany({ where: { userId: "default-user" } });
      await prisma.listeningAttempt.deleteMany({ where: { userId: "default-user" } });
      return NextResponse.json({ success: true, message: "Progress reset successfully" });
    }

    if (action === "clear_conversations") {
      await prisma.conversationMessage.deleteMany({});
      await prisma.conversation.deleteMany({ where: { userId: "default-user" } });
      return NextResponse.json({ success: true, message: "Conversations cleared" });
    }

    if (action === "clear_vocabulary") {
      await prisma.vocabularyReview.deleteMany({});
      await prisma.vocabularyItem.deleteMany({ where: { userId: "default-user" } });
      return NextResponse.json({ success: true, message: "Vocabulary collection cleared" });
    }

    // Normal profile/preference update
    const {
      name,
      currentLevel,
      targetLevel,
      targetDate,
      dailyGoalMinutes,
      explanationLanguage,
      preferences,
    } = body;

    const updatedUser = await prisma.userProfile.update({
      where: { id: "default-user" },
      data: {
        name: name !== undefined ? name : undefined,
        currentLevel: currentLevel !== undefined ? currentLevel : undefined,
        targetLevel: targetLevel !== undefined ? targetLevel : undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        dailyGoalMinutes: dailyGoalMinutes !== undefined ? Number(dailyGoalMinutes) : undefined,
        explanationLanguage: explanationLanguage !== undefined ? explanationLanguage : undefined,
      },
    });

    if (preferences) {
      await prisma.userPreference.upsert({
        where: { userId: "default-user" },
        update: preferences,
        create: {
          userId: "default-user",
          ...preferences,
        },
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

