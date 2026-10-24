import type { DayNumber, Lesson, LessonActivity, SkillCategory } from '../types/content';
import type { AppState, MistakeEntry } from '../types/progress';
import { LESSONS, getLesson, lessonActivities, lessonsForDay } from '../content';
import { TAGS } from '../content/tags';
import { rubricTotal } from '../content/rubric';

// All statistics here are derived from recorded application data only.

export function isActivityDone(state: AppState, activity: LessonActivity): boolean {
  switch (activity.kind) {
    case 'quiz':
      return state.attempts.some((a) => a.activityId === activity.id);
    case 'short-writing': {
      const responses = state.shortResponses[activity.id] ?? {};
      return activity.items.every((item) => Boolean(responses[item.id]?.submittedAt));
    }
    case 'writing-task': {
      const count = state.submissions.filter((s) => s.context === 'studio' && activity.promptIds.includes(s.promptId)).length;
      return count >= activity.required;
    }
    case 'rubric-review':
      return state.submissions.some((s) => s.writingType === activity.writingType && rubricTotal(s.rubricScores) !== null);
    case 'mock':
    case 'final-review':
      return state.exams.some((e) => e.status === 'submitted' && Boolean(e.reviewedAt));
  }
}

export interface LessonSteps {
  read: boolean;
  guided: { done: number; total: number };
  practice: { done: number; total: number };
  ready: boolean;
}

export function lessonSteps(state: AppState, lesson: Lesson): LessonSteps {
  const activities = lessonActivities(lesson);
  const guided = activities.filter((a) => a.role === 'guided');
  const practice = activities.filter((a) => a.role === 'practice');
  const read = Boolean(state.lessons[lesson.id]?.readAck);
  const steps = {
    read,
    guided: { done: guided.filter((a) => isActivityDone(state, a)).length, total: guided.length },
    practice: { done: practice.filter((a) => isActivityDone(state, a)).length, total: practice.length },
  };
  return { ...steps, ready: read && steps.guided.done === steps.guided.total && steps.practice.done === steps.practice.total };
}

export function canCompleteLesson(state: AppState, lessonId: string): boolean {
  const lesson = getLesson(lessonId);
  if (!lesson || isLessonLocked(state, lesson)) return false;
  return lessonSteps(state, lesson).ready;
}

export function isLessonComplete(state: AppState, lessonId: string): boolean {
  return Boolean(state.lessons[lessonId]?.completedAt);
}

/** Extra day-level requirement on top of completing every lesson. */
export function dayRequirementMet(state: AppState, day: DayNumber): boolean {
  if (day === 1) return state.submissions.some((s) => s.context === 'studio' && s.writingType === 'email');
  if (day === 2) return state.submissions.some((s) => s.context === 'studio' && s.writingType === 'essay');
  return state.exams.some((e) => e.status === 'submitted' && Boolean(e.reviewedAt));
}

export function isDayComplete(state: AppState, day: DayNumber): boolean {
  return lessonsForDay(day).every((l) => isLessonComplete(state, l.id)) && dayRequirementMet(state, day);
}

export function isDayLocked(state: AppState, day: DayNumber): boolean {
  if (day === 1) return false;
  return !isDayComplete(state, (day - 1) as DayNumber);
}

export function isLessonLocked(state: AppState, lesson: Lesson): boolean {
  return isDayLocked(state, lesson.day);
}

export type DayStatus = 'locked' | 'not-started' | 'in-progress' | 'complete';

export function dayStatus(state: AppState, day: DayNumber): DayStatus {
  if (isDayComplete(state, day)) return 'complete';
  if (isDayLocked(state, day)) return 'locked';
  const started = lessonsForDay(day).some((l) => state.lessons[l.id]?.completedAt || state.lessons[l.id]?.lastOpenedAt);
  return started ? 'in-progress' : 'not-started';
}

export function dayProgress(state: AppState, day: DayNumber): { completed: number; total: number } {
  const lessons = lessonsForDay(day);
  return { completed: lessons.filter((l) => isLessonComplete(state, l.id)).length, total: lessons.length };
}

export function courseProgress(state: AppState): { completed: number; total: number; percent: number } {
  const completed = LESSONS.filter((l) => isLessonComplete(state, l.id)).length;
  return { completed, total: LESSONS.length, percent: Math.round((completed / LESSONS.length) * 100) };
}

export function isBootcampComplete(state: AppState): boolean {
  return ([1, 2, 3] as DayNumber[]).every((d) => isDayComplete(state, d));
}

/**
 * Where "Continue learning" should go: the last opened lesson if it is still
 * incomplete, otherwise the first incomplete lesson that is not locked.
 */
export function continueLesson(state: AppState): Lesson | null {
  const current = state.currentLessonId ? getLesson(state.currentLessonId) : undefined;
  if (current && !isLessonComplete(state, current.id) && !isLessonLocked(state, current)) return current;
  return LESSONS.find((l) => !isLessonComplete(state, l.id) && !isLessonLocked(state, l)) ?? null;
}

