import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSessionFeedback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const user = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
    });

    const transcript = conversation.messages.map((m) => ({
      sender: m.sender,
      content: m.content,
    }));

    const feedback = await generateSessionFeedback(transcript, {
      mode: conversation.mode,
      topic: conversation.topic,
      partnerRole: conversation.partnerRole || undefined,
      currentLevel: user?.currentLevel || "B1",
      targetLevel: user?.targetLevel || "B2",
      explanationLanguage: user?.explanationLanguage || "id",
    });

    // Update conversation record with summary and feedback JSON
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: "COMPLETED",
        summary: feedback.summary,
        feedbackJson: JSON.stringify(feedback),
      },
    });

    // Also persist in SpeakingAssessment
    await prisma.speakingAssessment.create({
      data: {
        userId: "default-user",
        conversationId,
        source: "CONVERSATION",
        wordCount: transcript
          .filter((t) => t.sender === "USER")
          .reduce((acc, t) => acc + t.content.split(/\s+/).length, 0),
        fluencyEstimate: feedback.fluencyRating,
        feedbackJson: JSON.stringify(feedback),
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate conversation feedback" },
      { status: 500 }
    );
  }
}

