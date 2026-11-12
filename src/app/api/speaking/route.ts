import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTutorReply, ChatMessage, isGeminiConfigured } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  try {
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
      return NextResponse.json(conversation);
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: "default-user" },
      orderBy: { updatedAt: "desc" },
      take: 15,
      include: {
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId: existingId,
      message,
      mode = "FREE",
      topic = "Everyday Life",
      partnerRole,
    } = body;

    const user = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
      include: { preferences: true },
    });

    const currentLevel = user?.currentLevel || "B1";
    const targetLevel = user?.targetLevel || "B2";
    const explanationLanguage = user?.explanationLanguage || "id";

    let conversationId = existingId;

    // Create new conversation session if not exists
    if (!conversationId) {
      const newConv = await prisma.conversation.create({
        data: {
          userId: "default-user",
          mode,
          topic,
          partnerRole,
          status: "ACTIVE",
        },
      });
      conversationId = newConv.id;
    }

    // Save user message
    if (message && message.trim()) {
      await prisma.conversationMessage.create({
        data: {
          conversationId,
          sender: "USER",
          content: message.trim(),
        },
      });
    }

    // Retrieve full conversation history
    const allMessages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    // Format chat history for Gemini
    const chatHistory: ChatMessage[] = allMessages.map((m) => ({
      role: m.sender === "USER" ? "user" : "model",
      content: m.content,
    }));

    // If this is the start of a new conversation and user hasn't spoken yet
    if (chatHistory.length === 0) {
      chatHistory.push({
        role: "user",
        content: `Hi! I want to start a session in ${mode} mode about: "${topic}". Please initiate our conversation with a natural question or greeting suitable for ${currentLevel} level.`,
      });
    }

    // Call Gemini speaking tutor
    const startTime = Date.now();
    const reply = await getTutorReply(chatHistory, {
      mode,
      topic,
      partnerRole,
      currentLevel,
      targetLevel,
      explanationLanguage,
    });
    const latencyMs = Date.now() - startTime;

    // Save AI response message
    const aiMessage = await prisma.conversationMessage.create({
      data: {
        conversationId,
        sender: "AI",
        content: reply.text,
        latencyMs,
      },
    });

    // Record learning duration activity in LearningSession
    await prisma.learningSession.create({
      data: {
        userId: "default-user",
        activityType: "SPEAKING",
        durationMinutes: 2, // 2 minutes increment per conversational interaction
      },
    });

    return NextResponse.json({
      conversationId,
      message: aiMessage,
      isConfigured: reply.isConfigured,
    });
  } catch (error) {
    console.error("Speaking API Error:", error);
    return NextResponse.json(
      { error: "Failed to process speaking turn" },
      { status: 500 }
    );
  }
}
