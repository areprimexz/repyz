import { STATE_VERSION, type AppState } from '../types/progress';
import type { QuestionResponse } from '../types/content';
import { createInitialState } from './initialState';

export const STORAGE_KEY = 'english-lab:state';
export const BACKUP_KEY = 'english-lab:unreadable-backup';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type LoadStatus = 'fresh' | 'restored' | 'recovered' | 'unavailable';

export interface LoadResult {
  state: AppState;
  status: LoadStatus;
  /** Number of records dropped because they were malformed. */
  dropped: number;
}

/** Returns usable storage, or null when the browser blocks or lacks localStorage. */
export function detectStorage(candidate?: StorageLike | null): StorageLike | null {
  try {
    const storage = candidate === undefined ? (typeof window !== 'undefined' ? window.localStorage : null) : candidate;
    if (!storage) return null;
    const probe = '__english_lab_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Validation helpers — stored data is untrusted (it may be edited, truncated
// or written by an older version), so each record is checked individually.
// ---------------------------------------------------------------------------

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const optStr = (v: unknown): string | undefined => (isStr(v) ? v : undefined);
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isStr) : []);

class Counter {
  dropped = 0;
}

function record<T>(raw: unknown, validate: (value: unknown, key: string) => T | null, counter: Counter): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    const v = validate(value, key);
    if (v === null) counter.dropped++;
    else out[key] = v;
  }
  return out;
}

function list<T>(raw: unknown, validate: (value: unknown) => T | null, counter: Counter): T[] {
  if (!Array.isArray(raw)) return [];
  const out: T[] = [];
  for (const value of raw) {
    const v = validate(value);
    if (v === null) counter.dropped++;
    else out.push(v);
  }
  return out;
}

export function validateResponse(v: unknown): QuestionResponse | null {
  if (!isObj(v) || !isStr(v.type)) return null;
  switch (v.type) {
    case 'choice':
    case 'text':
      return isStr(v.value) ? { type: v.type, value: v.value } : null;
    case 'multi':
    case 'order':
      return Array.isArray(v.value) ? { type: v.type, value: strArray(v.value) } : null;
    case 'match': {
      if (!isObj(v.value)) return null;
      const value: Record<string, string> = {};
      for (const [k, x] of Object.entries(v.value)) if (isStr(x)) value[k] = x;
      return { type: 'match', value };
    }
    default:
      return null;
  }
}

