import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { evaluateScenarioAttemptAI } from "@/lib/gemini";
import { SCENARIOS_CATALOG } from "@/lib/scenarios";

export async function GET() {
  try {
    const attempts = await prisma.scenarioAttempt.findMany({
      where: { userId: "default-user" },
      orderBy: { createdAt: "desc" },
    });

    const attemptsMap = new Map<string, any>();
    attempts.forEach((a) => {
      if (!attemptsMap.has(a.scenarioId)) {
        attemptsMap.set(a.scenarioId, a);
      }
    });

    const response = SCENARIOS_CATALOG.map((s) => ({
      ...s,
      lastAttempt: attemptsMap.get(s.id) || null,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Scenarios GET error:", error);
    return NextResponse.json({ error: "Failed to fetch scenarios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId, transcript } = body;

    const scenario = SCENARIOS_CATALOG.find((s) => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    // Evaluate using Gemini AI or structured rubric
    const evalResult = await evaluateScenarioAttemptAI(
      scenario.title,
      scenario.objective,
      scenario.userRole,
      scenario.aiRole,
      transcript || []
    );

    const attempt = await prisma.scenarioAttempt.create({
      data: {
        userId: "default-user",
        scenarioId,
        title: scenario.title,
        role: scenario.userRole,
        status: evalResult.objectiveMet ? "PASSED" : "FAILED",
        objectiveMet: evalResult.objectiveMet,
        score: evalResult.score,
        evaluationJson: JSON.stringify(evalResult),
      },
    });

    // Record in LearningSession
    await prisma.learningSession.create({
      data: {
        userId: "default-user",
        activityType: "SCENARIO",
        durationMinutes: 10,
        score: evalResult.score,
      },
    });

    return NextResponse.json({
      attempt,
      evaluation: evalResult,
    });
  } catch (error) {
    console.error("Scenario submission error:", error);
    return NextResponse.json({ error: "Failed to submit scenario" }, { status: 500 });
  }
}
