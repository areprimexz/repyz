import { describe, expect, it } from 'vitest';
import type { AppState, QuizSession, WritingSubmission } from '../types/progress';
import type { DayNumber } from '../types/content';
import { reducer, type Action } from './reducer';
import { createInitialState } from './initialState';
import { getLesson, lessonActivities, lessonsForDay } from '../content';
import { buildExam, DEFAULT_EXAM_CONFIG } from '../lib/exam';
import {
  canCompleteLesson,
  continueLesson,
  courseProgress,
  dayStatus,
  examUnlocked,
  isDayComplete,
  isLessonLocked,
  overallAccuracy,
  recommendLessons,
} from '../lib/progress';

const AT = '2026-01-01T08:00:00.000Z';

function run(state: AppState, ...actions: Action[]): AppState {
  return actions.reduce(reducer, state);
}

function session(slot: string, questionIds: string[], extra: Partial<QuizSession> = {}): QuizSession {
  return { slot, source: 'lesson', title: 'Test', questionIds, feedback: 'end', seed: 1, responses: {}, checked: [], startedAt: AT, ...extra };
}

function submission(promptId: string, writingType: 'email' | 'essay', id = `sub-${promptId}`): WritingSubmission {
  return {
    id,
    promptId,
    writingType,
    context: 'studio',
    text: 'Hi there,\n\nThis is my answer.\n\nBest wishes,\nA',
    plan: {},
    checklist: [],
    wordCount: 0,
    submittedAt: AT,
    version: 1,
    pointsTicked: [],
  };
}

/** Marks every activity of a lesson as done by writing state directly. */
function satisfyLesson(state: AppState, lessonId: string): AppState {
  const lesson = getLesson(lessonId)!;
  let next: AppState = { ...state, lessons: { ...state.lessons, [lessonId]: { ...state.lessons[lessonId], readAck: true } } };
  for (const a of lessonActivities(lesson)) {
    if (a.kind === 'quiz') {
      next = { ...next, attempts: [...next.attempts, { id: `att-${a.id}`, slot: a.id, source: 'lesson', title: a.title, activityId: a.id, startedAt: AT, submittedAt: AT, results: [], earned: 0, total: 0 }] };
    } else if (a.kind === 'short-writing') {
      next = {
        ...next,
        shortResponses: { ...next.shortResponses, [a.id]: Object.fromEntries(a.items.map((i) => [i.id, { text: 'x', updatedAt: AT, submittedAt: AT }])) },
      };
    } else if (a.kind === 'writing-task') {
      next = { ...next, submissions: [...next.submissions, submission(a.promptIds[0], a.writingType, `sub-${a.id}`)] };
    } else if (a.kind === 'rubric-review') {
      next = {
        ...next,
        submissions: next.submissions.map((s) =>
          s.writingType === a.writingType ? { ...s, rubricScores: { task: 3, organisation: 3, development: 3, grammar: 3, vocabulary: 3, mechanics: 3 }, rubricAt: AT } : s,
        ),
      };
    }
  }
  return next;
}

function completeDay(state: AppState, day: DayNumber): AppState {
  let next = state;
  for (const l of lessonsForDay(day)) {
    next = satisfyLesson(next, l.id);
    if (day === 3 && (l.id === 'd3-l5' || l.id === 'd3-l6') && !next.exams.some((e) => e.reviewedAt)) {
      const exam = { ...buildExam(DEFAULT_EXAM_CONFIG, AT, 5), status: 'submitted' as const, reviewedAt: AT };
      next = { ...next, exams: [...next.exams, exam] };
    }
    next = reducer(next, { type: 'completeLesson', lessonId: l.id, at: AT });
  }
  return next;
}

