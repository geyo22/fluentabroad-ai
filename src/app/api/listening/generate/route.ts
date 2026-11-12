import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateAIListeningExercise } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { category = "SOCIAL", difficulty = "B1", customTopic = "" } = body;

    // Call Gemini to generate a brand new authentic exercise
    const generated = await generateAIListeningExercise({
      category,
      difficulty,
      customTopic,
    });

    // Save directly into SQLite database so it becomes a permanent exercise
    const newExercise = await prisma.listeningExercise.create({
      data: {
        title: generated.title,
        category: generated.category,
        difficulty: generated.difficulty,
        audioDurationSec: generated.audioDurationSec || 45,
        dialogueJson: JSON.stringify(generated.dialogue),
        questionsJson: JSON.stringify(generated.questions),
        tips: generated.tips,
      },
    });

    return NextResponse.json({
      ...newExercise,
      dialogue: generated.dialogue,
      questions: generated.questions,
      bestScore: null,
    });
  } catch (error) {
    console.error("Error generating listening exercise:", error);
    return NextResponse.json(
      { error: "Gagal membuat latihan listening baru" },
      { status: 500 }
    );
  }
}

