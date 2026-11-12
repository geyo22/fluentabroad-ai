import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateAIVocabularyBatch } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { topic = "Abroad Survival & Campus Life", count = 3 } = body;

    const generatedItems = await generateAIVocabularyBatch({ topic, count });

    const createdItems = [];
    for (const item of generatedItems) {
      const created = await prisma.vocabularyItem.create({
        data: {
          userId: "default-user",
          phrase: item.phrase,
          translation: item.translation,
          exampleSentence: item.exampleSentence,
          context: item.context,
          topic: item.topic || topic,
          difficulty: item.difficulty || "Medium",
          masteryLevel: 0,
          intervalDays: 1,
          repetitions: 0,
          nextReviewDate: new Date(),
        },
      });
      createdItems.push(created);
    }

    return NextResponse.json({
      success: true,
      count: createdItems.length,
      items: createdItems,
    });
  } catch (error) {
    console.error("Error generating vocabulary batch:", error);
    return NextResponse.json(
      { error: "Gagal menghasilkan kosa kata baru" },
      { status: 500 }
    );
  }
}

