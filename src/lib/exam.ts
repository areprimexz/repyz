import type { Difficulty, Question, VocabLevel, WritingPrompt } from '../types/content';
import type { MockExam, MockExamConfig } from '../types/progress';
import { GRAMMAR_TOPICS, VOCABULARY, WRITING_PROMPTS, allGrammarQuestions, vocabQuestionId, type VocabQuestionType } from '../content';
import { createRng, deriveSeed, seededShuffle, uid } from './random';

export const DEFAULT_EXAM_CONFIG: MockExamConfig = {
  writingType: 'any',
  difficulty: 2,
  durationMin: 35,
  grammarCount: 8,
  vocabCount: 6,
};

export const DURATION_OPTIONS = [20, 30, 35, 45, 60];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = { 1: 'Asas', 2: 'Sederhana', 3: 'Mencabar' };

function grammarPool(difficulty: Difficulty): Question[] {
  const all = allGrammarQuestions();
  if (difficulty === 1) return all.filter((q) => (q.difficulty ?? 2) <= 2);
  if (difficulty === 3) return all.filter((q) => (q.difficulty ?? 2) >= 2);
  return all;
}

/** Picks grammar questions spread across topics (round-robin) for broad coverage. */
export function pickGrammar(difficulty: Difficulty, count: number, seed: number): string[] {
  const pool = grammarPool(difficulty);
  const byTopic = GRAMMAR_TOPICS.map((t) =>
    seededShuffle(
      pool.filter((q) => q.tag === t.id),
      deriveSeed(seed, t.id),
    ),
  );
  const topicOrder = seededShuffle(
    byTopic.map((_, i) => i),
    deriveSeed(seed, 'topics'),
  );
  const out: string[] = [];
  for (let round = 0; out.length < count; round++) {
    let added = false;
    for (const i of topicOrder) {
      const q = byTopic[i][round];
      if (q && out.length < count) {
        out.push(q.id);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

const LEVELS_FOR: Record<Difficulty, VocabLevel[]> = {
  1: ['basic'],
  2: ['basic', 'intermediate'],
  3: ['intermediate', 'advanced'],
};

export function pickVocab(difficulty: Difficulty, count: number, seed: number): string[] {
  const pool = VOCABULARY.filter((v) => LEVELS_FOR[difficulty].includes(v.level));
  const rng = createRng(deriveSeed(seed, 'vocab-types'));
  const types: VocabQuestionType[] = ['meaning', 'word', 'cloze'];
  return seededShuffle(pool, deriveSeed(seed, 'vocab'))
    .slice(0, count)
    .map((v) => vocabQuestionId(types[Math.floor(rng() * types.length)], v.id));
}

/** Chooses a writing prompt matching type and difficulty, preferring ones not used in earlier exams. */
export function pickPrompt(config: MockExamConfig, seed: number, usedPromptIds: string[] = []): WritingPrompt {
  const typed = WRITING_PROMPTS.filter((p) => config.writingType === 'any' || p.type === config.writingType);
  const byDistance = (p: WritingPrompt) => Math.abs(p.difficulty - config.difficulty);
  const minDistance = Math.min(...typed.map(byDistance));
  const closest = typed.filter((p) => byDistance(p) === minDistance);
  const fresh = closest.filter((p) => !usedPromptIds.includes(p.id));
  const candidates = fresh.length > 0 ? fresh : closest;
  return seededShuffle(candidates, deriveSeed(seed, 'prompt'))[0];
}

export function buildExam(config: MockExamConfig, nowIso: string, seed: number, usedPromptIds: string[] = []): MockExam {
  const start = new Date(nowIso);
  return {
    id: uid('exam'),
    config,
    status: 'in-progress',
    createdAt: nowIso,
    startedAt: nowIso,
    endsAt: new Date(start.getTime() + config.durationMin * 60_000).toISOString(),
    grammarIds: pickGrammar(config.difficulty, config.grammarCount, seed),
    vocabIds: pickVocab(config.difficulty, config.vocabCount, seed),
    seed,
    promptId: pickPrompt(config, seed, usedPromptIds).id,
    responses: {},
    writing: '',
  };
}

export function remainingMs(exam: MockExam, nowMs: number): number {
  return Math.max(0, new Date(exam.endsAt).getTime() - nowMs);
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
