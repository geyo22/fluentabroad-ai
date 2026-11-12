import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    const whereClause: Record<string, string> = {};
    if (category && category !== "ALL") whereClause.category = category;
    if (difficulty && difficulty !== "ALL") whereClause.difficulty = difficulty;

    const exercises = await prisma.listeningExercise.findMany({
      where: whereClause,
      include: {
        attempts: {
          where: { userId: "default-user" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const parsed = exercises.map((ex) => ({
      ...ex,
      dialogue: JSON.parse(ex.dialogueJson),
      questions: JSON.parse(ex.questionsJson),
      bestScore: ex.attempts[0]?.score ?? null,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Listening API GET error:", error);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exerciseId, answers, timeSpentSec = 60 } = body;

    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const questions: { id: string; correctIndex: number; explanation: string }[] = JSON.parse(
      exercise.questionsJson
    );

    let correctCount = 0;
    const results = questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    const attempt = await prisma.listeningAttempt.create({
      data: {
        userId: "default-user",
        exerciseId,
        score,
        answersJson: JSON.stringify(answers),
        timeSpentSec,
      },
    });

    // Record listening session duration
    const durationMinutes = Math.max(1, Math.round(timeSpentSec / 60));
    await prisma.learningSession.create({
      data: {
        userId: "default-user",
        activityType: "LISTENING",
        durationMinutes,
        score,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      totalQuestions: questions.length,
      correctCount,
      results,
    });
  } catch (error) {
    console.error("Listening API POST error:", error);
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 });
  }
}
