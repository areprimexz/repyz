# ENGLISH LAB — 3-Day Writing Bootcamp

An interactive English-writing course for Malaysian secondary school students. Explanations are in **Bahasa Melayu**; examples, exercises, model answers and writing tasks are in **English**.

Students follow a guided three-day programme:

| Day | Focus | Lessons |
| --- | --- | --- |
| 1 | Email Writing | 1.1 Understanding Email Questions · 1.2 Email Structure · 1.3 Useful Email Expressions · 1.4 Sentence Building for Emails · 1.5 Guided Email Practice · 1.6 Independent Email Writing · 1.7 Email Review |
| 2 | Essay Writing | 2.1 Understanding Essay Questions · 2.2 Essay Structure · 2.3 PEEL Paragraph Technique · 2.4 Linking Words · 2.5 Vocabulary and Sentence Improvement · 2.6 Independent Essay Writing |
| 3 | Grammar, Vocabulary & Mock Exam | 3.1 Essential Grammar (8 topics) · 3.2 Vocabulary Revision · 3.3 Correct Common Mistakes · 3.4 Writing Checklist · 3.5 Timed Mock Exam · 3.6 Final Review |

Each lesson follows the loop **learn → see an example → guided practice → independent practice → review mistakes → revise**.

The app works entirely in the browser. It needs **no account, backend or API key**.

## Features

- **Dashboard**: progress calculated from completed lessons, a Continue button (last active lesson or the next incomplete one), day cards with locked, in-progress and complete states, a daily checklist, recent activity, practice accuracy and a vocabulary revision count. A new user sees a real empty state.
- **Curriculum and Lesson Room**: 19 lessons with objectives, explanations in BM, annotated English examples, rule and vocabulary tables, guided exercises (instant feedback), independent practice, answer explanations, completion requirements, and Previous/Next navigation.
- **Quiz engine** (188 hand-written questions plus generated vocabulary questions): multiple choice, true/false, select-all, fill in the blank, sentence correction, sentence ordering, matching, "choose the best email phrase" and PEEL identification.
  - Answer keys are kept out of the rendering components.
  - Options are shuffled with a stable seed per attempt.
  - Unanswered questions are reported separately from wrong ones.
  - A submission cannot be recorded twice.
  - Every question type works with the keyboard.
- **Writing Studio**: 5 email and 6 essay/article prompts at three difficulty levels, each with its own word guidance. It includes:
  - a planning worksheet;
  - a live word, sentence and paragraph count;
  - autosave plus a Save Draft button, and Clear Draft with confirmation;
  - a self-review checklist;
  - submission, rule-based feedback and a model answer that is shown only after the student submits;
  - a side-by-side comparison, the rubric self-assessment, and revise-and-resubmit with every version kept.
- **Vocabulary Lab**: 71 entries across the 3 days and 8 topics. Each entry has a BM meaning, part of speech, example sentence, synonyms where appropriate, difficulty level and usage notes. The lab offers:
  - flashcards with "Saya tahu" (I know it) and "Perlu latihan" (needs practice) marks, plus filters for day, level and status;
  - a quiz with three modes (smart revision, missed words, filtered);
  - Leitner-style spaced revision. Mastery comes only from correct quiz answers; opening or self-marking a card does not count.
- **Grammar Gym**: 66 questions across 9 topics, plus mixed sets and a "repeat my mistakes" set. Explanations are in BM, and per-topic accuracy is calculated from the student's real answers.
- **Exam Arena** (opens after Days 1 and 2 are complete):
  - you set the writing task type, difficulty and duration (35 minutes by default);
  - instructions and marking criteria are shown before the start;
  - the timer keeps running in real time (even across a refresh), answers save automatically, and the exam submits itself when time runs out;
  - you confirm before submitting, then get a results page with explanations.
- **Progress and Mistake Notebook**: scores by skill, frequently missed topics, vocabulary due for revision, saved writing, assessment history, recommended lessons, and retry sets built from unresolved mistakes.
- **Settings**: nickname, larger text size, an explanation of where data is stored, and a progress reset that requires typing `RESET`.

## Getting started

