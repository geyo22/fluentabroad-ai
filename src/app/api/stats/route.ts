import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          currentLevel: "B1",
          targetLevel: "B2",
          todayMinutes: 0,
          dailyGoalMinutes: 90,
          streakDays: 0,
          completedLessons: 0,
          vocabMastered: 0,
          conversationsCount: 0,
          weeklyProgress: 0,
          daysRemaining: 400,
        },
        { status: 200 }
      );
    }

    // Calculate today's learning duration
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySessions = await prisma.learningSession.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startOfToday },
      },
    });

    const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    // Total counts
    const completedLessons = await prisma.lessonProgress.count({
      where: { userId: user.id, status: "COMPLETED" },
    });

    const vocabMastered = await prisma.vocabularyItem.count({
      where: { userId: user.id, masteryLevel: { gte: 3 } },
    });

    const conversationsCount = await prisma.conversation.count({
      where: { userId: user.id },
    });

    const totalSessions = await prisma.learningSession.findMany({
      where: { userId: user.id },
      select: { durationMinutes: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const totalStudyTimeMinutes = totalSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    // Calculate consecutive streak days
    let streakDays = 0;
    const sessionDates = new Set(
      totalSessions.map((s) => s.createdAt.toISOString().split("T")[0])
    );
    const checkDate = new Date();
    // If no session today, check if yesterday had one to maintain streak
    const todayStr = checkDate.toISOString().split("T")[0];
    if (!sessionDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (sessionDates.has(dateStr)) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Days remaining until departure
    const targetDate = new Date(user.targetDate);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Weekly progress (past 7 days target vs actual)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekSessions = await prisma.learningSession.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
    });
    const weekMinutes = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const weeklyTarget = (user.dailyGoalMinutes || 90) * 7;
    const weeklyProgress = Math.min(100, Math.round((weekMinutes / weeklyTarget) * 100));

    return NextResponse.json({
      userName: user.name,
      currentLevel: user.currentLevel,
      targetLevel: user.targetLevel,
      todayMinutes,
      dailyGoalMinutes: user.dailyGoalMinutes,
      totalStudyTimeMinutes,
      streakDays,
      completedLessons,
      vocabMastered,
      conversationsCount,
      weeklyProgress,
      daysRemaining,
      preferences: user.preferences,
      isOnboarded: user.isOnboarded,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

