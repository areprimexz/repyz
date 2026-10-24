import { describe, expect, it } from 'vitest';
import {
  DAYS,
  GRAMMAR_TOPICS,
  LESSONS,
  VOCABULARY,
  WRITING_PROMPTS,
  allStaticQuestions,
  clozeSentence,
  grammarQuestionsForTopic,
  lessonActivities,
  lessonsForDay,
  resolveQuestion,
} from './index';
import { TAGS } from './tags';
import { LEARNING_RUBRIC } from './rubric';
import { countWords } from '../lib/writing';
import { normalizeLoose, normalizeStrict } from '../lib/normalize';

describe('curriculum', () => {
  it('has three days with lessons and roughly two hours each', () => {
    expect(DAYS).toHaveLength(3);
    for (const d of DAYS) {
      const lessons = lessonsForDay(d.day);
      expect(lessons.length).toBeGreaterThanOrEqual(6);
      const minutes = lessons.reduce((s, l) => s + l.durationMin, 0);
      expect(minutes).toBeGreaterThanOrEqual(110);
      expect(minutes).toBeLessThanOrEqual(130);
    }
  });

  it('gives every lesson objectives, real content and at least one activity', () => {
    for (const l of LESSONS) {
      expect(l.objectives.length, l.id).toBeGreaterThan(0);
      expect(l.parts.length, l.id).toBeGreaterThan(0);
      const textLength = JSON.stringify(l.parts).length;
      expect(textLength, `${l.id} content`).toBeGreaterThan(600);
      expect(lessonActivities(l).length, l.id).toBeGreaterThan(0);
      expect(l.summary.length, l.id).toBeGreaterThan(0);
    }
  });

  it('uses unique lesson and activity ids', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    const activityIds = LESSONS.flatMap((l) => lessonActivities(l).map((a) => a.id));
    expect(new Set(activityIds).size).toBe(activityIds.length);
  });

  it('references only questions and prompts that exist', () => {
    for (const l of LESSONS) {
      for (const a of lessonActivities(l)) {
        if (a.kind === 'quiz') {
          expect(a.questionIds.length, a.id).toBeGreaterThan(0);
          for (const id of a.questionIds) expect(resolveQuestion(id), `${a.id} → ${id}`).toBeDefined();
        }
        if (a.kind === 'writing-task') {
          expect(a.promptIds.length).toBeGreaterThanOrEqual(3);
          for (const id of a.promptIds) expect(WRITING_PROMPTS.some((p) => p.id === id), id).toBe(true);
          const types = new Set(a.promptIds.map((id) => WRITING_PROMPTS.find((p) => p.id === id)!.difficulty));
          expect(types.size, 'varied difficulty').toBeGreaterThan(1);
        }
      }
    }
  });
});

describe('question bank', () => {
  const questions = allStaticQuestions();

  it('has unique ids, known tags and an explanation for every question', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of questions) {
      expect(TAGS[q.tag], `${q.id} tag ${q.tag}`).toBeDefined();
      expect(q.explanation.length, q.id).toBeGreaterThan(20);
      expect(q.prompt.length, q.id).toBeGreaterThan(3);
    }
  });

  it('has valid answer keys', () => {
    for (const q of questions) {
      switch (q.type) {
        case 'mcq':
        case 'phrase':
        case 'peel':
        case 'truefalse':
        case 'multi': {
          const optionIds = q.options.map((o) => o.id);
          expect(new Set(optionIds).size, q.id).toBe(optionIds.length);
          expect(q.answer.length, q.id).toBeGreaterThan(0);
          for (const a of q.answer) expect(optionIds, q.id).toContain(a);
          if (q.type !== 'multi') expect(q.answer, `${q.id} single answer`).toHaveLength(1);
          // Exact comparison: some options intentionally differ only in capitalisation.
          const texts = q.options.map((o) => o.text);
          expect(new Set(texts).size, `${q.id} duplicate option text`).toBe(texts.length);
          break;
        }
        case 'fill':
          expect(q.text, q.id).toContain('___');
          expect(q.accepted.length, q.id).toBeGreaterThan(0);
          break;
        case 'correction': {
          expect(q.accepted.length, q.id).toBeGreaterThan(0);
          const normalize = q.compare === 'strict' ? normalizeStrict : normalizeLoose;
          // The uncorrected sentence must never be accepted as an answer.
          for (const a of q.accepted) expect(normalize(a), q.id).not.toBe(normalize(q.text));
          break;
        }
        case 'order': {
          const itemIds = q.items.map((i) => i.id).sort();
          for (const order of q.answer) expect([...order].sort(), q.id).toEqual(itemIds);
          break;
        }
        case 'match': {
          const rightIds = q.right.map((r) => r.id);
          for (const l of q.left) expect(rightIds, `${q.id}:${l.id}`).toContain(q.answer[l.id]);
          expect(new Set(Object.values(q.answer)).size, q.id).toBe(q.left.length);
          break;
        }
      }
    }
  });

  it('covers every grammar topic with enough practice, including sentence correction', () => {
    expect(GRAMMAR_TOPICS.length).toBeGreaterThanOrEqual(8);
    for (const t of GRAMMAR_TOPICS) {
      const qs = grammarQuestionsForTopic(t.id);
      expect(qs.length, t.id).toBeGreaterThanOrEqual(6);
      expect(qs.some((q) => q.type === 'correction'), `${t.id} correction`).toBe(true);
      expect(qs.every((q) => q.difficulty !== undefined), `${t.id} difficulty`).toBe(true);
    }
  });
});