describe('quiz attempts', () => {
  it('records an end-mode attempt exactly once, even if submitted twice', () => {
    let state = run(
      createInitialState(AT),
      { type: 'startQuiz', session: session('s1', ['g-sva-1', 'g-sva-2'], { activityId: 'act' }) },
      { type: 'answerQuestion', slot: 's1', questionId: 'g-sva-1', response: { type: 'choice', value: 'a' } },
    );
    state = run(state, { type: 'submitQuiz', slot: 's1', attemptId: 'att1', at: AT }, { type: 'submitQuiz', slot: 's1', attemptId: 'att2', at: AT });
    expect(state.attempts).toHaveLength(1);
    expect(state.attempts[0]).toMatchObject({ id: 'att1', earned: 1, total: 2 });
    expect(state.attempts[0].results.map((r) => r.status)).toEqual(['correct', 'unanswered']);
    expect(state.quizSessions.s1.attemptId).toBe('att1');
    // Answers can no longer change after submission.
    const after = reducer(state, { type: 'answerQuestion', slot: 's1', questionId: 'g-sva-2', response: { type: 'text', value: 'x' } });
    expect(after).toBe(state);
  });

  it('records wrong answers in the Mistake Notebook and resolves them when corrected', () => {
    let state = run(
      createInitialState(AT),
      { type: 'startQuiz', session: session('s1', ['g-sva-1']) },
      { type: 'answerQuestion', slot: 's1', questionId: 'g-sva-1', response: { type: 'choice', value: 'b' } },
      { type: 'submitQuiz', slot: 's1', attemptId: 'a1', at: AT },
    );
    expect(state.mistakes['g-sva-1']).toMatchObject({ timesWrong: 1, resolved: false, tag: 'sva' });
    state = run(
      state,
      { type: 'startQuiz', force: true, session: session('s1', ['g-sva-1'], { seed: 2 }) },
      { type: 'answerQuestion', slot: 's1', questionId: 'g-sva-1', response: { type: 'choice', value: 'a' } },
      { type: 'submitQuiz', slot: 's1', attemptId: 'a2', at: AT },
    );
    expect(state.mistakes['g-sva-1'].resolved).toBe(true);
    expect(state.attempts).toHaveLength(2);
  });

  it('does not replace an unfinished session unless forced', () => {
    const state = run(createInitialState(AT), { type: 'startQuiz', session: session('s1', ['g-sva-1']) });
    expect(reducer(state, { type: 'startQuiz', session: session('s1', ['g-sva-2']) })).toBe(state);
    expect(reducer(state, { type: 'startQuiz', force: true, session: session('s1', ['g-sva-2']) }).quizSessions.s1.questionIds).toEqual(['g-sva-2']);
  });

  it('records an instant-mode attempt once every question is checked, ignoring unanswered checks', () => {
    let state = run(
      createInitialState(AT),
      { type: 'startQuiz', session: session('s2', ['g-art-1', 'g-art-2'], { feedback: 'instant' }) },
      { type: 'checkQuestion', slot: 's2', questionId: 'g-art-1', at: AT, attemptId: 'x' },
    );
    expect(state.quizSessions.s2.checked).toEqual([]);
    state = run(
      state,
      { type: 'answerQuestion', slot: 's2', questionId: 'g-art-1', response: { type: 'choice', value: 'a' } },
      { type: 'checkQuestion', slot: 's2', questionId: 'g-art-1', at: AT, attemptId: 'x' },
    );
    expect(state.attempts).toHaveLength(0);
    state = run(
      state,
      { type: 'answerQuestion', slot: 's2', questionId: 'g-art-2', response: { type: 'text', value: 'He wants to be a engineer.' } },
      { type: 'checkQuestion', slot: 's2', questionId: 'g-art-2', at: AT, attemptId: 'final' },
    );
    expect(state.attempts).toHaveLength(1);
    expect(state.attempts[0]).toMatchObject({ id: 'final', earned: 1, total: 2 });
    expect(state.mistakes['g-art-2'].timesWrong).toBe(1);
  });

  it('updates vocabulary mastery from generated vocabulary questions', () => {
    const state = run(
      createInitialState(AT),
      { type: 'startQuiz', session: session('v', ['v:meaning:hobby', 'v:word:advice'], { source: 'vocab' }) },
      { type: 'answerQuestion', slot: 'v', questionId: 'v:meaning:hobby', response: { type: 'choice', value: 'hobby' } },
      { type: 'answerQuestion', slot: 'v', questionId: 'v:word:advice', response: { type: 'choice', value: 'hobby' } },
      { type: 'submitQuiz', slot: 'v', attemptId: 'va', at: AT },
    );
    expect(state.vocab.hobby).toMatchObject({ correct: 1, box: 1 });
    expect(state.vocab.advice).toMatchObject({ incorrect: 1, box: 0, lastResult: 'incorrect' });
  });
});

