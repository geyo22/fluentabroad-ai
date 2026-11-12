import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey, isGeminiConfigured } from "@/lib/gemini";

export async function GET() {
  try {
    const user = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
    });

    // 1. Activity in the last 7 days (Daily breakdown for Recharts)
    const days: { [key: string]: { date: string; day: string; listening: number; speaking: number; vocab: number; other: number } } = {};
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];
      days[dateStr] = {
        date: dateStr,
        day: dayName,
        listening: 0,
        speaking: 0,
        vocab: 0,
        other: 0,
      };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await prisma.learningSession.findMany({
      where: {
        userId: "default-user",
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "asc" },
    });

    recentSessions.forEach((s) => {
      const dateStr = s.createdAt.toISOString().split("T")[0];
      if (days[dateStr]) {
        if (s.activityType === "LISTENING") days[dateStr].listening += s.durationMinutes;
        else if (s.activityType === "SPEAKING") days[dateStr].speaking += s.durationMinutes;
        else if (s.activityType === "VOCABULARY") days[dateStr].vocab += s.durationMinutes;
        else days[dateStr].other += s.durationMinutes;
      }
    });

    const weeklyChartData = Object.values(days);

    // 2. Skill Radar / Distribution Breakdown
    const allSessions = await prisma.learningSession.findMany({
      where: { userId: "default-user" },
    });

    const skillTotals: { [key: string]: number } = {
      Listening: 0,
      Speaking: 0,
      Vocabulary: 0,
      Scenarios: 0,
      Lessons: 0,
    };

    allSessions.forEach((s) => {
      if (s.activityType === "LISTENING") skillTotals["Listening"] += s.durationMinutes;
      else if (s.activityType === "SPEAKING") skillTotals["Speaking"] += s.durationMinutes;
      else if (s.activityType === "VOCABULARY") skillTotals["Vocabulary"] += s.durationMinutes;
      else if (s.activityType === "SCENARIO") skillTotals["Scenarios"] += s.durationMinutes;
      else if (s.activityType === "LESSON") skillTotals["Lessons"] += s.durationMinutes;
    });

    const skillDistribution = Object.entries(skillTotals).map(([name, minutes]) => ({
      name,
      minutes,
    }));

    // 3. Vocabulary Mastery levels count
    const vocabLevels = await prisma.vocabularyItem.groupBy({
      by: ["masteryLevel"],
      where: { userId: "default-user" },
      _count: { id: true },
    });

    const vocabBreakdown = [0, 1, 2, 3, 4, 5].map((lvl) => {
      const match = vocabLevels.find((v) => v.masteryLevel === lvl);
      return {
        level: `Level ${lvl}`,
        count: match?._count.id || 0,
      };
    });

    // 4. Total stats
    const totalMinutes = allSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const completedLessonsCount = await prisma.lessonProgress.count({
      where: { userId: "default-user", status: "COMPLETED" },
    });
    const totalLessonsCount = await prisma.lesson.count();
    const passedScenariosCount = await prisma.scenarioAttempt.count({
      where: { userId: "default-user", status: "PASSED" },
    });

    // 5. Generate Weekly Summary Report using Gemini or deterministic analysis
    let weeklyReport = {
      accomplishments: `Menyelesaikan ${totalMinutes} menit waktu belajar aktif dan ${completedLessonsCount} modul pelajaran.`,
      strengths: ["Konsisten berlatih pengenalan kosa kata", "Aktif dalam simulasi skenario bandara"],
      recurringDifficulties: ["Respons spontan di bawah 3 detik perlu dilatih lebih sering", "Membedakan intonasi pertanyaan klarifikasi"],
      recommendedFocus: "Fokus pada Shadowing & Pronunciation Lab minggu ini untuk mempercepat reflek berbicara.",
    };

    if (isGeminiConfigured()) {
      try {
        const apiKey = getGeminiApiKey();
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" },
          });

          const prompt = `Generate a realistic English learning weekly report for Indonesian student Rian Pratama preparing for Jan 2027 abroad departure.
Current Level: ${user?.currentLevel || "B1"}
Total Study Minutes: ${totalMinutes}
Completed Lessons: ${completedLessonsCount}/${totalLessonsCount}
Passed Scenarios: ${passedScenariosCount}

Return JSON strictly:
{
  "accomplishments": "2 sentences summarizing progress",
  "strengths": ["point 1", "point 2"],
  "recurringDifficulties": ["point 1", "point 2"],
  "recommendedFocus": "concrete advice for next week in Indonesian"
}`;
          const res = await model.generateContent(prompt);
          weeklyReport = JSON.parse(res.response.text());
        }
      } catch (e) {
        console.warn("AI weekly report generation fallback:", e);
      }
    }

    return NextResponse.json({
      totalMinutes,
      completedLessonsCount,
      totalLessonsCount,
      passedScenariosCount,
      weeklyChartData,
      skillDistribution,
      vocabBreakdown,
      weeklyReport,
      recentSessions: allSessions.slice(-10).reverse(),
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
