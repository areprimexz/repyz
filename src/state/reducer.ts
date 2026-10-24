import type { DayNumber, QuestionResponse } from '../types/content';
import type {
  ActivityEvent,
  AppState,
  MistakeEntry,
  MockExam,
  Preferences,
  QuestionResult,
  QuizAttempt,
  QuizSession,
  WritingSubmission,
} from '../types/progress';
import { getLesson, getPrompt, resolveQuestion } from '../content';
import { buildResult, summarize } from '../lib/quiz';
import { applyVocabAnswer } from '../lib/vocab';
import { canCompleteLesson, isDayComplete } from '../lib/progress';
import { countWords } from '../lib/writing';
import { parseVocabQuestionId } from '../content';
import { uid } from '../lib/random';
import { createInitialState } from './initialState';

/** Limits keep localStorage well below typical quotas. */
export const MAX_ATTEMPTS = 300;
export const MAX_ACTIVITY = 40;

export type Action =
  | { type: 'onboard'; displayName?: string }
  | { type: 'setPreferences'; prefs: Partial<Preferences> }
  | { type: 'openLesson'; lessonId: string; at: string }
  | { type: 'setReadAck'; lessonId: string; value: boolean }
  | { type: 'completeLesson'; lessonId: string; at: string }
  | { type: 'startQuiz'; session: QuizSession; force?: boolean }
  | { type: 'answerQuestion'; slot: string; questionId: string; response: QuestionResponse }
  | { type: 'checkQuestion'; slot: string; questionId: string; at: string; attemptId: string }
  | { type: 'submitQuiz'; slot: string; attemptId: string; at: string }
  | { type: 'discardQuiz'; slot: string }
  | { type: 'vocabSelfMark'; wordId: string; mark: 'known' | 'practice' | null }
  | { type: 'saveShortResponse'; activityId: string; itemId: string; text: string; at: string }
  | { type: 'submitShortResponse'; activityId: string; itemId: string; at: string }
  | { type: 'tickShortChecklist'; activityId: string; itemId: string; ticks: number[] }
  | { type: 'saveDraft'; promptId: string; text?: string; plan?: Record<string, string>; checklist?: string[]; at: string }
  | { type: 'clearDraft'; promptId: string; at: string }
  | { type: 'submitWriting'; submission: WritingSubmission }
  | { type: 'saveRubric'; submissionId: string; scores: Record<string, number>; reflection?: string; at: string }
  | { type: 'startExam'; exam: MockExam }
  | { type: 'answerExam'; examId: string; questionId: string; response: QuestionResponse }
  | { type: 'saveExamWriting'; examId: string; text: string; at: string }
  | { type: 'submitExam'; examId: string; at: string; auto: boolean; submissionId: string }
  | { type: 'abandonExam'; examId: string; at: string }
  | { type: 'markExamReviewed'; examId: string; at: string }
  | { type: 'reset'; at: string };

function addEvent(state: AppState, event: Omit<ActivityEvent, 'id'>): AppState {
  const next: ActivityEvent = { id: uid('evt'), ...event };
  return { ...state, activity: [next, ...state.activity].slice(0, MAX_ACTIVITY) };
}

/** Updates mistakes and vocabulary state from a set of results. */
function applyResults(state: AppState, results: QuestionResult[], at: string): AppState {
  const mistakes = { ...state.mistakes };
  const vocab = { ...state.vocab };
  for (const r of results) {
    if (r.status === 'incorrect' || r.status === 'partial') {
      const prev = mistakes[r.questionId];
      const entry: MistakeEntry = {
        questionId: r.questionId,
        skill: r.skill,
        tag: r.tag,
        timesWrong: (prev?.timesWrong ?? 0) + 1,
        firstWrongAt: prev?.firstWrongAt ?? at,
        lastWrongAt: at,
        lastResponse: r.response,
        resolved: false,
      };
      mistakes[r.questionId] = entry;
    } else if (r.status === 'correct' && mistakes[r.questionId] && !mistakes[r.questionId].resolved) {
      mistakes[r.questionId] = { ...mistakes[r.questionId], resolved: true, resolvedAt: at };
    }
    const vocabId = parseVocabQuestionId(r.questionId)?.wordId;
    if (vocabId && r.status !== 'unanswered') {
      vocab[vocabId] = applyVocabAnswer(vocab[vocabId], r.status === 'correct', at);
    }
  }
  return { ...state, mistakes, vocab };
}

