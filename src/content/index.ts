import type { DayNumber, Lesson, LessonActivity, Question, VocabEntry } from '../types/content';
import { hashString, seededShuffle } from '../lib/random';
import { day1Lessons } from './day1/lessons';
import { day1Questions } from './day1/questions';
import { day2Lessons } from './day2/lessons';
import { day2Questions } from './day2/questions';
import { day3Lessons } from './day3/lessons';
import { day3Questions } from './day3/questions';
import { GRAMMAR_TOPICS, grammarQuestions } from './day3/grammar';
import { POS_LABELS, VOCABULARY, getVocab } from './vocabulary';

export { DAYS, getDay } from './days';
export { GRAMMAR_TOPICS } from './day3/grammar';
export { VOCABULARY, getVocab } from './vocabulary';
export { WRITING_PROMPTS, getPrompt } from './writingPrompts';

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export const LESSONS: Lesson[] = [...day1Lessons, ...day2Lessons, ...day3Lessons];

const lessonById = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id);
}

export function lessonsForDay(day: DayNumber): Lesson[] {
  return LESSONS.filter((l) => l.day === day);
}

export function adjacentLessons(id: string): { prev?: Lesson; next?: Lesson } {
  const index = LESSONS.findIndex((l) => l.id === id);
  if (index < 0) return {};
  return { prev: LESSONS[index - 1], next: LESSONS[index + 1] };
}

/** All activities in a lesson, including quick checks inside lesson parts. */
export function lessonActivities(lesson: Lesson): LessonActivity[] {
  const checks = lesson.parts.flatMap((p) => (p.check ? [p.check] : []));
  return [...checks, ...lesson.activities];
}

export function dayDurationMin(day: DayNumber): number {
  return lessonsForDay(day).reduce((sum, l) => sum + l.durationMin, 0);
}

// ---------------------------------------------------------------------------
// Question registry
// ---------------------------------------------------------------------------

const STATIC_QUESTIONS: Question[] = [...day1Questions, ...day2Questions, ...day3Questions, ...grammarQuestions];

const questionById = new Map(STATIC_QUESTIONS.map((q) => [q.id, q]));

export function allStaticQuestions(): Question[] {
  return STATIC_QUESTIONS;
}

export function grammarQuestionsForTopic(topicId: string): Question[] {
  return grammarQuestions.filter((q) => q.tag === topicId);
}

export function allGrammarQuestions(): Question[] {
  return grammarQuestions;
}

export function grammarTopic(id: string) {
  return GRAMMAR_TOPICS.find((t) => t.id === id);
}

export type VocabQuestionType = 'meaning' | 'word' | 'cloze';

export function vocabQuestionId(type: VocabQuestionType, wordId: string): string {
  return `v:${type}:${wordId}`;
}

export function parseVocabQuestionId(id: string): { type: VocabQuestionType; wordId: string } | null {
  const match = /^v:(meaning|word|cloze):(.+)$/.exec(id);
  return match ? { type: match[1] as VocabQuestionType, wordId: match[2] } : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function clozeSentence(entry: VocabEntry): string | null {
  const re = new RegExp(`\\b${escapeRegExp(entry.word)}\\b`, 'i');
  return re.test(entry.example) ? entry.example.replace(re, '_____') : null;
}

function distractors(entry: VocabEntry, key: string): VocabEntry[] {
  const eligible = VOCABULARY.filter((v) => v.id !== entry.id && (!entry.group || v.group !== entry.group));
  const samePos = eligible.filter((v) => v.pos === entry.pos);
  const pool = samePos.length >= 3 ? samePos : eligible;
  return seededShuffle(pool, hashString(key)).slice(0, 3);
}

function vocabExplanation(entry: VocabEntry): string {
  const parts = [`**${entry.word}** (${POS_LABELS[entry.pos]}) — ${entry.meaningMs}.`, `Contoh: "${entry.example}"`];
  if (entry.note) parts.push(entry.note);
  return parts.join(' ');
}

/** Builds a vocabulary question deterministically from its id. */
export function buildVocabQuestion(id: string): Question | undefined {
  const parsed = parseVocabQuestionId(id);
  if (!parsed) return undefined;
  const entry = getVocab(parsed.wordId);
  if (!entry) return undefined;
  const others = distractors(entry, id);
  const base = { id, skill: 'vocabulary' as const, tag: 'vocab', explanation: vocabExplanation(entry) };
  const level = { basic: 1, intermediate: 2, advanced: 3 } as const;
  const sentence = parsed.type === 'cloze' ? clozeSentence(entry) : null;
  // A cloze needs the headword in the example; otherwise ask for the meaning (same id).
  const type = parsed.type === 'cloze' && !sentence ? 'meaning' : parsed.type;

  if (type === 'meaning') {
    return {
      ...base,
      type: 'mcq',
      difficulty: level[entry.level],
      prompt: `What does **${entry.word}** mean?`,
      options: [entry, ...others].map((v) => ({ id: v.id, text: v.meaningMs })),
      answer: [entry.id],
    };
  }
  if (type === 'word') {
    return {
      ...base,
      type: 'mcq',
      difficulty: level[entry.level],
      prompt: `Which English word means "${entry.meaningMs}"?`,
      options: [entry, ...others].map((v) => ({ id: v.id, text: v.word })),
      answer: [entry.id],
    };
  }
  return {
    ...base,
    type: 'mcq',
    difficulty: level[entry.level],
    prompt: `Choose the word that best completes the sentence. (Petunjuk: "${entry.meaningMs}")`,
    context: sentence ?? undefined,
    options: [entry, ...others].map((v) => ({ id: v.id, text: v.word })),
    answer: [entry.id],
  };
}

const vocabCache = new Map<string, Question>();

export function resolveQuestion(id: string): Question | undefined {
  const fixed = questionById.get(id);
  if (fixed) return fixed;
  if (!id.startsWith('v:')) return undefined;
  const cached = vocabCache.get(id);
  if (cached) return cached;
  const built = buildVocabQuestion(id);
  if (built) vocabCache.set(id, built);
  return built;
}

export function resolveQuestions(ids: string[]): Question[] {
  return ids.map(resolveQuestion).filter((q): q is Question => Boolean(q));
}
