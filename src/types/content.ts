// Educational content types. Content lives in src/content and is kept separate
// from UI components so lessons and questions can be edited without touching UI.

export type DayNumber = 1 | 2 | 3;

/** Skill categories used for progress statistics. */
export type SkillCategory = 'email' | 'essay' | 'grammar' | 'vocabulary';

/** Difficulty used by writing prompts, grammar questions and mock exams. */
export type Difficulty = 1 | 2 | 3;

// ---------------------------------------------------------------------------
// Lesson blocks
// ---------------------------------------------------------------------------

export type LessonBlock =
  | { kind: 'text'; heading?: string; paragraphs: string[] }
  | { kind: 'list'; heading?: string; ordered?: boolean; items: string[] }
  | {
      kind: 'example';
      heading: string;
      caption?: string;
      /** Each line of an English example, optionally labelled and annotated in BM. */
      lines: { en: string; label?: string; note?: string }[];
    }
  | {
      kind: 'compare';
      heading?: string;
      weakLabel?: string;
      strongLabel?: string;
      items: { weak: string; strong: string; why: string }[];
    }
  | {
      kind: 'keyterms';
      heading: string;
      items: { term: string; meaning: string; example?: string; note?: string }[];
    }
  | { kind: 'callout'; tone: 'tip' | 'warning' | 'info'; title?: string; body: string }
  | { kind: 'table'; heading?: string; columns: string[]; rows: string[][] };

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export type QuestionType =
  | 'mcq'
  | 'truefalse'
  | 'multi'
  | 'fill'
  | 'correction'
  | 'order'
  | 'match'
  | 'phrase'
  | 'peel';

export interface ChoiceOption {
  id: string;
  text: string;
}

interface QuestionBase {
  id: string;
  skill: SkillCategory;
  /** Topic tag used for the Mistake Notebook and revision recommendations. */
  tag: string;
  difficulty?: Difficulty;
  /** Instruction or question text. Supports **bold**. */
  prompt: string;
  /** Optional context shown above the prompt (a situation, a passage, an email question). */
  context?: string;
  /** Explanation in Bahasa Melayu, shown after the answer is checked. */
  explanation: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'mcq' | 'phrase' | 'peel' | 'truefalse';
  options: ChoiceOption[];
  /** Ids of acceptable options (normally one). */
  answer: string[];
  /** Set false when option order carries meaning. Defaults to true (false for truefalse/peel). */
  shuffle?: boolean;
}

export interface MultiQuestion extends QuestionBase {
  type: 'multi';
  options: ChoiceOption[];
  /** All option ids that must be selected — no more, no less. */
  answer: string[];
  shuffle?: boolean;
}

export interface TextQuestion extends QuestionBase {
  type: 'fill' | 'correction';
  /** For 'correction': the sentence to correct. For 'fill': a sentence containing "___". */
  text: string;
  /** Accepted answers. For 'fill' just the missing word(s); for 'correction' the full sentence. */
  accepted: string[];
  /**
   * 'loose' (default) ignores letter case, extra spaces and the final full stop.
   * 'strict' keeps case and punctuation — used for capitalisation/punctuation questions.
   */
  compare?: 'loose' | 'strict';
  placeholder?: string;
}

export interface OrderQuestion extends QuestionBase {
  type: 'order';
  items: ChoiceOption[];
  /** One or more acceptable orders, each a list of item ids. */
  answer: string[][];
}

export interface MatchQuestion extends QuestionBase {
  type: 'match';
  left: ChoiceOption[];
  right: ChoiceOption[];
  /** leftId -> rightId */
  answer: Record<string, string>;
}

export type Question = ChoiceQuestion | MultiQuestion | TextQuestion | OrderQuestion | MatchQuestion;

/** Response shapes per question type. */
export type QuestionResponse =
  | { type: 'choice'; value: string }
  | { type: 'multi'; value: string[] }
  | { type: 'text'; value: string }
  | { type: 'order'; value: string[] }
  | { type: 'match'; value: Record<string, string> };

// ---------------------------------------------------------------------------
// Activities inside lessons
// ---------------------------------------------------------------------------

export interface QuizActivity {
  kind: 'quiz';
  id: string;
  role: 'guided' | 'practice';
  title: string;
  intro?: string;
  /** 'instant' checks each question immediately; 'end' marks everything on submit. */
  feedback: 'instant' | 'end';
  questionIds: string[];
}

export interface ShortWritingItem {
  id: string;
  instruction: string;
  /** Starter text or the weak sentence to improve. */
  starter?: string;
  placeholder?: string;
  /** Original model answer, shown only after the student submits. */
  model: string;
  /** Self-check points shown with the model answer. */
  checklist: string[];
  /** Number of rows for the text area. */
  rows?: number;
}

