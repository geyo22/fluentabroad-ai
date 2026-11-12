import { NextRequest, NextResponse } from "next/server";
import { generateAIShadowingSentence } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { category = "Everyday Abroad", customTopic = "" } = body;

    const generated = await generateAIShadowingSentence({
      category,
      customTopic,
    });

    return NextResponse.json({
      id: `ai_${Date.now()}`,
      category: generated.category,
      targetSentence: generated.targetSentence,
      translation: generated.translation,
      phoneticTips: generated.phoneticTips,
      connectedSpeechNote: generated.connectedSpeechNote,
    });
  } catch (error) {
    console.error("Error generating shadowing sentence:", error);
    return NextResponse.json(
      { error: "Gagal membuat latihan shadowing baru" },
      { status: 500 }
    );
  }
}

