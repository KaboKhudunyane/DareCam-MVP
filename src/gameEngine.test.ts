import { describe, expect, it } from 'vitest';
import { calculateAward, makeVerifiedScore, nextCardIndex, rotateQueueIndex } from './gameEngine';

describe('game engine', () => {
  it('advances the queue in a loop', () => {
    expect(rotateQueueIndex(0, 3)).toBe(1);
    expect(rotateQueueIndex(2, 3)).toBe(0);
  });

  it('advances cards in a loop', () => {
    expect(nextCardIndex(0, 4)).toBe(1);
    expect(nextCardIndex(3, 4)).toBe(0);
  });

  it('awards points correctly', () => {
    expect(calculateAward(420, 150)).toBe(570);
  });

  it('guards against duplicate verification', () => {
    expect(makeVerifiedScore(420, 150, false)).toEqual({ nextScore: 570, verified: true });
    expect(makeVerifiedScore(570, 150, true)).toEqual({ nextScore: 570, verified: true });
  });
});
