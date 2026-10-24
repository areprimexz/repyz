// Browser smoke test for the main student journeys.
//
// Usage:
//   npm run build && npx vite preview --port 4173 &
//   npm run e2e            # BASE_URL defaults to http://localhost:4173/
//
// Requires Playwright with Chromium available (e.g. `npm i -D playwright && npx playwright install chromium`).
// Screenshots are written to e2e/screenshots/ (git-ignored).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const SHOTS = new URL('./screenshots/', import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const problems = [];
const passed = [];
const check = (ok, label) => (ok ? passed.push(label) : problems.push(label));

const browser = await chromium.launch();

async function open(viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console error: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  return { context, page };
}

const go = (page, route) => page.goto(`${BASE}#${route}`);

// ------------------------------------------------------------------ Flow A + B
{
  const { context, page } = await open({ width: 1366, height: 900 });
  await page.goto(BASE);
  await page.getByRole('heading', { name: '3-Day Writing Bootcamp' }).waitFor();
  await page.screenshot({ path: `${SHOTS}desktop-onboarding.png`, fullPage: true });
  await page.getByLabel(/Nama panggilan/).fill('Aina');
  await page.getByRole('button', { name: /Mula Hari 1/ }).click();
  await page.getByRole('heading', { level: 1, name: 'Understanding Email Questions' }).waitFor();
  check(true, 'Flow A: onboarding → lesson 1.1');

  const guided = page.getByRole('region', { name: /Latihan berpandu: Analisis soalan Reading Week/ });
  await guided.getByLabel('Ms Wong, your English teacher').check();
  await guided.getByRole('button', { name: 'Semak jawapan' }).first().click();
  check(await guided.getByText('Betul').first().isVisible(), 'Flow A: instant feedback shown');
  await page.screenshot({ path: `${SHOTS}desktop-lesson.png`, fullPage: true });

  await page.reload();
  await page.getByRole('heading', { level: 1, name: 'Understanding Email Questions' }).waitFor();
  const guidedAfter = page.getByRole('region', { name: /Latihan berpandu: Analisis soalan Reading Week/ });
  check(await guidedAfter.getByText('1/6 disemak').isVisible(), 'Flow B: quiz progress restored after refresh');
  await go(page, '/');
  check(await page.getByRole('heading', { name: /Selamat kembali, Aina/ }).isVisible(), 'Flow B: dashboard greets returning learner');
  check(await page.getByRole('link', { name: /Teruskan/ }).first().getAttribute('href').then((h) => h?.includes('/lesson/d1-l1')), 'Flow B: continue goes to last active lesson');
  await page.screenshot({ path: `${SHOTS}desktop-dashboard.png`, fullPage: true });

  // ------------------------------------------------------------ Flow C (writing)
  await go(page, '/writing/email-hobby');
  const editor = page.getByLabel('Respons anda');
  await editor.fill('Hi Danial,\n\nI recommend chess because you enjoy puzzles. You only need a board to start.\n\nBest wishes,\nAina');
  await page.waitForTimeout(900);
  await page.reload();
  check((await page.getByLabel('Respons anda').inputValue()).startsWith('Hi Danial,'), 'Flow C: draft autosaved and restored after refresh');
  await page.getByRole('button', { name: /Hantar untuk semakan/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hantar' }).click();
  await page.getByRole('heading', { name: /Semakan asas automatik/ }).waitFor();
  check(await page.getByText(/Jawapan model \(/).isVisible(), 'Flow C: model answer shown after submission');
  await page.screenshot({ path: `${SHOTS}desktop-writing-review.png`, fullPage: true });

  // ------------------------------------------------------------ Grammar Gym (Flow E)
  await go(page, '/grammar');
  await page.getByRole('button', { name: /Latih topik ini/ }).first().click();
  await page.getByRole('button', { name: /Hantar jawapan/ }).waitFor();
  await page.locator('.choice').first().click();
  await page.getByRole('button', { name: /Hantar jawapan/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hantar juga' }).click();
  check(await page.locator('.score').isVisible(), 'Flow E: grammar set scored with explanations');
  await page.screenshot({ path: `${SHOTS}desktop-grammar-results.png`, fullPage: true });

  // ------------------------------------------------------------ Vocabulary Lab
  await go(page, '/vocabulary');
  await page.getByRole('button', { name: /Tunjuk maksud/ }).click();
  await page.getByRole('button', { name: /Saya tahu/ }).click();
  await page.getByRole('tab', { name: 'Kuiz' }).click();
  await page.getByRole('button', { name: /Mula kuiz/ }).click();
  await page.getByRole('button', { name: /Hantar jawapan/ }).waitFor();
  check(true, 'Vocabulary quiz starts');
  await page.screenshot({ path: `${SHOTS}desktop-vocab-quiz.png`, fullPage: true });
  await context.close();
}

// ------------------------------------------------------------------ Flow F (exam)
{
  const { context, page } = await open({ width: 1280, height: 860 });
  await page.goto(BASE);
  const now = new Date().toISOString();
  const lessons = {};
  for (const [day, count] of [
    [1, 7],
    [2, 6],
  ]) {
    for (let i = 1; i <= count; i++) lessons[`d${day}-l${i}`] = { readAck: true, completedAt: now };
  }
  const sub = (id, promptId, writingType) => ({ id, promptId, writingType, context: 'studio', text: 'Text', plan: {}, checklist: [], wordCount: 1, submittedAt: now, version: 1, pointsTicked: [] });
  const state = {
    version: 1,
    createdAt: now,
    onboarded: true,
    preferences: { displayName: '', textSize: 'normal' },
    lessons,
    currentLessonId: null,
    quizSessions: {},
    attempts: [],
    mistakes: {},
    vocab: {},
    shortResponses: {},
    drafts: {},
    submissions: [sub('s1', 'email-hobby', 'email'), sub('s2', 'essay-reading', 'essay')],
    exams: [],
    activity: [],
  };
  await page.evaluate((s) => localStorage.setItem('english-lab:state', JSON.stringify(s)), state);
  await go(page, '/exam');
  await page.reload();
  await page.getByRole('heading', { name: 'Kriteria pemarkahan' }).waitFor();
  await page.screenshot({ path: `${SHOTS}desktop-exam-start.png`, fullPage: true });
  await page.getByRole('button', { name: /Mula ujian/ }).click();
  await page.getByRole('timer').waitFor();
  await page.locator('.choice').first().click();
  await page.getByLabel('Jawapan penulisan anda').fill('Dear Mr Ganesh,\n\nI am writing to tell you about our trip.\n\nYours sincerely,\nAina');
  await page.waitForTimeout(700);
  await page.reload();
  await page.getByRole('timer').waitFor();
  check((await page.getByLabel('Jawapan penulisan anda').inputValue()).startsWith('Dear Mr Ganesh'), 'Flow F: exam writing survives refresh');
  await page.screenshot({ path: `${SHOTS}desktop-exam-running.png` });
  await page.getByRole('button', { name: /Hantar ujian/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Ya, hantar' }).click();
  await page.getByRole('heading', { name: 'Pecahan markah' }).waitFor();
  check(true, 'Flow F: exam submitted → results page');
  await page.screenshot({ path: `${SHOTS}desktop-exam-results.png`, fullPage: true });

  // ------------------------------------------------------------ Flow G (progress)
  await go(page, '/progress');
  await page.getByRole('heading', { name: 'Markah mengikut kemahiran' }).waitFor();
  await page.getByRole('tab', { name: 'Buku Kesilapan' }).click();
  check(await page.getByRole('button', { name: /Ulang .* kesilapan/ }).isVisible(), 'Flow G: Mistake Notebook opens');
  await page.screenshot({ path: `${SHOTS}desktop-notebook.png`, fullPage: true });
  await context.close();
}

// ------------------------------------------------------------------ Mobile layout
{
  const { context, page } = await open({ width: 360, height: 780 });
  await page.goto(BASE);
  await page.getByRole('button', { name: /Lihat kurikulum/ }).click();
  const routes = ['/', '/curriculum', '/lesson/d1-l1', '/lesson/d1-l2', '/lesson/d1-l5', '/writing', '/writing/email-trip', '/vocabulary', '/grammar', '/exam', '/progress', '/settings'];
  for (const route of routes) {
    await go(page, route);
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, `Mobile 360px: no horizontal scroll on ${route} (overflow ${overflow}px)`);
    const name = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
    await page.screenshot({ path: `${SHOTS}mobile-${name}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.getByRole('dialog', { name: 'Menu' }).waitFor();
  await page.screenshot({ path: `${SHOTS}mobile-menu.png` });
  await page.keyboard.press('Escape');
  check(!(await page.getByRole('dialog', { name: 'Menu' }).isVisible().catch(() => false)), 'Mobile menu closes with Escape');
  await context.close();
}

await browser.close();

for (const p of passed) console.log(`PASS  ${p}`);
for (const p of problems) console.log(`FAIL  ${p}`);
console.log(`\n${passed.length} passed, ${problems.length} problems`);
process.exit(problems.length ? 1 : 0);
