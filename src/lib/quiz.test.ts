import { describe, expect, it } from 'vitest';
import type { Question } from '../types/content';
import { buildResult, gradeQuestion, isAnswered, reviewQuestion, summarize, toPublicQuestion } from './quiz';
import { answersMatch } from './normalize';

const mcq: Question = {
  id: 'q-mcq',
  type: 'mcq',
  skill: 'grammar',
  tag: 'sva',
  prompt: 'He ___ to school.',
  options: [
    { id: 'a', text: 'goes' },
    { id: 'b', text: 'go' },
    { id: 'c', text: 'going' },
    { id: 'd', text: 'gone' },
  ],
  answer: ['a'],
  explanation: 'x',
};

const multi: Question = {
  id: 'q-multi',
  type: 'multi',
  skill: 'email',
  tag: 'email-task',
  prompt: 'Pick',
  options: [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
    { id: 'c', text: 'C' },
  ],
  answer: ['a', 'b'],
  explanation: 'x',
};

const correction: Question = {
  id: 'q-cor',
  type: 'correction',
  skill: 'grammar',
  tag: 'sva',
  prompt: 'Fix',
  text: 'She go to school.',
  accepted: ['She goes to school.'],
  explanation: 'x',
};

const strict: Question = { ...correction, id: 'q-strict', compare: 'strict', text: 'i like english.', accepted: ['I like English.'] } as Question;

const order: Question = {
  id: 'q-order',
  type: 'order',
  skill: 'essay',
  tag: 'peel',
  prompt: 'Order',
  items: [
    { id: 'p', text: 'P' },
    { id: 'e', text: 'E' },
    { id: 'x', text: 'X' },
    { id: 'l', text: 'L' },
  ],
  answer: [['p', 'e', 'x', 'l']],
  explanation: 'x',
};

const match: Question = {
  id: 'q-match',
  type: 'match',
  skill: 'essay',
  tag: 'linking',
  prompt: 'Match',
  left: [
    { id: 'l1', text: 'However' },
    { id: 'l2', text: 'For example' },
    { id: 'l3', text: 'Therefore' },
  ],
  right: [
    { id: 'r1', text: 'contrast' },
    { id: 'r2', text: 'example' },
    { id: 'r3', text: 'result' },
  ],
  answer: { l1: 'r1', l2: 'r2', l3: 'r3' },
  explanation: 'x',
};

describe('answer normalisation', () => {
  it('ignores case, extra spaces and final full stop in loose mode', () => {
    expect(answersMatch('  she   GOES to school ', 'She goes to school.')).toBe(true);
    expect(answersMatch('She goes to school!', 'She goes to school.')).toBe(true);
  });
  it('unifies curly apostrophes', () => {
    expect(answersMatch('It’s raining outside.', "It's raining outside.")).toBe(true);
  });
  it('keeps case and punctuation in strict mode', () => {
    expect(answersMatch('i like english.', 'I like English.', 'strict')).toBe(false);
    expect(answersMatch('I like English.', 'I like English.', 'strict')).toBe(true);
    expect(answersMatch('I like English', 'I like English.', 'strict')).toBe(false);
  });
  it('never matches an empty answer', () => {
    expect(answersMatch('   ', '')).toBe(false);
  });
});

