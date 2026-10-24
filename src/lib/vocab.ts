import type { VocabEntry } from '../types/content';
import type { VocabState } from '../types/progress';

/** Minutes until a word is due again, indexed by Leitner box. */
export const BOX_INTERVALS_MIN = [0, 10, 60 * 24, 60 * 24 * 3, 60 * 24 * 7, 60 * 24 * 14];
export const MAX_BOX = BOX_INTERVALS_MIN.length - 1;
/** A word counts as mastered once it reaches this box through correct answers. */
export const MASTERED_BOX = 3;

export type VocabStatus = 'new' | 'learning' | 'practice' | 'mastered';

export const VOCAB_STATUS_LABELS: Record<VocabStatus, string> = {
  new: 'Belum diuji',
  learning: 'Sedang dipelajari',
  practice: 'Perlu latihan',
  mastered: 'Dikuasai',
};

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

/**
 * Updates a word's state after a quiz answer.
 * - Correct while due (or never tested): move up one box and schedule the next review.
 * - Correct before it is due: counts as correct but does not promote (no cramming).
 * - Incorrect: back to box 0 and due immediately.
 */
export function applyVocabAnswer(prev: VocabState | undefined, correct: boolean, at: string): VocabState {
  const base: VocabState = prev ?? { box: 0, correct: 0, incorrect: 0 };
  if (!correct) {
    return { ...base, box: 0, incorrect: base.incorrect + 1, lastResult: 'incorrect', lastAnsweredAt: at, dueAt: at };
  }
  const due = !base.dueAt || base.dueAt <= at || base.lastResult !== 'correct';
  const box = due ? Math.min(base.box + 1, MAX_BOX) : base.box;
  return {
    ...base,
    box,
    // A correct answer is evidence that supersedes a self-set "needs practice" flag.
    selfMark: base.selfMark === 'practice' ? undefined : base.selfMark,
    correct: base.correct + 1,
    lastResult: 'correct',
    lastAnsweredAt: at,
    dueAt: due ? addMinutes(at, BOX_INTERVALS_MIN[box]) : base.dueAt,
  };
}

export function vocabStatus(state: VocabState | undefined): VocabStatus {
  if (!state || state.correct + state.incorrect === 0) {
    return state?.selfMark === 'practice' ? 'practice' : 'new';
  }
  if (state.lastResult === 'incorrect') return 'practice';
  if (state.selfMark === 'practice') return 'practice';
  if (state.box >= MASTERED_BOX) return 'mastered';
  return 'learning';
}

/** True when the word should be revised now. New, untested words are not "due". */
export function isDue(state: VocabState | undefined, nowIso: string): boolean {
  if (!state) return false;
  if (vocabStatus(state) === 'practice') return true;
  if (state.correct + state.incorrect === 0) return false;
  return !!state.dueAt && state.dueAt <= nowIso;
}

/** Words needing revision: marked/answered as needing practice, or due for spaced review. */
export function revisionCount(entries: VocabEntry[], states: Record<string, VocabState>, nowIso: string): number {
  return entries.filter((e) => isDue(states[e.id], nowIso)).length;
}

/**
 * Picks words for a revision session: needing practice first, then due words,
 * then new words, then words still being learned. Mastered words come last.
 */
export function selectRevisionWords(
  entries: VocabEntry[],
  states: Record<string, VocabState>,
  nowIso: string,
  count: number,
): VocabEntry[] {
  const rank = (e: VocabEntry): number => {
    const s = states[e.id];
    const status = vocabStatus(s);
    if (status === 'practice') return 0;
    if (isDue(s, nowIso)) return 1;
    if (status === 'new') return 2;
    if (status === 'learning') return 3;
    return 4;
  };
  return entries
    .map((e, i) => ({ e, i, r: rank(e) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, count)
    .map((x) => x.e);
}
