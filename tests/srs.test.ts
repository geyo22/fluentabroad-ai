import { describe, it, expect } from "vitest";
import { calculateSRS } from "../src/lib/srs";
import { compareTranscriptToTarget } from "../src/components/AudioSpeech";

describe("Spaced Repetition System (SM-2) Unit Tests", () => {
  it("should reset interval to 1 on failure (rating 1: Again)", () => {
    const result = calculateSRS({
      repetition: 4,
      intervalDays: 16,
      easeFactor: 2.5,
      rating: 1, // failed recall
    });

    expect(result.repetition).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.5);
    expect(result.masteryLevel).toBe(0);
  });

  it("should advance repetition and increase interval on successful recall (rating 3: Good)", () => {
    const firstReview = calculateSRS({
      repetition: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      rating: 3,
    });

    expect(firstReview.repetition).toBe(1);
    expect(firstReview.intervalDays).toBe(1);

    const secondReview = calculateSRS({
      repetition: 1,
      intervalDays: 1,
      easeFactor: firstReview.easeFactor,
      rating: 3,
    });

    expect(secondReview.repetition).toBe(2);
    expect(secondReview.intervalDays).toBe(4);
  });

  it("should accelerate interval for Easy rating (rating 4)", () => {
    const easyReview = calculateSRS({
      repetition: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      rating: 4,
    });

    expect(easyReview.repetition).toBe(2);
    expect(easyReview.intervalDays).toBe(6);
    expect(easyReview.easeFactor).toBeGreaterThan(2.5);
  });

  it("should never allow ease factor to drop below 1.3", () => {
    let ef = 1.4;
    for (let i = 0; i < 5; i++) {
      const res = calculateSRS({
        repetition: 0,
        intervalDays: 1,
        easeFactor: ef,
        rating: 1,
      });
      ef = res.easeFactor;
    }

    expect(ef).toBeGreaterThanOrEqual(1.3);
  });
});

describe("Word Recognition Similarity & Transcript Matching Unit Tests", () => {
  it("should calculate 100% similarity for identical spoken sentence", () => {
    const target = "Could you tell me where the station is located?";
    const spoken = "Could you tell me where the station is located";

    const res = compareTranscriptToTarget(spoken, target);
    expect(res.similarityScore).toBe(100);
    expect(res.wordComparison.every((w) => w.matched)).toBe(true);
  });

  it("should calculate partial match percentage for missed words", () => {
    const target = "I would like an iced americano with oat milk";
    const spoken = "I would like coffee with milk";

    const res = compareTranscriptToTarget(spoken, target);
    expect(res.similarityScore).toBeGreaterThan(0);
    expect(res.similarityScore).toBeLessThan(100);

    const matchedWords = res.wordComparison.filter((w) => w.matched).map((w) => w.word);
    expect(matchedWords).toContain("i");
    expect(matchedWords).toContain("would");
    expect(matchedWords).toContain("like");
    expect(matchedWords).toContain("with");
    expect(matchedWords).toContain("milk");
  });

  it("should handle empty spoken text gracefully", () => {
    const target = "Hello world";
    const res = compareTranscriptToTarget("", target);

    expect(res.similarityScore).toBe(0);
  });
});

describe("Progress & Scoring Calculation Rules", () => {
  it("should correctly calculate daily percentage capped at 100", () => {
    const calcProgress = (done: number, goal: number) => Math.min(100, Math.round((done / goal) * 100));

    expect(calcProgress(45, 90)).toBe(50);
    expect(calcProgress(90, 90)).toBe(100);
    expect(calcProgress(120, 90)).toBe(100);
  });

  it("should estimate CEFR placement level accurately based on average rubric score", () => {
    const estimateLevel = (avg: number) => {
      if (avg >= 85) return "B2";
      if (avg >= 65) return "B1";
      if (avg >= 45) return "A2";
      return "A1";
    };

    expect(estimateLevel(92)).toBe("B2");
    expect(estimateLevel(75)).toBe("B1");
    expect(estimateLevel(50)).toBe("A2");
    expect(estimateLevel(30)).toBe("A1");
  });
});