describe('vocabulary', () => {
  it('has at least 50 complete, unique entries across all three days', () => {
    expect(VOCABULARY.length).toBeGreaterThanOrEqual(50);
    const ids = VOCABULARY.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const day of [1, 2, 3]) expect(VOCABULARY.some((v) => v.day === day)).toBe(true);
    for (const v of VOCABULARY) {
      expect(v.word && v.meaningMs && v.example, v.id).toBeTruthy();
      expect(v.example.split(' ').length, `${v.id} example`).toBeGreaterThan(3);
    }
  });

  it('covers all required topics', () => {
    const topics = new Set(VOCABULARY.map((v) => v.topic));
    for (const t of ['education', 'health', 'environment', 'technology', 'hobbies', 'experiences', 'school', 'opinions']) {
      expect(topics.has(t as never), t).toBe(true);
    }
  });

  it('contains the headword in every example so cloze questions work', () => {
    for (const v of VOCABULARY) expect(clozeSentence(v), v.id).not.toBeNull();
  });

  it('builds unambiguous generated questions', () => {
    for (const v of VOCABULARY) {
      for (const type of ['meaning', 'word', 'cloze']) {
        const q = resolveQuestion(`v:${type}:${v.id}`);
        expect(q, `${type}:${v.id}`).toBeDefined();
        if (!q || q.type !== 'mcq') throw new Error('expected mcq');
        expect(q.options).toHaveLength(4);
        expect(q.answer).toEqual([v.id]);
        const texts = q.options.map((o) => o.text);
        expect(new Set(texts).size, `${type}:${v.id} duplicate options`).toBe(4);
        // Near-synonyms never appear together.
        if (v.group) {
          const others = q.options.filter((o) => o.id !== v.id).map((o) => VOCABULARY.find((x) => x.id === o.id)!);
          expect(others.every((o) => o.group !== v.group), `${type}:${v.id} synonym distractor`).toBe(true);
        }
      }
    }
  });
});

describe('writing prompts', () => {
  it('has at least three emails and three essays with varied difficulty', () => {
    const emails = WRITING_PROMPTS.filter((p) => p.type === 'email');
    const essays = WRITING_PROMPTS.filter((p) => p.type === 'essay');
    expect(emails.length).toBeGreaterThanOrEqual(3);
    expect(essays.length).toBeGreaterThanOrEqual(3);
    expect(new Set(emails.map((p) => p.difficulty)).size).toBeGreaterThan(1);
    expect(new Set(essays.map((p) => p.difficulty)).size).toBeGreaterThan(1);
  });

  it('uses task-specific word guidance rather than one universal limit', () => {
    const guides = new Set(WRITING_PROMPTS.map((p) => JSON.stringify(p.wordGuide)));
    expect(guides.size).toBeGreaterThan(2);
  });

  it('has model answers that satisfy their own task requirements', () => {
    for (const p of WRITING_PROMPTS) {
      const words = countWords(p.modelAnswer);
      if (p.wordGuide) {
        expect(words, `${p.id} words`).toBeGreaterThanOrEqual(p.wordGuide.min);
        expect(words, `${p.id} words`).toBeLessThanOrEqual(p.wordGuide.max);
      }
      const lower = p.modelAnswer.toLowerCase();
      for (const point of p.requiredPoints) {
        expect(point.keywords.some((k) => lower.includes(k)), `${p.id} → ${point.id}`).toBe(true);
      }
      expect(p.modelNotes.length, p.id).toBeGreaterThan(0);
      expect(p.planFields.length, p.id).toBeGreaterThan(0);
    }
  });
});

describe('rubric', () => {
  it('documents every dimension with criteria, reasons and a next step', () => {
    expect(LEARNING_RUBRIC.isOfficial).toBe(false);
    expect(LEARNING_RUBRIC.dimensions).toHaveLength(6);
    for (const d of LEARNING_RUBRIC.dimensions) {
      expect(d.whatAssessed && d.nextStep, d.id).toBeTruthy();
      expect(d.stronger.length && d.loseMarks.length, d.id).toBeTruthy();
      // Bands cover every score from 0 to max exactly once.
      const covered: number[] = [];
      for (const b of d.bands) for (let s = b.range[0]; s <= b.range[1]; s++) covered.push(s);
      expect(covered.sort()).toEqual([0, 1, 2, 3, 4, 5]);
    }
  });
});
