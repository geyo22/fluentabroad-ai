import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const weeks = await prisma.curriculumWeek.findMany({
      orderBy: { weekNumber: "asc" },
      include: {
        lessons: {
          orderBy: { dayNumber: "asc" },
          include: {
            progress: {
              where: { userId: "default-user" },
            },
          },
        },
      },
    });

    return NextResponse.json(weeks);
  } catch (error) {
    console.error("Error fetching learning path:", error);
    return NextResponse.json({ error: "Failed to fetch learning path" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { lessonId, timeSpentMinutes = 15, score = 100 } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: "default-user",
          lessonId,
        },
      },
      update: {
        status: "COMPLETED",
        score,
        timeSpentMinutes: { increment: timeSpentMinutes },
        completedAt: new Date(),
      },
      create: {
        userId: "default-user",
        lessonId,
        status: "COMPLETED",
        score,
        timeSpentMinutes,
        completedAt: new Date(),
      },
    });

    // Record session duration in LearningSession
    await prisma.learningSession.create({
      data: {
        userId: "default-user",
        activityType: "LESSON",
        durationMinutes: timeSpentMinutes,
        score,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}

