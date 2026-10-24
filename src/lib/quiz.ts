import type { ChoiceOption, Question, QuestionResponse } from '../types/content';
import type { QuestionResult, ResultStatus } from '../types/progress';
import { answersMatch } from './normalize';
import { deriveSeed, seededShuffle } from './random';

// ---------------------------------------------------------------------------
// Public (render-safe) questions — the UI never receives answer keys.
// ---------------------------------------------------------------------------

export type PublicQuestion =
  | {
      id: string;
      type: 'mcq' | 'phrase' | 'peel' | 'truefalse' | 'multi';
      prompt: string;
      context?: string;
      options: ChoiceOption[];
    }
  | {
      id: string;
      type: 'fill' | 'correction';
      prompt: string;
      context?: string;
      text: string;
      placeholder?: string;
    }
  | { id: string; type: 'order'; prompt: string; context?: string; items: ChoiceOption[] }
  | {
      id: string;
      type: 'match';
      prompt: string;
      context?: string;
      left: ChoiceOption[];
      right: ChoiceOption[];
    };

function shouldShuffle(question: Question): boolean {
  if (question.type === 'truefalse' || question.type === 'peel') return question.shuffle === true;
  if ('shuffle' in question && question.shuffle === false) return false;
  return true;
}

/** Initial order for an ordering question; guaranteed not to be already correct. */
function scrambledOrder(question: Extract<Question, { type: 'order' }>, seed: number): ChoiceOption[] {
  const correct = question.answer.map((order) => order.join('|'));
  for (let attempt = 0; attempt < 12; attempt++) {
    const shuffled = seededShuffle(question.items, deriveSeed(seed, `${question.id}:${attempt}`));
    if (!correct.includes(shuffled.map((item) => item.id).join('|'))) return shuffled;
  }
  // Fall back to reversing, which is never equal to a correct order of 2+ items.
  return question.items.slice().reverse();
}

export function toPublicQuestion(question: Question, seed: number): PublicQuestion {
  const qSeed = deriveSeed(seed, question.id);
  switch (question.type) {
    case 'mcq':
    case 'phrase':
    case 'peel':
    case 'truefalse':
    case 'multi':
      return {
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        context: question.context,
        options: shouldShuffle(question) ? seededShuffle(question.options, qSeed) : question.options,
      };
    case 'fill':
    case 'correction':
      return {
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        context: question.context,
        text: question.text,
        placeholder: question.placeholder,
      };
    case 'order':
      return {
        id: question.id,
        type: 'order',
        prompt: question.prompt,
        context: question.context,
        items: scrambledOrder(question, seed),
      };
    case 'match':
      return {
        id: question.id,
        type: 'match',
        prompt: question.prompt,
        context: question.context,
        left: question.left,
        right: seededShuffle(question.right, qSeed),
      };
  }
}

// ---------------------------------------------------------------------------
// Validation and grading
// ---------------------------------------------------------------------------

export function marksFor(question: Question): number {
  return question.type === 'match' ? question.left.length : 1;
}

/** True when the student has given any answer at all. */
export function isAnswered(question: Question, response: QuestionResponse | undefined): boolean {
  if (!response) return false;
  switch (response.type) {
    case 'choice':
      return response.value.length > 0;
    case 'multi':
      return response.value.length > 0;
    case 'text':
      return response.value.trim().length > 0;
    case 'order':
      return question.type === 'order' && response.value.length === question.items.length;
    case 'match':
      return Object.values(response.value).some((v) => v.length > 0);
  }
}

/** Checks that a response has the shape expected by the question type. */
export function responseMatchesType(question: Question, response: QuestionResponse): boolean {
  switch (question.type) {
    case 'mcq':
    case 'phrase':
    case 'peel':
    case 'truefalse':
      return response.type === 'choice';
    case 'multi':
      return response.type === 'multi';
    case 'fill':
    case 'correction':
      return response.type === 'text';
    case 'order':
      return response.type === 'order';
    case 'match':
      return response.type === 'match';
  }
}

export interface GradeOutcome {
  status: ResultStatus;
  earned: number;
  marks: number;
  /** Per-pair correctness for match questions. */
  pairs?: Record<string, boolean>;
}