Requirements: **Node.js 18.18 or newer** (Node 20 or 22 recommended; see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Type-checks (`tsc -b`) and builds static files into `dist/` |
| `npm run preview` | Serves the production build locally (http://localhost:4173) |
| `npm run typecheck` | Runs TypeScript only |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs unit and component tests (Vitest + Testing Library, jsdom) |
| `npm run e2e` | Optional browser smoke test (see below) |

### Tests

`npm test` covers:

- quiz scoring and answer validation;
- answer normalisation;
- word, sentence and paragraph counting and the writing checks;
- spaced-revision logic;
- lesson and day completion rules, locking and resume logic;
- storage persistence and restoration, invalid stored data, unavailable or full storage;
- draft autosave and restore;
- mock exam submission, including double-submit protection and auto-submit after the deadline;
- reset confirmation;
- content integrity: every answer key is valid, every referenced question and prompt exists, there are at least 50 vocabulary entries, every model answer meets its own word guidance and required points, and the rubric bands cover every score.

`e2e/smoke.mjs` drives a real Chromium browser through the main student journeys. It also checks for console errors and horizontal scrolling at a 360 px width, and saves screenshots to `e2e/screenshots/`. It needs Playwright:

```bash
npm i -D playwright && npx playwright install chromium   # once
npm run build && npx vite preview --port 4173 &
npm run e2e                                               # BASE_URL=http://localhost:4173/ by default
```

## Project structure

```
src/
  content/            Educational content, separate from the UI
    day1/ day2/ day3/   Lessons and question banks per day (day3/grammar.ts = Grammar Gym bank)
    vocabulary.ts       Vocabulary entries
    writingPrompts.ts   Writing tasks, word guidance, model answers
    rubric.ts           Learning rubric and self-review checklists
    tags.ts             Topic tags → labels and lessons to revisit
    index.ts            Lesson helpers, question registry, generated vocabulary questions
  lib/                Pure logic: quiz grading, writing analysis, spaced revision, progress, exam builder
  state/              Versioned storage, validation, reducer, store and React bindings
  components/         Layout, UI primitives, quiz, lesson, writing and progress components
  pages/              One file per route
  styles/             Design tokens and CSS
  test/               Test setup and end-to-end UI flow tests
e2e/smoke.mjs         Optional Playwright smoke test
```

### Editing content

Lessons, questions, prompts and vocabulary are plain TypeScript data in `src/content/`.

1. Add a question to the relevant `questions.ts` file and reference its id from a lesson activity.
2. Run `npm test`. The content tests flag:
   - a missing reference;
   - an answer key that doesn't match an option;
   - a correction question whose original sentence would be accepted as correct;
   - a model answer outside its word guidance.

## How progress is stored and its limits

- Everything is stored in the browser's `localStorage` under the key `english-lab:state`. This includes lessons, quiz attempts, the Mistake Notebook, vocabulary state, drafts, submissions, exams and preferences.
- Every change is written immediately. Text you are typing saves after a short pause, and also straight away when the page is hidden or closed, so a refresh does not lose work.
- Stored data is **versioned and validated** on load:
  - malformed records are dropped one by one, not wiping everything;
  - unreadable data is kept under `english-lab:unreadable-backup` rather than deleted.
- Progress belongs to **this browser on this device only**:
  - it is not synchronised across devices or browsers;
  - clearing site data or using a private window removes it or makes it invisible.
- If storage is blocked or full, the app keeps working and shows a warning banner.
- There is no cloud sync and no data is sent to any server.

## How writing feedback works (honest limits)

- **Automatic checks are rule-based.** They cover:
  - word, sentence and paragraph counts against the task's guidance;
  - empty responses, repeated spaces and missing spaces around punctuation;
  - lowercase sentence starts and a lowercase "i";
  - email greeting and sign-off, and essay paragraphing;
  - linking words used;
  - a short list of common error patterns (e.g. "I am agree", "they was"), each labelled "mungkin" (possibly).
- Required-point detection only looks for related keywords and is presented as a hint.
- **No AI is used.** The app never claims to "AI-grade" or correct writing.
- The **rubric is a self-assessment learning rubric**: 6 dimensions × 0–5. Each dimension lists the criteria, why marks are lost and a next step. It is **not** an official SPM or other exam marking scheme, and the writing score is shown separately from the auto-marked objective score.
- Word guidance, the mock exam format and the rubric are designed for practice. Official exam formats may differ; students should follow their teacher's instructions.

## Deployment (static hosting)

The build output in `dist/` is a fully static site. It uses **hash-based routing** (`/#/lesson/d1-l1`) and **relative asset paths** (`base: './'`). As a result, it works from a domain root or a sub-folder with **no server rewrite rules**.

- **Netlify**: build command `npm run build`, publish directory `dist`. Or drag and drop the `dist/` folder into the Netlify dashboard.
- **Vercel**: framework preset "Vite", build command `npm run build`, output directory `dist`.
- **Cloudflare Pages**: build command `npm run build`, output directory `dist`, with environment variable `NODE_VERSION=20`.
- **GitHub Pages**: build locally or in GitHub Actions, then publish the contents of `dist/`. For example, use the official `actions/upload-pages-artifact` and `actions/deploy-pages` actions with `path: dist`. Because of relative paths and hash routing, it works at `https://<user>.github.io/<repo>/`.

No environment variables or secrets are required.

## Troubleshooting

- **`npm install` fails**: check `node -v` (18.18 or newer is needed). Delete `node_modules` and run `npm install` again.
- **Blank page after deploying to a sub-folder**: make sure you deployed the contents of `dist/` (including `assets/`), not the repository root.
- **Progress disappeared**: progress is per browser and per device. Private or incognito windows and "clear site data" remove it. Check that you are using the same browser profile.
- **"Storan pelayar tidak tersedia" (browser storage unavailable) banner**: the browser is blocking `localStorage`, for example in some privacy modes. Learning still works, but nothing is saved after the tab closes.
- **Exam auto-submitted unexpectedly**: the exam timer uses real time and keeps running while the tab is closed. When you come back after the deadline, your saved answers are submitted.
- **`npm run e2e` cannot find Playwright**: install it as shown in the Tests section, or skip the step. It is optional.

## Accessibility

- Semantic landmarks and headings, plus a skip link.
- Visible focus outlines and full keyboard operation, including the quiz controls, accessible dialogs with focus trapping and Escape to close, and arrow-key tabs.
- Labelled inputs and live regions for scores and timers.
- Colour contrast built on WCAG-friendly tokens.
- `prefers-reduced-motion` support and an optional larger text size.

## Content notes

All lessons, exercises, model answers and vocabulary examples are original, written for this project. Exam-format notes are general guidance, not official specifications.