function gradeSession(session: QuizSession, ids: string[]): QuestionResult[] {
  const results: QuestionResult[] = [];
  for (const id of ids) {
    const q = resolveQuestion(id);
    if (q) results.push(buildResult(q, session.responses[id]));
  }
  return results;
}

function recordAttempt(state: AppState, session: QuizSession, attemptId: string, at: string): AppState {
  if (session.attemptId || state.attempts.some((a) => a.id === attemptId)) return state;
  const results = gradeSession(session, session.questionIds);
  const summary = summarize(results);
  const attempt: QuizAttempt = {
    id: attemptId,
    slot: session.slot,
    source: session.source,
    title: session.title,
    lessonId: session.lessonId,
    activityId: session.activityId,
    startedAt: session.startedAt,
    submittedAt: at,
    results,
    earned: summary.earned,
    total: summary.total,
  };
  // Instant mode already applied mistakes/vocab per question when it was checked.
  let next = session.feedback === 'instant' ? state : applyResults(state, results, at);
  next = {
    ...next,
    attempts: [...next.attempts, attempt].slice(-MAX_ATTEMPTS),
    quizSessions: { ...next.quizSessions, [session.slot]: { ...session, attemptId } },
  };
  const href = session.lessonId ? `/lesson/${session.lessonId}` : undefined;
  return addEvent(next, { at, kind: 'quiz', text: `${session.title}: ${summary.earned}/${summary.total}`, href });
}

