import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      goals,
      targetDate = "2027-01-01",
      dailyGoalMinutes = 90,
      explanationLanguage = "id",
      listeningScore = 75,
      speakingScore = 70,
      vocabScore = 70,
      communicationScore = 75,
    } = body;

    // Calculate baseline estimated level (informal CEFR estimate)
    const averageScore =
      (Number(listeningScore) +
        Number(speakingScore) +
        Number(vocabScore) +
        Number(communicationScore)) /
      4;

    let estimatedLevel = "A2";
    if (averageScore >= 85) estimatedLevel = "B2";
    else if (averageScore >= 65) estimatedLevel = "B1";
    else if (averageScore >= 45) estimatedLevel = "A2";
    else estimatedLevel = "A1";

    const updated = await prisma.userProfile.upsert({
      where: { id: "default-user" },
      update: {
        name: name || "Rian Pratama",
        currentLevel: estimatedLevel,
        targetLevel: "B2",
        targetDate: new Date(targetDate),
        dailyGoalMinutes: Number(dailyGoalMinutes),
        explanationLanguage,
        isOnboarded: true,
      },
      create: {
        id: "default-user",
        name: name || "Rian Pratama",
        currentLevel: estimatedLevel,
        targetLevel: "B2",
        targetDate: new Date(targetDate),
        dailyGoalMinutes: Number(dailyGoalMinutes),
        explanationLanguage,
        isOnboarded: true,
      },
    });

    // Record baseline SkillAssessment
    await prisma.skillAssessment.create({
      data: {
        userId: "default-user",
        type: "PLACEMENT",
        overallLevel: estimatedLevel,
        listeningScore: Number(listeningScore),
        speakingScore: Number(speakingScore),
        vocabScore: Number(vocabScore),
        communicationScore: Number(communicationScore),
        notes: `Informal baseline assessment upon initial onboarding. Estimated starting level: ${estimatedLevel}.`,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      estimatedLevel,
      averageScore,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