describe('lesson completion and progress', () => {
  it('starts with a genuine empty state', () => {
    const state = createInitialState(AT);
    expect(courseProgress(state)).toMatchObject({ completed: 0, percent: 0 });
    expect(overallAccuracy(state).percent).toBeNull();
    expect(recommendLessons(state)).toEqual([]);
    expect(continueLesson(state)?.id).toBe('d1-l1');
    expect(dayStatus(state, 1)).toBe('not-started');
    expect(dayStatus(state, 2)).toBe('locked');
  });

  it('refuses to complete a lesson before its requirements are met', () => {
    const state = createInitialState(AT);
    expect(canCompleteLesson(state, 'd1-l1')).toBe(false);
    expect(reducer(state, { type: 'completeLesson', lessonId: 'd1-l1', at: AT })).toBe(state);
    const ready = satisfyLesson(state, 'd1-l1');
    const done = reducer(ready, { type: 'completeLesson', lessonId: 'd1-l1', at: AT });
    expect(done.lessons['d1-l1'].completedAt).toBe(AT);
    expect(courseProgress(done).completed).toBe(1);
    expect(done.activity[0].kind).toBe('lesson-complete');
  });

  it('needs the read acknowledgement as well as activities', () => {
    const ready = satisfyLesson(createInitialState(AT), 'd1-l2');
    const unread = { ...ready, lessons: { ...ready.lessons, 'd1-l2': { readAck: undefined } } };
    expect(canCompleteLesson(unread, 'd1-l2')).toBe(false);
  });

  it('continues with the last opened lesson, then the next incomplete one', () => {
    let state = run(createInitialState(AT), { type: 'openLesson', lessonId: 'd1-l3', at: AT });
    expect(continueLesson(state)?.id).toBe('d1-l3');
    state = reducer(satisfyLesson(state, 'd1-l3'), { type: 'completeLesson', lessonId: 'd1-l3', at: AT });
    expect(continueLesson(state)?.id).toBe('d1-l1');
  });

  it('unlocks Day 2 only after Day 1 is complete, and the exam after Days 1 and 2', () => {
    let state = completeDay(createInitialState(AT), 1);
    expect(isDayComplete(state, 1)).toBe(true);
    expect(state.activity.some((e) => e.kind === 'day-complete')).toBe(true);
    expect(isLessonLocked(state, getLesson('d2-l1')!)).toBe(false);
    expect(isLessonLocked(state, getLesson('d3-l1')!)).toBe(true);
    expect(examUnlocked(state)).toBe(false);
    state = completeDay(state, 2);
    expect(examUnlocked(state)).toBe(true);
    expect(continueLesson(state)?.id).toBe('d3-l1');
  });

  it('requires a submitted email for Day 1 even if lessons are marked complete', () => {
    const state = completeDay(createInitialState(AT), 1);
    const withoutEmail = { ...state, submissions: [] };
    expect(isDayComplete(withoutEmail, 1)).toBe(false);
  });

  it('requires a reviewed mock exam to finish Day 3', () => {
    let state = completeDay(completeDay(createInitialState(AT), 1), 2);
    state = completeDay(state, 3);
    expect(isDayComplete(state, 3)).toBe(true);
    const unreviewed = { ...state, exams: state.exams.map((e) => ({ ...e, reviewedAt: undefined })) };
    expect(isDayComplete(unreviewed, 3)).toBe(false);
  });
});

