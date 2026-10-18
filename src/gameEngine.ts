export function rotateQueueIndex(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return (currentIndex + 1) % total;
}

export function nextCardIndex(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return (currentIndex + 1) % total;
}

export function calculateAward(currentScore: number, bonus: number): number {
  return currentScore + bonus;
}

export function makeVerifiedScore(
  currentScore: number,
  bonus: number,
  alreadyVerified: boolean,
): { nextScore: number; verified: boolean } {
  if (alreadyVerified) {
    return { nextScore: currentScore, verified: true };
  }

  return { nextScore: calculateAward(currentScore, bonus), verified: true };
}