function responses(raw: unknown): Record<string, QuestionResponse> {
  const out: Record<string, QuestionResponse> = {};
  if (!isObj(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    const r = validateResponse(v);
    if (r) out[k] = r;
  }
  return out;
}

const SOURCES = ['lesson', 'gym', 'vocab', 'mistakes', 'exam'] as const;
const SKILLS = ['email', 'essay', 'grammar', 'vocabulary'] as const;
const STATUSES = ['correct', 'partial', 'incorrect', 'unanswered'] as const;

function oneOf<T extends string>(v: unknown, options: readonly T[]): v is T {
  return isStr(v) && (options as readonly string[]).includes(v);
}

function validateResult(v: unknown) {
  if (!isObj(v) || !isStr(v.questionId) || !oneOf(v.status, STATUSES) || !isNum(v.earned) || !isNum(v.marks)) return null;
  if (!oneOf(v.skill, SKILLS) || !isStr(v.tag)) return null;
  const response = v.response === undefined ? undefined : validateResponse(v.response) ?? undefined;
  return { questionId: v.questionId, status: v.status, earned: v.earned, marks: v.marks, skill: v.skill, tag: v.tag, response };
}

export function validateState(raw: unknown): { state: AppState; dropped: number } | null {
  if (!isObj(raw) || !isNum(raw.version) || raw.version < 1 || raw.version > STATE_VERSION) return null;
  const c = new Counter();
  const base = createInitialState(isStr(raw.createdAt) ? raw.createdAt : undefined);
  const prefs = isObj(raw.preferences) ? raw.preferences : {};

  const state: AppState = {
    ...base,
    onboarded: raw.onboarded === true,
    preferences: {
      displayName: isStr(prefs.displayName) ? prefs.displayName.slice(0, 40) : '',
      textSize: prefs.textSize === 'large' ? 'large' : 'normal',
    },
    lessons: record(
      raw.lessons,
      (v) =>
        isObj(v)
          ? { readAck: v.readAck === true || undefined, completedAt: optStr(v.completedAt), lastOpenedAt: optStr(v.lastOpenedAt) }
          : null,
      c,
    ),
    currentLessonId: isStr(raw.currentLessonId) ? raw.currentLessonId : null,
    quizSessions: record(
      raw.quizSessions,
      (v, key) => {
        if (!isObj(v) || !oneOf(v.source, SOURCES) || !isNum(v.seed) || !Array.isArray(v.questionIds)) return null;
        return {
          slot: key,
          source: v.source,
          title: isStr(v.title) ? v.title : '',
          lessonId: optStr(v.lessonId),
          activityId: optStr(v.activityId),
          feedback: v.feedback === 'instant' ? 'instant' : 'end',
          questionIds: strArray(v.questionIds),
          seed: v.seed,
          responses: responses(v.responses),
          checked: strArray(v.checked),
          startedAt: isStr(v.startedAt) ? v.startedAt : base.createdAt,
          attemptId: optStr(v.attemptId),
        };
      },
      c,
    ),
    attempts: list(
      raw.attempts,
      (v) => {
        if (!isObj(v) || !isStr(v.id) || !isStr(v.slot) || !oneOf(v.source, SOURCES) || !isStr(v.submittedAt)) return null;
        return {
          id: v.id,
          slot: v.slot,
          source: v.source,
          title: isStr(v.title) ? v.title : '',
          lessonId: optStr(v.lessonId),
          activityId: optStr(v.activityId),
          startedAt: isStr(v.startedAt) ? v.startedAt : v.submittedAt,
          submittedAt: v.submittedAt,
          results: list(v.results, validateResult, c),
          earned: isNum(v.earned) ? v.earned : 0,
          total: isNum(v.total) ? v.total : 0,
        };
      },
      c,
    ),
    mistakes: record(
      raw.mistakes,
      (v, key) => {
        if (!isObj(v) || !oneOf(v.skill, SKILLS) || !isStr(v.tag) || !isNum(v.timesWrong) || !isStr(v.lastWrongAt)) return null;
        return {
          questionId: key,
          skill: v.skill,
          tag: v.tag,
          timesWrong: v.timesWrong,
          firstWrongAt: isStr(v.firstWrongAt) ? v.firstWrongAt : v.lastWrongAt,
          lastWrongAt: v.lastWrongAt,
          lastResponse: v.lastResponse === undefined ? undefined : validateResponse(v.lastResponse) ?? undefined,
          resolved: v.resolved === true,
          resolvedAt: optStr(v.resolvedAt),
        };
      },
      c,
    ),
    vocab: record(
      raw.vocab,
      (v) => {
        if (!isObj(v) || !isNum(v.box) || !isNum(v.correct) || !isNum(v.incorrect)) return null;
        return {
          box: Math.max(0, Math.min(5, Math.round(v.box))),
          correct: v.correct,
          incorrect: v.incorrect,
          selfMark: v.selfMark === 'known' || v.selfMark === 'practice' ? v.selfMark : undefined,
          lastResult: v.lastResult === 'correct' || v.lastResult === 'incorrect' ? v.lastResult : undefined,
          lastAnsweredAt: optStr(v.lastAnsweredAt),
          dueAt: optStr(v.dueAt),
        };
      },
      c,
    ),
    shortResponses: record(
      raw.shortResponses,
      (v) =>
        isObj(v)
          ? record(
              v,
              (item) =>
                isObj(item) && isStr(item.text)
                  ? {
                      text: item.text,
                      updatedAt: isStr(item.updatedAt) ? item.updatedAt : base.createdAt,
                      submittedAt: optStr(item.submittedAt),
                      ticks: Array.isArray(item.ticks) ? item.ticks.filter(isNum) : undefined,
                    }
                  : null,
              c,
            )
          : null,
      c,
    ),
    drafts: record(
      raw.drafts,
      (v, key) =>
        isObj(v) && isStr(v.text)
          ? {
              promptId: key,
              text: v.text,
              plan: isObj(v.plan) ? Object.fromEntries(Object.entries(v.plan).filter(([, x]) => isStr(x))) as Record<string, string> : {},
              checklist: strArray(v.checklist),
              updatedAt: isStr(v.updatedAt) ? v.updatedAt : base.createdAt,
              lastSubmittedId: optStr(v.lastSubmittedId),
            }
          : null,
      c,
    ),
    submissions: list(
      raw.submissions,
      (v) => {
        if (!isObj(v) || !isStr(v.id) || !isStr(v.promptId) || !isStr(v.text) || !isStr(v.submittedAt)) return null;
        if (v.writingType !== 'email' && v.writingType !== 'essay') return null;
        const scores: Record<string, number> = {};
        if (isObj(v.rubricScores)) for (const [k, x] of Object.entries(v.rubricScores)) if (isNum(x)) scores[k] = x;
        return {
          id: v.id,
          promptId: v.promptId,
          writingType: v.writingType,
          context: v.context === 'exam' ? 'exam' : 'studio',
          text: v.text,
          plan: isObj(v.plan) ? Object.fromEntries(Object.entries(v.plan).filter(([, x]) => isStr(x))) as Record<string, string> : {},
          checklist: strArray(v.checklist),
          wordCount: isNum(v.wordCount) ? v.wordCount : 0,
          submittedAt: v.submittedAt,
          version: isNum(v.version) ? v.version : 1,
          pointsTicked: strArray(v.pointsTicked),
          rubricScores: isObj(v.rubricScores) ? scores : undefined,
          rubricAt: optStr(v.rubricAt),
          reflection: optStr(v.reflection),
        };
      },
      c,
    ),
    exams: list(
      raw.exams,
      (v) => {
        if (!isObj(v) || !isStr(v.id) || !isStr(v.startedAt) || !isStr(v.endsAt) || !isStr(v.promptId) || !isNum(v.seed)) return null;
        if (v.status !== 'in-progress' && v.status !== 'submitted' && v.status !== 'abandoned') return null;
        const cfg = isObj(v.config) ? v.config : {};
        return {
          id: v.id,
          config: {
            writingType: cfg.writingType === 'email' || cfg.writingType === 'essay' ? cfg.writingType : 'any',
            difficulty: cfg.difficulty === 1 || cfg.difficulty === 3 ? cfg.difficulty : 2,
            durationMin: isNum(cfg.durationMin) ? cfg.durationMin : 35,
            grammarCount: isNum(cfg.grammarCount) ? cfg.grammarCount : 8,
            vocabCount: isNum(cfg.vocabCount) ? cfg.vocabCount : 6,
          },
          status: v.status,
          createdAt: isStr(v.createdAt) ? v.createdAt : v.startedAt,
          startedAt: v.startedAt,
          endsAt: v.endsAt,
          submittedAt: optStr(v.submittedAt),
          autoSubmitted: v.autoSubmitted === true || undefined,
          grammarIds: strArray(v.grammarIds),
          vocabIds: strArray(v.vocabIds),
          seed: v.seed,
          promptId: v.promptId,
          responses: responses(v.responses),
          writing: isStr(v.writing) ? v.writing : '',
          writingSavedAt: optStr(v.writingSavedAt),
          results: v.results === undefined ? undefined : list(v.results, validateResult, c),
          objectiveEarned: isNum(v.objectiveEarned) ? v.objectiveEarned : undefined,
          objectiveTotal: isNum(v.objectiveTotal) ? v.objectiveTotal : undefined,
          submissionId: optStr(v.submissionId),
          reviewedAt: optStr(v.reviewedAt),
        };
      },
      c,
    ),
    activity: list(
      raw.activity,
      (v) => (isObj(v) && isStr(v.id) && isStr(v.at) && isStr(v.kind) && isStr(v.text) ? (v as unknown as AppState['activity'][number]) : null),
      c,
    ),
  };
  return { state, dropped: c.dropped };
}

export function loadState(storage: StorageLike | null): LoadResult {
  if (!storage) return { state: createInitialState(), status: 'unavailable', dropped: 0 };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: createInitialState(), status: 'unavailable', dropped: 0 };
  }
  if (raw === null) return { state: createInitialState(), status: 'fresh', dropped: 0 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  const validated = validateState(parsed);
  if (!validated) {
    // Keep the unreadable data so it is never silently destroyed.
    try {
      storage.setItem(BACKUP_KEY, raw);
    } catch {
      /* ignore */
    }
    return { state: createInitialState(), status: 'recovered', dropped: 0 };
  }
  return { state: validated.state, status: 'restored', dropped: validated.dropped };
}

export function saveState(storage: StorageLike | null, state: AppState): { ok: boolean; error?: string } {
  if (!storage) return { ok: false, error: 'unavailable' };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    // DOMException is not always an Error instance (e.g. in some engines), so read its name directly.
    const name = typeof error === 'object' && error !== null && 'name' in error ? String((error as { name: unknown }).name) : 'unknown';
    return { ok: false, error: name };
  }
}