export interface ShortWritingActivity {
  kind: 'short-writing';
  id: string;
  role: 'guided' | 'practice';
  title: string;
  intro?: string;
  items: ShortWritingItem[];
}

export interface WritingTaskActivity {
  kind: 'writing-task';
  id: string;
  role: 'practice';
  title: string;
  intro?: string;
  writingType: WritingType;
  promptIds: string[];
  /** Number of submissions (any prompt in the list) needed to complete the activity. */
  required: number;
}

export interface RubricReviewActivity {
  kind: 'rubric-review';
  id: string;
  role: 'practice';
  title: string;
  intro?: string;
  writingType: WritingType;
}

export interface MockActivity {
  kind: 'mock';
  id: string;
  role: 'practice';
  title: string;
  intro?: string;
}

export interface FinalReviewActivity {
  kind: 'final-review';
  id: string;
  role: 'practice';
  title: string;
  intro?: string;
}

export type LessonActivity =
  | QuizActivity
  | ShortWritingActivity
  | WritingTaskActivity
  | RubricReviewActivity
  | MockActivity
  | FinalReviewActivity;

export interface LessonPart {
  id: string;
  title: string;
  blocks: LessonBlock[];
  /** Optional quick check shown right after this part. */
  check?: QuizActivity;
}

export interface Lesson {
  id: string;
  day: DayNumber;
  /** Display number, e.g. "1.3". */
  number: string;
  title: string;
  /** One-sentence learning objective in BM (shown in the curriculum). */
  objective: string;
  objectives: string[];
  durationMin: number;
  skill: SkillCategory;
  parts: LessonPart[];
  activities: LessonActivity[];
  /** Short BM summary shown at the end of the lesson. */
  summary: string[];
}

export interface DayInfo {
  day: DayNumber;
  title: string;
  subtitle: string;
  goal: string;
  /** Extra completion requirement explained to the student (BM). */
  completionNote: string;
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export type WritingType = 'email' | 'essay';

export interface RequiredPoint {
  id: string;
  text: string;
  /**
   * Lower-case keywords used only as a gentle hint that a point *may* be missing.
   * Any match counts. These hints are never presented as a definitive judgement.
   */
  keywords: string[];
}

export interface PlanField {
  id: string;
  label: string;
  placeholder?: string;
}

export interface WritingPrompt {
  id: string;
  type: WritingType;
  title: string;
  difficulty: Difficulty;
  /** Formal or informal register. */
  register: 'formal' | 'informal' | 'semi-formal';
  /** The task as the student would read it (English). */
  task: string;
  /** Optional stimulus text, e.g. the email being replied to. */
  stimulus?: { label: string; text: string };
  audience: string;
  purpose: string;
  requiredPoints: RequiredPoint[];
  suggestedMinutes: number;
  /** Word guidance for this practice task only. null when no guidance applies. */
  wordGuide: { min: number; max: number } | null;
  planFields: PlanField[];
  /** Hints in BM for planning. */
  tips: string[];
  modelAnswer: string;
  /** BM notes pointing out what the model answer does well. */
  modelNotes: string[];
}

export interface RubricBand {
  /** Inclusive score range, e.g. [4, 5]. */
  range: [number, number];
  label: string;
  descriptor: string;
}

export interface RubricDimension {
  id: string;
  name: string;
  whatAssessed: string;
  stronger: string[];
  loseMarks: string[];
  nextStep: string;
  bands: RubricBand[];
}

export interface Rubric {
  id: string;
  name: string;
  /** Maximum score per dimension. */
  maxPerDimension: number;
  isOfficial: boolean;
  disclaimer: string;
  dimensions: RubricDimension[];
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export type VocabLevel = 'basic' | 'intermediate' | 'advanced';

export type VocabTopic =
  | 'education'
  | 'health'
  | 'environment'
  | 'technology'
  | 'hobbies'
  | 'experiences'
  | 'school'
  | 'opinions';

export interface VocabEntry {
  id: string;
  word: string;
  meaningMs: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  example: string;
  synonyms?: string[];
  level: VocabLevel;
  day: DayNumber;
  topic: VocabTopic;
  /** Common usage error or tip in BM. */
  note?: string;
  /** Words sharing a group are near-synonyms and are never used as distractors for each other. */
  group?: string;
}

// ---------------------------------------------------------------------------
// Grammar Gym
// ---------------------------------------------------------------------------

export interface GrammarTopic {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  lessonId: string;
}
