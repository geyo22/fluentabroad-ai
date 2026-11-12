import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateSRS } from "@/lib/srs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "due", "all", "mastered"
    const topic = searchParams.get("topic");

    const now = new Date();
    const where: any = { userId: "default-user" };

    if (filter === "due") {
      where.nextReviewDate = { lte: now };
    } else if (filter === "mastered") {
      where.masteryLevel = { gte: 3 };
    }

    if (topic && topic !== "ALL") {
      where.topic = topic;
    }

    const items = await prisma.vocabularyItem.findMany({
      where,
      orderBy: [{ nextReviewDate: "asc" }, { createdAt: "desc" }],
    });

    const totalCount = await prisma.vocabularyItem.count({ where: { userId: "default-user" } });
    const dueCount = await prisma.vocabularyItem.count({
      where: { userId: "default-user", nextReviewDate: { lte: now } },
    });
    const masteredCount = await prisma.vocabularyItem.count({
      where: { userId: "default-user", masteryLevel: { gte: 3 } },
    });

    return NextResponse.json({
      items,
      stats: {
        total: totalCount,
        due: dueCount,
        mastered: masteredCount,
      },
    });
  } catch (error) {
    console.error("Vocabulary GET error:", error);
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phrase, translation, exampleSentence, context, topic = "General", difficulty = "Medium" } = body;

    if (!phrase || !translation) {
      return NextResponse.json({ error: "Phrase and translation are required" }, { status: 400 });
    }

    const item = await prisma.vocabularyItem.create({
      data: {
        userId: "default-user",
        phrase: phrase.trim(),
        translation: translation.trim(),
        exampleSentence: exampleSentence ? exampleSentence.trim() : `I learned "${phrase.trim()}" for real-life conversations.`,
        context: context ? context.trim() : null,
        topic,
        difficulty,
        masteryLevel: 0,
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewDate: new Date(),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Vocabulary POST error:", error);
    return NextResponse.json({ error: "Failed to add vocabulary" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, rating } = body; // rating 1: Again, 2: Hard, 3: Good, 4: Easy

    const item = await prisma.vocabularyItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Vocabulary item not found" }, { status: 404 });
    }

    const srsResult = calculateSRS({
      repetition: item.repetitions,
      intervalDays: item.intervalDays,
      easeFactor: item.easeFactor,
      rating: Number(rating),
    });

    // Save review record
    await prisma.vocabularyReview.create({
      data: {
        vocabularyItemId: id,
        rating: Number(rating),
      },
    });

    // Update vocabulary item state
    const updated = await prisma.vocabularyItem.update({
      where: { id },
      data: {
        repetitions: srsResult.repetition,
        intervalDays: srsResult.intervalDays,
        easeFactor: srsResult.easeFactor,
        nextReviewDate: srsResult.nextReviewDate,
        masteryLevel: srsResult.masteryLevel,
        lastReviewedAt: new Date(),
      },
    });

    // Increment vocabulary learning time
    await prisma.learningSession.create({
      data: {
        userId: "default-user",
        activityType: "VOCABULARY",
        durationMinutes: 1,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Vocabulary PUT error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