describe('gradeQuestion', () => {
  it('distinguishes unanswered from incorrect', () => {
    expect(gradeQuestion(mcq, undefined).status).toBe('unanswered');
    expect(gradeQuestion(mcq, { type: 'choice', value: 'b' }).status).toBe('incorrect');
    expect(gradeQuestion(mcq, { type: 'choice', value: 'a' })).toMatchObject({ status: 'correct', earned: 1, marks: 1 });
    expect(gradeQuestion(correction, { type: 'text', value: '   ' }).status).toBe('unanswered');
  });

  it('treats a response of the wrong shape as unanswered', () => {
    expect(gradeQuestion(mcq, { type: 'text', value: 'goes' }).status).toBe('unanswered');
  });

  it('requires exactly the right set for multi-select', () => {
    expect(gradeQuestion(multi, { type: 'multi', value: ['b', 'a'] }).status).toBe('correct');
    expect(gradeQuestion(multi, { type: 'multi', value: ['a'] }).status).toBe('incorrect');
    expect(gradeQuestion(multi, { type: 'multi', value: ['a', 'b', 'c'] }).status).toBe('incorrect');
  });

  it('grades typed corrections against accepted answers', () => {
    expect(gradeQuestion(correction, { type: 'text', value: 'she goes to school' }).status).toBe('correct');
    expect(gradeQuestion(correction, { type: 'text', value: 'She go to school.' }).status).toBe('incorrect');
    expect(gradeQuestion(strict, { type: 'text', value: 'i like English.' }).status).toBe('incorrect');
    expect(gradeQuestion(strict, { type: 'text', value: 'I like English.' }).status).toBe('correct');
  });

  it('grades ordering questions', () => {
    expect(gradeQuestion(order, { type: 'order', value: ['p', 'e', 'x', 'l'] }).status).toBe('correct');
    expect(gradeQuestion(order, { type: 'order', value: ['e', 'p', 'x', 'l'] }).status).toBe('incorrect');
  });

  it('gives partial credit per pair for matching', () => {
    const partial = gradeQuestion(match, { type: 'match', value: { l1: 'r1', l2: 'r3' } });
    expect(partial).toMatchObject({ status: 'partial', earned: 1, marks: 3 });
    expect(partial.pairs).toEqual({ l1: true, l2: false, l3: false });
    expect(gradeQuestion(match, { type: 'match', value: { l1: 'r1', l2: 'r2', l3: 'r3' } }).status).toBe('correct');
    expect(gradeQuestion(match, { type: 'match', value: {} }).status).toBe('unanswered');
  });
});

describe('summarize', () => {
  it('adds marks and counts each status', () => {
    const results = [
      buildResult(mcq, { type: 'choice', value: 'a' }),
      buildResult(mcq, { type: 'choice', value: 'b' }),
      buildResult(correction, undefined),
      buildResult(match, { type: 'match', value: { l1: 'r1' } }),
    ];
    const s = summarize(results);
    expect(s).toMatchObject({ earned: 2, total: 6, correct: 1, incorrect: 1, unanswered: 1, partial: 1 });
    expect(s.percent).toBe(33);
  });

  it('returns 0% for an empty attempt', () => {
    expect(summarize([]).percent).toBe(0);
  });
});

describe('toPublicQuestion', () => {
  it('never exposes answer keys or explanations', () => {
    for (const q of [mcq, multi, correction, order, match]) {
      const pub = toPublicQuestion(q, 42) as unknown as Record<string, unknown>;
      expect(pub.answer).toBeUndefined();
      expect(pub.accepted).toBeUndefined();
      expect(pub.explanation).toBeUndefined();
    }
  });

  it('shuffles deterministically for the same seed', () => {
    const a = toPublicQuestion(mcq, 7);
    const b = toPublicQuestion(mcq, 7);
    expect(a).toEqual(b);
  });

  it('keeps every option after shuffling', () => {
    const pub = toPublicQuestion(mcq, 99);
    if (pub.type !== 'mcq') throw new Error('type');
    expect(pub.options.map((o) => o.id).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('never starts an ordering question in the correct order', () => {
    for (let seed = 0; seed < 200; seed++) {
      const pub = toPublicQuestion(order, seed);
      if (pub.type !== 'order') throw new Error('type');
      expect(pub.items.map((i) => i.id).join('')).not.toBe('pexl');
    }
  });

  it('does not shuffle true/false options', () => {
    const tf: Question = { ...mcq, id: 'tf', type: 'truefalse', options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }], answer: ['true'] } as Question;
    for (let seed = 0; seed < 20; seed++) {
      const pub = toPublicQuestion(tf, seed);
      if (pub.type !== 'truefalse') throw new Error('type');
      expect(pub.options[0].id).toBe('true');
    }
  });
});

describe('isAnswered and reviewQuestion', () => {
  it('requires a full ordering to count as answered', () => {
    expect(isAnswered(order, { type: 'order', value: ['p', 'e'] })).toBe(false);
    expect(isAnswered(order, { type: 'order', value: ['p', 'e', 'x', 'l'] })).toBe(true);
  });

  it('describes the correct answer and the student answer', () => {
    const review = reviewQuestion(correction, { type: 'text', value: 'She go school' });
    expect(review.status).toBe('incorrect');
    expect(review.correctAnswers).toEqual(['She goes to school.']);
    expect(review.yourAnswer).toBe('She go school');
    expect(review.typed).toBe(true);
    expect(reviewQuestion(mcq, undefined).yourAnswer).toBe('Tidak dijawab');
  });
});