function updateExam(state: AppState, examId: string, update: (exam: MockExam) => MockExam | null): AppState {
  let changed = false;
  const exams = state.exams.map((e) => {
    if (e.id !== examId) return e;
    const next = update(e);
    if (!next || next === e) return e;
    changed = true;
    return next;
  });
  return changed ? { ...state, exams } : state;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'onboard':
      return {
        ...state,
        onboarded: true,
        preferences: action.displayName !== undefined ? { ...state.preferences, displayName: action.displayName.trim().slice(0, 40) } : state.preferences,
      };

    case 'setPreferences':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.prefs,
          displayName: (action.prefs.displayName ?? state.preferences.displayName).slice(0, 40),
        },
      };

    case 'openLesson': {
      if (!getLesson(action.lessonId)) return state;
      const prev = state.lessons[action.lessonId] ?? {};
      return {
        ...state,
        currentLessonId: action.lessonId,
        lessons: { ...state.lessons, [action.lessonId]: { ...prev, lastOpenedAt: action.at } },
      };
    }

    case 'setReadAck': {
      const prev = state.lessons[action.lessonId] ?? {};
      if (prev.completedAt && !action.value) return state;
      return { ...state, lessons: { ...state.lessons, [action.lessonId]: { ...prev, readAck: action.value || undefined } } };
    }

    case 'completeLesson': {
      const lesson = getLesson(action.lessonId);
      if (!lesson || state.lessons[lesson.id]?.completedAt || !canCompleteLesson(state, lesson.id)) return state;
      const wasDayComplete = isDayComplete(state, lesson.day);
      let next: AppState = {
        ...state,
        lessons: { ...state.lessons, [lesson.id]: { ...state.lessons[lesson.id], completedAt: action.at } },
      };
      next = addEvent(next, { at: action.at, kind: 'lesson-complete', text: `Pelajaran ${lesson.number} selesai: ${lesson.title}`, href: `/lesson/${lesson.id}` });
      if (!wasDayComplete && isDayComplete(next, lesson.day as DayNumber)) {
        next = addEvent(next, { at: action.at, kind: 'day-complete', text: `Hari ${lesson.day} selesai`, href: '/curriculum' });
      }
      return next;
    }

    case 'startQuiz': {
      const existing = state.quizSessions[action.session.slot];
      // Never replace an unfinished session unless the student explicitly restarts it.
      if (existing && !existing.attemptId && !action.force) return state;
      return { ...state, quizSessions: { ...state.quizSessions, [action.session.slot]: action.session } };
    }

    case 'answerQuestion': {
      const session = state.quizSessions[action.slot];
      if (!session || session.attemptId || session.checked.includes(action.questionId)) return state;
      if (!session.questionIds.includes(action.questionId)) return state;
      return {
        ...state,
        quizSessions: {
          ...state.quizSessions,
          [action.slot]: { ...session, responses: { ...session.responses, [action.questionId]: action.response } },
        },
      };
    }

    case 'checkQuestion': {
      const session = state.quizSessions[action.slot];
      if (!session || session.attemptId || session.checked.includes(action.questionId)) return state;
      const question = resolveQuestion(action.questionId);
      if (!question || !session.questionIds.includes(action.questionId)) return state;
      const result = buildResult(question, session.responses[action.questionId]);
      if (result.status === 'unanswered') return state;
      let next = applyResults(state, [result], action.at);
      const updated: QuizSession = { ...session, checked: [...session.checked, action.questionId] };
      next = { ...next, quizSessions: { ...next.quizSessions, [action.slot]: updated } };
      if (updated.questionIds.every((id) => updated.checked.includes(id))) {
        next = recordAttempt(next, updated, action.attemptId, action.at);
      }
      return next;
    }

    case 'submitQuiz': {
      const session = state.quizSessions[action.slot];
      if (!session || session.attemptId) return state;
      return recordAttempt(state, session, action.attemptId, action.at);
    }

    case 'discardQuiz': {
      if (!state.quizSessions[action.slot]) return state;
      const quizSessions = { ...state.quizSessions };
      delete quizSessions[action.slot];
      return { ...state, quizSessions };
    }

    case 'vocabSelfMark': {
      const prev = state.vocab[action.wordId] ?? { box: 0, correct: 0, incorrect: 0 };
      return { ...state, vocab: { ...state.vocab, [action.wordId]: { ...prev, selfMark: action.mark ?? undefined } } };
    }

    case 'saveShortResponse': {
      const activity = state.shortResponses[action.activityId] ?? {};
      const prev = activity[action.itemId];
      if (prev?.submittedAt) return state;
      return {
        ...state,
        shortResponses: {
          ...state.shortResponses,
          [action.activityId]: { ...activity, [action.itemId]: { ...prev, text: action.text, updatedAt: action.at } },
        },
      };
    }

    case 'submitShortResponse': {
      const activity = state.shortResponses[action.activityId] ?? {};
      const prev = activity[action.itemId];
      if (!prev || prev.submittedAt || countWords(prev.text) === 0) return state;
      return {
        ...state,
        shortResponses: {
          ...state.shortResponses,
          [action.activityId]: { ...activity, [action.itemId]: { ...prev, submittedAt: action.at } },
        },
      };
    }

    case 'tickShortChecklist': {
      const activity = state.shortResponses[action.activityId] ?? {};
      const prev = activity[action.itemId];
      if (!prev) return state;
      return {
        ...state,
        shortResponses: {
          ...state.shortResponses,
          [action.activityId]: { ...activity, [action.itemId]: { ...prev, ticks: action.ticks } },
        },
      };
    }

    case 'saveDraft': {
      const prev = state.drafts[action.promptId] ?? { promptId: action.promptId, text: '', plan: {}, checklist: [], updatedAt: action.at };
      const next = {
        ...prev,
        text: action.text ?? prev.text,
        plan: action.plan ?? prev.plan,
        checklist: action.checklist ?? prev.checklist,
        updatedAt: action.at,
      };
      if (next.text === prev.text && next.plan === prev.plan && next.checklist === prev.checklist && state.drafts[action.promptId]) return state;
      return { ...state, drafts: { ...state.drafts, [action.promptId]: next } };
    }

    case 'clearDraft': {
      const prev = state.drafts[action.promptId];
      if (!prev) return state;
      return { ...state, drafts: { ...state.drafts, [action.promptId]: { ...prev, text: '', plan: {}, checklist: [], updatedAt: action.at } } };
    }

    case 'submitWriting': {
      const s = action.submission;
      if (state.submissions.some((x) => x.id === s.id) || countWords(s.text) === 0 || !getPrompt(s.promptId)) return state;
      const version = state.submissions.filter((x) => x.promptId === s.promptId && x.context === s.context).length + 1;
      const submission: WritingSubmission = { ...s, version, wordCount: countWords(s.text) };
      let next: AppState = { ...state, submissions: [...state.submissions, submission] };
      if (s.context === 'studio') {
        // The draft keeps the submitted text so the student can revise and resubmit it.
        next.drafts = {
          ...next.drafts,
          [s.promptId]: { promptId: s.promptId, text: s.text, plan: s.plan, checklist: s.checklist, updatedAt: s.submittedAt, lastSubmittedId: s.id },
        };
      }
      const prompt = getPrompt(s.promptId);
      next = addEvent(next, {
        at: s.submittedAt,
        kind: 'writing',
        text: `${s.writingType === 'email' ? 'Emel' : 'Esei'} dihantar (versi ${version}): ${prompt?.title ?? s.promptId}`,
        href: `/writing/${s.promptId}/review/${s.id}`,
      });
      return next;
    }

    case 'saveRubric': {
      const index = state.submissions.findIndex((s) => s.id === action.submissionId);
      if (index < 0) return state;
      const submissions = state.submissions.slice();
      const hadRubric = Boolean(submissions[index].rubricAt);
      submissions[index] = { ...submissions[index], rubricScores: action.scores, reflection: action.reflection, rubricAt: action.at };
      const next = { ...state, submissions };
      if (hadRubric) return next;
      return addEvent(next, { at: action.at, kind: 'rubric', text: 'Penilaian kendiri rubrik disimpan', href: `/writing/${submissions[index].promptId}/review/${submissions[index].id}` });
    }

    case 'startExam': {
      if (state.exams.some((e) => e.status === 'in-progress')) return state;
      return { ...state, exams: [...state.exams, action.exam] };
    }

    case 'answerExam':
      return updateExam(state, action.examId, (e) =>
        e.status !== 'in-progress' ? null : { ...e, responses: { ...e.responses, [action.questionId]: action.response } },
      );

    case 'saveExamWriting':
      return updateExam(state, action.examId, (e) =>
        e.status !== 'in-progress' || e.writing === action.text ? null : { ...e, writing: action.text, writingSavedAt: action.at },
      );

    case 'submitExam': {
      const exam = state.exams.find((e) => e.id === action.examId);
      if (!exam || exam.status !== 'in-progress') return state;
      const ids = [...exam.grammarIds, ...exam.vocabIds];
      const results = ids.map((id) => resolveQuestion(id)).filter((q) => q !== undefined).map((q) => buildResult(q, exam.responses[q.id]));
      const summary = summarize(results);
      const prompt = getPrompt(exam.promptId);
      const hasWriting = countWords(exam.writing) > 0 && prompt;
      let next = updateExam(state, exam.id, (e) => ({
        ...e,
        status: 'submitted',
        submittedAt: action.at,
        autoSubmitted: action.auto || undefined,
        results,
        objectiveEarned: summary.earned,
        objectiveTotal: summary.total,
        submissionId: hasWriting ? action.submissionId : undefined,
      }));
      next = applyResults(next, results, action.at);
      next = {
        ...next,
        attempts: [
          ...next.attempts,
          {
            id: `attempt-${exam.id}`,
            slot: `exam:${exam.id}`,
            source: 'exam' as const,
            title: 'Ujian percubaan (objektif)',
            startedAt: exam.startedAt,
            submittedAt: action.at,
            results,
            earned: summary.earned,
            total: summary.total,
          },
        ].slice(-MAX_ATTEMPTS),
      };
      if (hasWriting && prompt) {
        next = {
          ...next,
          submissions: [
            ...next.submissions,
            {
              id: action.submissionId,
              promptId: prompt.id,
              writingType: prompt.type,
              context: 'exam',
              text: exam.writing,
              plan: {},
              checklist: [],
              wordCount: countWords(exam.writing),
              submittedAt: action.at,
              version: next.submissions.filter((s) => s.promptId === prompt.id && s.context === 'exam').length + 1,
              pointsTicked: [],
            },
          ],
        };
      }
      return addEvent(next, {
        at: action.at,
        kind: 'exam',
        text: `Ujian percubaan dihantar${action.auto ? ' (masa tamat)' : ''}: objektif ${summary.earned}/${summary.total}`,
        href: `/exam/${exam.id}`,
      });
    }

    case 'abandonExam':
      return updateExam(state, action.examId, (e) => (e.status !== 'in-progress' ? null : { ...e, status: 'abandoned', submittedAt: action.at }));

    case 'markExamReviewed':
      return updateExam(state, action.examId, (e) => (e.status !== 'submitted' || e.reviewedAt ? null : { ...e, reviewedAt: action.at }));

    case 'reset':
      return { ...createInitialState(action.at), onboarded: false };
  }
}