export function gradeQuestion(question: Question, response: QuestionResponse | undefined): GradeOutcome {
  const marks = marksFor(question);
  if (!response || !responseMatchesType(question, response) || !isAnswered(question, response)) {
    return { status: 'unanswered', earned: 0, marks };
  }

  switch (question.type) {
    case 'mcq':
    case 'phrase':
    case 'peel':
    case 'truefalse': {
      const ok = response.type === 'choice' && question.answer.includes(response.value);
      return { status: ok ? 'correct' : 'incorrect', earned: ok ? 1 : 0, marks };
    }
    case 'multi': {
      const chosen = response.type === 'multi' ? new Set(response.value) : new Set<string>();
      const expected = new Set(question.answer);
      const ok = chosen.size === expected.size && [...expected].every((id) => chosen.has(id));
      return { status: ok ? 'correct' : 'incorrect', earned: ok ? 1 : 0, marks };
    }
    case 'fill':
    case 'correction': {
      const given = response.type === 'text' ? response.value : '';
      const ok = question.accepted.some((accepted) => answersMatch(given, accepted, question.compare ?? 'loose'));
      return { status: ok ? 'correct' : 'incorrect', earned: ok ? 1 : 0, marks };
    }
    case 'order': {
      const given = response.type === 'order' ? response.value.join('|') : '';
      const ok = question.answer.some((order) => order.join('|') === given);
      return { status: ok ? 'correct' : 'incorrect', earned: ok ? 1 : 0, marks };
    }
    case 'match': {
      const given = response.type === 'match' ? response.value : {};
      const pairs: Record<string, boolean> = {};
      let earned = 0;
      for (const left of question.left) {
        const ok = given[left.id] === question.answer[left.id];
        pairs[left.id] = ok;
        if (ok) earned++;
      }
      const status: ResultStatus = earned === marks ? 'correct' : earned === 0 ? 'incorrect' : 'partial';
      return { status, earned, marks, pairs };
    }
  }
}

export function buildResult(question: Question, response: QuestionResponse | undefined): QuestionResult {
  const outcome = gradeQuestion(question, response);
  return {
    questionId: question.id,
    status: outcome.status,
    earned: outcome.earned,
    marks: outcome.marks,
    skill: question.skill,
    tag: question.tag,
    response,
  };
}

export interface ScoreSummary {
  earned: number;
  total: number;
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  percent: number;
}

export function summarize(results: QuestionResult[]): ScoreSummary {
  const summary: ScoreSummary = { earned: 0, total: 0, correct: 0, partial: 0, incorrect: 0, unanswered: 0, percent: 0 };
  for (const r of results) {
    summary.earned += r.earned;
    summary.total += r.marks;
    summary[r.status] += 1;
  }
  summary.percent = summary.total > 0 ? Math.round((summary.earned / summary.total) * 100) : 0;
  return summary;
}

// ---------------------------------------------------------------------------
// Describing answers for review screens
// ---------------------------------------------------------------------------

function optionText(options: ChoiceOption[], id: string): string {
  return options.find((o) => o.id === id)?.text ?? id;
}

/** Human-readable correct answer(s). */
export function describeCorrectAnswer(question: Question): string[] {
  switch (question.type) {
    case 'mcq':
    case 'phrase':
    case 'peel':
    case 'truefalse':
    case 'multi':
      return question.answer.map((id) => optionText(question.options, id));
    case 'fill':
    case 'correction':
      return question.accepted.slice(0, 3);
    case 'order':
      return [question.answer[0].map((id, i) => `${i + 1}. ${optionText(question.items, id)}`).join('\n')];
    case 'match':
      return question.left.map((l) => `${l.text} → ${optionText(question.right, question.answer[l.id])}`);
  }
}

/** Everything a review screen needs, prepared outside the rendering components. */
export interface QuestionReview {
  status: ResultStatus;
  earned: number;
  marks: number;
  correctAnswers: string[];
  yourAnswer: string;
  explanation: string;
  /** Option ids that are correct (choice questions), used for highlighting. */
  correctOptionIds: string[];
  pairs?: Record<string, boolean>;
  /** Typed answers may have valid alternatives that are not in the answer list. */
  typed: boolean;
}

export function reviewQuestion(question: Question, response: QuestionResponse | undefined): QuestionReview {
  const outcome = gradeQuestion(question, response);
  return {
    status: outcome.status,
    earned: outcome.earned,
    marks: outcome.marks,
    correctAnswers: describeCorrectAnswer(question),
    yourAnswer: describeResponse(question, response),
    explanation: question.explanation,
    correctOptionIds: 'options' in question ? question.answer : [],
    pairs: outcome.pairs,
    typed: question.type === 'fill' || question.type === 'correction',
  };
}

/** Human-readable version of what the student answered. */
export function describeResponse(question: Question, response: QuestionResponse | undefined): string {
  if (!response || !isAnswered(question, response)) return 'Tidak dijawab';
  switch (response.type) {
    case 'choice':
      return 'options' in question ? optionText(question.options, response.value) : response.value;
    case 'multi':
      return 'options' in question ? response.value.map((id) => optionText(question.options, id)).join('; ') : '';
    case 'text':
      return response.value.trim();
    case 'order':
      return question.type === 'order'
        ? response.value.map((id, i) => `${i + 1}. ${optionText(question.items, id)}`).join('\n')
        : '';
    case 'match':
      return question.type === 'match'
        ? question.left
            .map((l) => `${l.text} → ${response.value[l.id] ? optionText(question.right, response.value[l.id]) : '—'}`)
            .join('\n')
        : '';
  }
}
