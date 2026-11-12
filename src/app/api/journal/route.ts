import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: "default-user" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Journal GET error:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, content, difficulties, newPhrases, confidenceRating = 3 } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    if (id) {
      const updated = await prisma.journalEntry.update({
        where: { id },
        data: {
          title: title.trim(),
          content: content.trim(),
          difficulties: difficulties ? difficulties.trim() : null,
          newPhrases: newPhrases ? newPhrases.trim() : null,
          confidenceRating: Number(confidenceRating),
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.journalEntry.create({
      data: {
        userId: "default-user",
        title: title.trim(),
        content: content.trim(),
        difficulties: difficulties ? difficulties.trim() : null,
        newPhrases: newPhrases ? newPhrases.trim() : null,
        confidenceRating: Number(confidenceRating),
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Journal POST error:", error);
    return NextResponse.json({ error: "Failed to save journal entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Journal DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}

