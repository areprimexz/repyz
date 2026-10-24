import { STATE_VERSION, type AppState } from '../types/progress';

export function createInitialState(now: string = new Date().toISOString()): AppState {
  return {
    version: STATE_VERSION,
    createdAt: now,
    onboarded: false,
    preferences: { displayName: '', textSize: 'normal' },
    lessons: {},
    currentLessonId: null,
    quizSessions: {},
    attempts: [],
    mistakes: {},
    vocab: {},
    shortResponses: {},
    drafts: {},
    submissions: [],
    exams: [],
    activity: [],
  };
}