describe('writing', () => {
  it('saves, clears and submits drafts without losing text', () => {
    let state = run(createInitialState(AT), { type: 'saveDraft', promptId: 'email-hobby', text: 'Hi Danial,', at: AT });
    expect(state.drafts['email-hobby'].text).toBe('Hi Danial,');
    state = reducer(state, { type: 'submitWriting', submission: submission('email-hobby', 'email', 's1') });
    expect(state.submissions).toHaveLength(1);
    expect(state.submissions[0].wordCount).toBe(9);
    expect(state.drafts['email-hobby'].lastSubmittedId).toBe('s1');
    expect(state.drafts['email-hobby'].text).toBe(state.submissions[0].text);
    // Duplicate ids are ignored; revisions get a new version number.
    expect(reducer(state, { type: 'submitWriting', submission: submission('email-hobby', 'email', 's1') })).toBe(state);
    state = reducer(state, { type: 'submitWriting', submission: submission('email-hobby', 'email', 's2') });
    expect(state.submissions[1].version).toBe(2);
    state = reducer(state, { type: 'clearDraft', promptId: 'email-hobby', at: AT });
    expect(state.drafts['email-hobby'].text).toBe('');
    expect(state.submissions).toHaveLength(2);
  });

  it('rejects empty submissions', () => {
    const state = createInitialState(AT);
    expect(reducer(state, { type: 'submitWriting', submission: { ...submission('email-hobby', 'email'), text: '   ' } })).toBe(state);
  });

  it('stores rubric self-assessment on the submission', () => {
    let state = reducer(createInitialState(AT), { type: 'submitWriting', submission: submission('essay-reading', 'essay', 's1') });
    state = reducer(state, { type: 'saveRubric', submissionId: 's1', scores: { task: 4 }, reflection: 'More examples', at: AT });
    expect(state.submissions[0]).toMatchObject({ rubricScores: { task: 4 }, reflection: 'More examples' });
  });
});

describe('mock exam', () => {
  it('builds a configurable exam with grammar, vocabulary and a writing task', () => {
    const exam = buildExam({ ...DEFAULT_EXAM_CONFIG, writingType: 'essay', difficulty: 3, durationMin: 20 }, AT, 11);
    expect(exam.grammarIds).toHaveLength(8);
    expect(exam.vocabIds).toHaveLength(6);
    expect(new Set(exam.grammarIds).size).toBe(8);
    expect(exam.promptId.startsWith('essay')).toBe(true);
    expect(new Date(exam.endsAt).getTime() - new Date(exam.startedAt).getTime()).toBe(20 * 60_000);
  });

  it('submits once, grades objective answers and stores the writing separately', () => {
    const exam = buildExam(DEFAULT_EXAM_CONFIG, AT, 3);
    let state = run(
      createInitialState(AT),
      { type: 'startExam', exam },
      { type: 'answerExam', examId: exam.id, questionId: exam.grammarIds[0], response: { type: 'choice', value: 'zzz' } },
      { type: 'saveExamWriting', examId: exam.id, text: 'Dear Sir,\n\nI am writing.\n\nYours sincerely,\nA', at: AT },
    );
    expect(reducer(state, { type: 'startExam', exam: buildExam(DEFAULT_EXAM_CONFIG, AT, 4) })).toBe(state);
    state = reducer(state, { type: 'submitExam', examId: exam.id, at: AT, auto: false, submissionId: 'ws1' });
    const submitted = state.exams[0];
    expect(submitted.status).toBe('submitted');
    expect(submitted.objectiveTotal).toBe(14);
    expect(submitted.submissionId).toBe('ws1');
    expect(state.submissions[0]).toMatchObject({ id: 'ws1', context: 'exam' });
    // A second submit (e.g. timer firing after a manual submit) changes nothing.
    expect(reducer(state, { type: 'submitExam', examId: exam.id, at: AT, auto: true, submissionId: 'ws2' })).toBe(state);
    // Exam writing does not count towards the Day 1/Day 2 studio requirement.
    expect(state.submissions.filter((s) => s.context === 'studio')).toHaveLength(0);
    state = reducer(state, { type: 'markExamReviewed', examId: exam.id, at: AT });
    expect(state.exams[0].reviewedAt).toBe(AT);
  });

  it('keeps writing when an exam is abandoned', () => {
    const exam = buildExam(DEFAULT_EXAM_CONFIG, AT, 3);
    const state = run(
      createInitialState(AT),
      { type: 'startExam', exam },
      { type: 'saveExamWriting', examId: exam.id, text: 'Some writing', at: AT },
      { type: 'abandonExam', examId: exam.id, at: AT },
    );
    expect(state.exams[0]).toMatchObject({ status: 'abandoned', writing: 'Some writing' });
  });
});

describe('reset', () => {
  it('returns to a clean first-time state', () => {
    const busy = completeDay(createInitialState(AT), 1);
    const reset = reducer(busy, { type: 'reset', at: AT });
    expect(reset.onboarded).toBe(false);
    expect(courseProgress(reset).completed).toBe(0);
    expect(reset.submissions).toEqual([]);
    expect(reset.attempts).toEqual([]);
  });
});
