import { describe, expect, it } from 'vitest';
import { MASTERED_BOX, applyVocabAnswer, isDue, revisionCount, selectRevisionWords, vocabStatus } from './vocab';
import { VOCABULARY } from '../content';

const t0 = '2026-01-01T08:00:00.000Z';
const later = (minutes: number) => new Date(new Date(t0).getTime() + minutes * 60_000).toISOString();

describe('spaced revision', () => {
  it('promotes a word only when it is due', () => {
    const s1 = applyVocabAnswer(undefined, true, t0);
    expect(s1.box).toBe(1);
    expect(s1.dueAt).toBe(later(10));
    // Answering again immediately (not due yet) counts as correct but does not promote.
    const s2 = applyVocabAnswer(s1, true, later(1));
    expect(s2.box).toBe(1);
    expect(s2.correct).toBe(2);
    // After the interval it is due and moves up.
    const s3 = applyVocabAnswer(s2, true, later(11));
    expect(s3.box).toBe(2);
  });

  it('sends a missed word back to the start and marks it for practice', () => {
    let s = applyVocabAnswer(undefined, true, t0);
    s = applyVocabAnswer(s, true, later(20));
    s = applyVocabAnswer(s, false, later(30));
    expect(s.box).toBe(0);
    expect(s.incorrect).toBe(1);
    expect(vocabStatus(s)).toBe('practice');
    expect(isDue(s, later(30))).toBe(true);
  });

  it('requires several spaced correct answers for mastery', () => {
    let s = applyVocabAnswer(undefined, true, t0);
    s = applyVocabAnswer(s, true, later(15));
    expect(vocabStatus(s)).toBe('learning');
    s = applyVocabAnswer(s, true, later(15 + 60 * 24 + 1));
    expect(s.box).toBe(MASTERED_BOX);
    expect(vocabStatus(s)).toBe('mastered');
  });

  it('does not treat a self-mark as mastery', () => {
    expect(vocabStatus({ box: 0, correct: 0, incorrect: 0, selfMark: 'known' })).toBe('new');
    expect(vocabStatus({ box: 0, correct: 0, incorrect: 0, selfMark: 'practice' })).toBe('practice');
  });

  it('clears a "needs practice" self-mark after a correct answer', () => {
    const s = applyVocabAnswer({ box: 0, correct: 0, incorrect: 0, selfMark: 'practice' }, true, t0);
    expect(s.selfMark).toBeUndefined();
    expect(vocabStatus(s)).toBe('learning');
  });

  it('counts words due for revision and prioritises missed words', () => {
    const [a, b, c] = VOCABULARY;
    const states = {
      [a.id]: applyVocabAnswer(undefined, false, t0),
      [b.id]: applyVocabAnswer(undefined, true, t0),
    };
    expect(revisionCount(VOCABULARY, states, later(1))).toBe(1);
    expect(revisionCount(VOCABULARY, states, later(11))).toBe(2);
    const picked = selectRevisionWords(VOCABULARY, states, later(11), 3);
    expect(picked[0].id).toBe(a.id);
    expect(picked[1].id).toBe(b.id);
    expect(picked[2].id).toBe(c.id);
  });
});
