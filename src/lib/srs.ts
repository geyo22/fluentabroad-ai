/**
 * Spaced Repetition System (SRS) using SuperMemo-2 (SM-2) algorithm.
 * Deterministic scheduling for vocabulary flashcards and recall practice.
 */

export interface SRSReviewInput {
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  rating: number; // 1: Again (failed), 2: Hard, 3: Good, 4: Easy
}

export interface SRSReviewOutput {
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: Date;
  masteryLevel: number; // 0 to 5
}

export function calculateSRS({
  repetition,
  intervalDays,
  easeFactor,
  rating,
}: SRSReviewInput): SRSReviewOutput {
  let nextRepetition = repetition;
  let nextInterval = intervalDays;
  let nextEaseFactor = easeFactor;

  // Rating 1: Failed recall (Again)
  if (rating < 3) {
    nextRepetition = 0;
    nextInterval = 1;
    // Ease factor decreases slightly on failure
    nextEaseFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Rating 3 (Good) or 4 (Easy)
    if (nextRepetition === 0) {
      nextInterval = 1;
    } else if (nextRepetition === 1) {
      nextInterval = rating === 4 ? 6 : 4;
    } else {
      nextInterval = Math.round(intervalDays * easeFactor);
      if (rating === 4) {
        nextInterval = Math.round(nextInterval * 1.3);
      }
    }
    nextRepetition += 1;

    // Standard SM-2 ease factor formula mapping:
    // rating 3 -> grade 4, rating 4 -> grade 5
    const grade = rating === 4 ? 5 : 4;
    nextEaseFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;
  }

  // Calculate next review date based on interval in days
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  // Map repetition to mastery level 0-5
  const masteryLevel = Math.min(5, Math.max(0, nextRepetition));

  return {
    repetition: nextRepetition,
    intervalDays: nextInterval,
    easeFactor: Number(nextEaseFactor.toFixed(2)),
    nextReviewDate,
    masteryLevel,
  };
}