export function examUnlocked(state: AppState): boolean {
  return isDayComplete(state, 1) && isDayComplete(state, 2);
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

export interface Accuracy {
  earned: number;
  marks: number;
  answered: number;
  unanswered: number;
  percent: number | null;
}

function emptyAccuracy(): Accuracy {
  return { earned: 0, marks: 0, answered: 0, unanswered: 0, percent: null };
}

function finish(acc: Accuracy): Accuracy {
  return { ...acc, percent: acc.marks > 0 ? Math.round((acc.earned / acc.marks) * 100) : null };
}

/** Accuracy over answered questions in every recorded attempt. Unanswered items are counted separately. */
export function overallAccuracy(state: AppState): Accuracy {
  const acc = emptyAccuracy();
  for (const attempt of state.attempts) {
    for (const r of attempt.results) {
      if (r.status === 'unanswered') {
        acc.unanswered++;
        continue;
      }
      acc.answered++;
      acc.earned += r.earned;
      acc.marks += r.marks;
    }
  }
  return finish(acc);
}

export function accuracyBySkill(state: AppState): Record<SkillCategory, Accuracy> {
  const out: Record<SkillCategory, Accuracy> = {
    email: emptyAccuracy(),
    essay: emptyAccuracy(),
    grammar: emptyAccuracy(),
    vocabulary: emptyAccuracy(),
  };
  for (const attempt of state.attempts) {
    for (const r of attempt.results) {
      const acc = out[r.skill];
      if (r.status === 'unanswered') {
        acc.unanswered++;
        continue;
      }
      acc.answered++;
      acc.earned += r.earned;
      acc.marks += r.marks;
    }
  }
  for (const key of Object.keys(out) as SkillCategory[]) out[key] = finish(out[key]);
  return out;
}

/** Minimum answered marks before a skill can be called "strongest". */
export const MIN_MARKS_FOR_STRENGTH = 5;

export function strongestSkill(state: AppState): SkillCategory | null {
  const bySkill = accuracyBySkill(state);
  let best: SkillCategory | null = null;
  for (const key of Object.keys(bySkill) as SkillCategory[]) {
    const acc = bySkill[key];
    if (acc.marks < MIN_MARKS_FOR_STRENGTH || acc.percent === null) continue;
    if (!best || acc.percent > (bySkill[best].percent ?? -1)) best = key;
  }
  return best;
}

export interface TagCount {
  tag: string;
  timesWrong: number;
  unresolved: number;
  skill: SkillCategory;
}

export function missedTags(state: AppState, skill?: SkillCategory): TagCount[] {
  const map = new Map<string, TagCount>();
  for (const m of Object.values(state.mistakes)) {
    if (skill && m.skill !== skill) continue;
    const entry = map.get(m.tag) ?? { tag: m.tag, timesWrong: 0, unresolved: 0, skill: m.skill };
    entry.timesWrong += m.timesWrong;
    if (!m.resolved) entry.unresolved++;
    map.set(m.tag, entry);
  }
  return [...map.values()].sort((a, b) => b.timesWrong - a.timesWrong || b.unresolved - a.unresolved);
}

export function unresolvedMistakes(state: AppState): MistakeEntry[] {
  return Object.values(state.mistakes)
    .filter((m) => !m.resolved)
    .sort((a, b) => b.lastWrongAt.localeCompare(a.lastWrongAt));
}

export interface Recommendation {
  lesson: Lesson;
  reason: string;
}

/** Lessons to revisit, based on frequently missed topics and weak skills. */
export function recommendLessons(state: AppState, limit = 4): Recommendation[] {
  const out: Recommendation[] = [];
  const seen = new Set<string>();
  const push = (lessonId: string, reason: string) => {
    const lesson = getLesson(lessonId);
    if (!lesson || seen.has(lessonId) || isLessonLocked(state, lesson)) return;
    seen.add(lessonId);
    out.push({ lesson, reason });
  };

  for (const t of missedTags(state)) {
    if (t.unresolved === 0) continue;
    const info = TAGS[t.tag];
    if (!info) continue;
    for (const id of info.lessonIds) push(id, `${t.unresolved} kesilapan belum dibetulkan dalam "${info.label}"`);
    if (out.length >= limit) return out.slice(0, limit);
  }

  const bySkill = accuracyBySkill(state);
  const skillLesson: Record<SkillCategory, string> = { email: 'd1-l2', essay: 'd2-l3', grammar: 'd3-l1', vocabulary: 'd3-l2' };
  for (const key of Object.keys(bySkill) as SkillCategory[]) {
    const acc = bySkill[key];
    if (acc.marks >= MIN_MARKS_FOR_STRENGTH && acc.percent !== null && acc.percent < 70) {
      push(skillLesson[key], `Ketepatan ${acc.percent}% dalam kemahiran ini`);
    }
  }
  return out.slice(0, limit);
}

export function writingStats(state: AppState): { email: number; essay: number; exam: number; total: number } {
  const studio = state.submissions.filter((s) => s.context === 'studio');
  return {
    email: studio.filter((s) => s.writingType === 'email').length,
    essay: studio.filter((s) => s.writingType === 'essay').length,
    exam: state.submissions.filter((s) => s.context === 'exam').length,
    total: state.submissions.length,
  };
}

/** Accuracy for attempts of a given source (e.g. vocabulary quizzes). */
export function accuracyForSource(state: AppState, source: AppState['attempts'][number]['source']): Accuracy {
  const acc = emptyAccuracy();
  for (const attempt of state.attempts.filter((a) => a.source === source)) {
    for (const r of attempt.results) {
      if (r.status === 'unanswered') {
        acc.unanswered++;
        continue;
      }
      acc.answered++;
      acc.earned += r.earned;
      acc.marks += r.marks;
    }
  }
  return finish(acc);
}
