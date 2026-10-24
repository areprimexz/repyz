import type { Difficulty, QuestionResponse, SkillCategory, WritingType } from './content';

export const STATE_VERSION = 1;

export type QuizSource = 'lesson' | 'gym' | 'vocab' | 'mistakes' | 'exam';

export interface QuizSession {
  /** Slot key, e.g. "lesson:d1-l1:guided" or "gym". */
  slot: string;
  source: QuizSource;
  title: string;
  lessonId?: string;
  activityId?: string;
  feedback: 'instant' | 'end';
  questionIds: string[];
  /** Seed for option shuffling and generated distractors; stable across refreshes. */
  seed: number;
  responses: Record<string, QuestionResponse>;
  /** Question ids already checked in instant mode. */
  checked: string[];
  startedAt: string;
  /** Set once the attempt is recorded; prevents double submission. */
  attemptId?: string;
}

export type ResultStatus = 'correct' | 'partial' | 'incorrect' | 'unanswered';

export interface QuestionResult {
  questionId: string;
  status: ResultStatus;
  earned: number;
  marks: number;
  skill: SkillCategory;
  tag: string;
  response?: QuestionResponse;
}

export interface QuizAttempt {
  id: string;
  slot: string;
  source: QuizSource;
  title: string;
  lessonId?: string;
  activityId?: string;
  startedAt: string;
  submittedAt: string;
  results: QuestionResult[];
  earned: number;
  total: number;
}

export interface MistakeEntry {
  questionId: string;
  skill: SkillCategory;
  tag: string;
  timesWrong: number;
  firstWrongAt: string;
  lastWrongAt: string;
  lastResponse?: QuestionResponse;
  resolved: boolean;
  resolvedAt?: string;
}

export interface VocabState {
  /** Leitner box: 0 = new or recently missed. Mastered from MASTERED_BOX upwards. */
  box: number;
  correct: number;
  incorrect: number;
  /** Self-reported status from flashcards; does not count as mastery. */
  selfMark?: 'known' | 'practice';
  lastResult?: 'correct' | 'incorrect';
  lastAnsweredAt?: string;
  dueAt?: string;
}

export interface LessonProgress {
  readAck?: boolean;
  completedAt?: string;
  lastOpenedAt?: string;
}

export interface ShortResponse {
  text: string;
  updatedAt: string;
  submittedAt?: string;
  /** Checklist items the student ticked after seeing the model. */
  ticks?: number[];
}

export interface WritingDraft {
  promptId: string;
  text: string;
  plan: Record<string, string>;
  checklist: string[];
  updatedAt: string;
  lastSubmittedId?: string;
}

export interface WritingSubmission {
  id: string;
  promptId: string;
  writingType: WritingType;
  context: 'studio' | 'exam';
  text: string;
  plan: Record<string, string>;
  checklist: string[];
  wordCount: number;
  submittedAt: string;
  /** 1 for the first submission of a prompt, 2 for the first revision, ... */
  version: number;
  /** Points the student ticked as answered. */
  pointsTicked: string[];
  rubricScores?: Record<string, number>;
  rubricAt?: string;
  reflection?: string;
}

export interface MockExamConfig {
  writingType: WritingType | 'any';
  difficulty: Difficulty;
  durationMin: number;
  grammarCount: number;
  vocabCount: number;
}

export interface MockExam {
  id: string;
  config: MockExamConfig;
  status: 'in-progress' | 'submitted' | 'abandoned';
  createdAt: string;
  startedAt: string;
  endsAt: string;
  submittedAt?: string;
  autoSubmitted?: boolean;
  grammarIds: string[];
  vocabIds: string[];
  seed: number;
  promptId: string;
  responses: Record<string, QuestionResponse>;
  writing: string;
  writingSavedAt?: string;
  /** Objective results, computed once at submission. */
  results?: QuestionResult[];
  objectiveEarned?: number;
  objectiveTotal?: number;
  submissionId?: string;
  reviewedAt?: string;
}

export type ActivityKind =
  | 'lesson-complete'
  | 'quiz'
  | 'writing'
  | 'rubric'
  | 'exam'
  | 'day-complete'
  | 'vocab-mark';

export interface ActivityEvent {
  id: string;
  at: string;
  kind: ActivityKind;
  text: string;
  /** In-app link to revisit. */
  href?: string;
}

export interface Preferences {
  displayName: string;
  textSize: 'normal' | 'large';
}

export interface AppState {
  version: number;
  createdAt: string;
  onboarded: boolean;
  preferences: Preferences;
  lessons: Record<string, LessonProgress>;
  currentLessonId: string | null;
  quizSessions: Record<string, QuizSession>;
  attempts: QuizAttempt[];
  mistakes: Record<string, MistakeEntry>;
  vocab: Record<string, VocabState>;
  shortResponses: Record<string, Record<string, ShortResponse>>;
  drafts: Record<string, WritingDraft>;
  submissions: WritingSubmission[];
  exams: MockExam[];
  activity: ActivityEvent[];
}
