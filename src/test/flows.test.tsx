import { describe, expect, it } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp';
import { createAppStore } from '../state/store';
import { STORAGE_KEY } from '../state/storage';
import { buildExam, DEFAULT_EXAM_CONFIG } from '../lib/exam';
import { getLesson, lessonActivities, lessonsForDay } from '../content';
import type { AppState } from '../types/progress';

function seedState(mutate: (s: AppState) => AppState) {
  const store = createAppStore();
  const next = mutate(store.getState());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return createAppStore();
}

describe('first-time learner (Flow A)', () => {
  it('redirects to onboarding, starts Day 1 and shows the first lesson', async () => {
    const user = userEvent.setup();
    const { store } = renderApp('/');
    expect(await screen.findByRole('heading', { name: '3-Day Writing Bootcamp' })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Nama panggilan/), 'Aina');
    await user.click(screen.getByRole('button', { name: /Mula Hari 1/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Understanding Email Questions' })).toBeInTheDocument();
    expect(store.getState().onboarded).toBe(true);
    expect(store.getState().preferences.displayName).toBe('Aina');
    expect(store.getState().currentLessonId).toBe('d1-l1');
  });

  it('shows a genuine empty dashboard for a new user', async () => {
    const store = createAppStore();
    store.dispatch({ type: 'onboard' });
    renderApp('/', store);
    expect(await screen.findByText(/Anda belum memulakan sebarang pelajaran/)).toBeInTheDocument();
    expect(screen.getByText('Belum ada cubaan direkodkan')).toBeInTheDocument();
    expect(screen.getByText('Belum ada aktiviti')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mula Hari 1/ })).toHaveAttribute('href', '/lesson/d1-l1');
  });
});

describe('lesson quizzes', () => {
  it('gives instant feedback with an explanation in guided practice', async () => {
    const user = userEvent.setup();
    const { store } = renderApp('/lesson/d1-l1');
    const quiz = await screen.findByRole('region', { name: /Latihan berpandu: Analisis soalan Reading Week/ });
    const first = within(quiz).getAllByRole('article')[0];
    await user.click(within(first).getByLabelText('Ms Wong, your English teacher'));
    await user.click(within(quiz).getAllByRole('button', { name: 'Semak jawapan' })[0]);
    expect(within(first).getByText('Betul')).toBeInTheDocument();
    expect(within(first).getByText(/Penerima ialah guru anda/)).toBeInTheDocument();
    expect(store.getState().quizSessions['lesson:d1-l1:d1-l1-guided'].checked).toEqual(['d1l1-g1']);
  });

  it('confirms before submitting with unanswered questions and records the attempt once', async () => {
    const user = userEvent.setup();
    const { store } = renderApp('/lesson/d1-l1');
    const quiz = await screen.findByRole('region', { name: /Latihan kendiri: Analisis soalan baharu/ });
    const first = within(quiz).getAllByRole('article')[0];
    await user.click(within(first).getByLabelText(/Mei Ling, a friend/));
    await user.click(within(quiz).getByRole('button', { name: /Hantar jawapan/ }));
    const dialog = await screen.findByRole('dialog', { name: /belum dijawab/ });
    const confirm = within(dialog).getByRole('button', { name: 'Hantar juga' });
    // Rapid double click must not create two attempts.
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const attempts = store.getState().attempts.filter((a) => a.activityId === 'd1-l1-practice');
    expect(attempts).toHaveLength(1);
    expect(attempts[0].results.filter((r) => r.status === 'unanswered')).toHaveLength(5);
    expect(within(quiz).getByText(/5/, { selector: '.score__breakdown strong' })).toBeInTheDocument();
    expect(within(quiz).getAllByText('Tidak dijawab').length).toBeGreaterThan(0);
  });

  it('only allows marking a lesson complete after its requirements are met', async () => {
    const user = userEvent.setup();
    const store = seedState((s) => {
      const lesson = getLesson('d1-l1')!;
      const attempts = lessonActivities(lesson).map((a) => ({
        id: `att-${a.id}`,
        slot: a.id,
        source: 'lesson' as const,
        title: a.title,
        activityId: a.id,
        startedAt: s.createdAt,
        submittedAt: s.createdAt,
        results: [],
        earned: 0,
        total: 0,
      }));
      return { ...s, onboarded: true, attempts };
    });
    renderApp('/lesson/d1-l1', store);
    const button = await screen.findByRole('button', { name: /Tandakan pelajaran selesai/ });
    expect(button).toBeDisabled();
    await user.click(screen.getByLabelText('Saya telah membaca penerangan dan contoh'));
    expect(button).toBeEnabled();
    await user.click(button);
    expect(await screen.findByText(/Pelajaran selesai pada/)).toBeInTheDocument();
    expect(store.getState().lessons['d1-l1'].completedAt).toBeDefined();
  });

  it('shows locked lessons as locked', async () => {
    renderApp('/lesson/d2-l1');
    expect(await screen.findByText('Pelajaran ini belum dibuka')).toBeInTheDocument();
  });
});

describe('writing studio (Flow C/D)', () => {
  it('autosaves a draft and restores it after the page is reopened', async () => {
    const user = userEvent.setup();
    const first = renderApp('/writing/email-hobby');
    const editor = await screen.findByLabelText('Respons anda');
    await user.type(editor, 'Hi Danial, I recommend chess.');
    expect(screen.getByText('5', { selector: '.editor__words strong' })).toBeInTheDocument();
    first.unmount();
    // A fresh store reads from localStorage, as after a refresh.
    renderApp('/writing/email-hobby', createAppStore());
    expect(await screen.findByLabelText('Respons anda')).toHaveValue('Hi Danial, I recommend chess.');
  });

  it('asks before clearing a draft', async () => {
    const user = userEvent.setup();
    const { store } = renderApp('/writing/email-hobby');
    await user.type(await screen.findByLabelText('Respons anda'), 'Some text');
    await user.click(screen.getByRole('button', { name: /Kosongkan draf/ }));
    const dialog = await screen.findByRole('dialog', { name: /Kosongkan draf ini/ });
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }));
    expect(screen.getByLabelText('Respons anda')).toHaveValue('Some text');
    await user.click(screen.getByRole('button', { name: /Kosongkan draf/ }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ya, kosongkan' }));
    expect(screen.getByLabelText('Respons anda')).toHaveValue('');
    expect(store.getState().drafts['email-hobby'].text).toBe('');
  });

  it('submits writing, shows honest feedback and the model answer, and keeps the draft for revision', async () => {
    const user = userEvent.setup();
    const { store } = renderApp('/writing/email-hobby');
    await user.type(await screen.findByLabelText('Respons anda'), 'Hi Danial,{enter}{enter}I recommend chess because you enjoy puzzles.{enter}{enter}Best wishes,{enter}Amir');
    await user.click(screen.getByRole('button', { name: /Hantar untuk semakan/ }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Hantar' }));
    expect(await screen.findByRole('heading', { name: /Semakan asas automatik/ })).toBeInTheDocument();
    expect(screen.getByText(/bukan penilaian AI/)).toBeInTheDocument();
    expect(screen.getByText(/Jawapan model \(/)).toBeInTheDocument();
    expect(screen.getByText(/Kurang daripada panduan perkataan/)).toBeInTheDocument();
    expect(store.getState().submissions).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Perbaiki draf' }));
    expect(await screen.findByLabelText('Respons anda')).toHaveValue(store.getState().submissions[0].text);
  });
});

describe('settings', () => {
  it('requires typing RESET before deleting all progress', async () => {
    const user = userEvent.setup();
    const store = createAppStore();
    store.dispatch({ type: 'onboard', displayName: 'Aina' });
    store.dispatch({ type: 'saveDraft', promptId: 'email-hobby', text: 'keep me', at: new Date().toISOString() });
    renderApp('/settings', store);
    await user.click(await screen.findByRole('button', { name: /Tetapkan semula semua kemajuan/ }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Padam semua' });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox'), 'reset');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(store.getState().drafts).toEqual({});
    expect(store.getState().onboarded).toBe(false);
    expect(await screen.findByRole('heading', { name: '3-Day Writing Bootcamp' })).toBeInTheDocument();
  });
});

describe('exam arena (Flow F)', () => {
  function unlockedStore(extra: (s: AppState) => AppState = (s) => s) {
    return seedState((s) => {
      let next: AppState = { ...s, onboarded: true };
      for (const day of [1, 2] as const) {
        for (const l of lessonsForDay(day)) next.lessons[l.id] = { completedAt: s.createdAt, readAck: true };
      }
      next = {
        ...next,
        submissions: [
          { id: 'e1', promptId: 'email-hobby', writingType: 'email', context: 'studio', text: 'Hi', plan: {}, checklist: [], wordCount: 1, submittedAt: s.createdAt, version: 1, pointsTicked: [] },
          { id: 'e2', promptId: 'essay-reading', writingType: 'essay', context: 'studio', text: 'Essay', plan: {}, checklist: [], wordCount: 1, submittedAt: s.createdAt, version: 1, pointsTicked: [] },
        ],
      };
      return extra(next);
    });
  }

  it('is locked until Days 1 and 2 are complete', async () => {
    renderApp('/exam');
    expect(await screen.findByText('Exam Arena belum dibuka')).toBeInTheDocument();
  });

  it('shows instructions and criteria, starts a timed exam and submits to a results page', async () => {
    const user = userEvent.setup();
    const store = unlockedStore();
    renderApp('/exam', store);
    expect(await screen.findByRole('heading', { name: 'Kriteria pemarkahan' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Mula ujian/ }));
    expect(await screen.findByRole('timer')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Jawapan penulisan anda'), 'Dear Sir,');
    await user.click(screen.getAllByRole('button', { name: /Hantar ujian/ })[0]);
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ya, hantar' }));
    expect(await screen.findByRole('heading', { name: 'Pecahan markah' })).toBeInTheDocument();
    const exam = store.getState().exams[0];
    expect(exam.status).toBe('submitted');
    expect(exam.writing).toBe('Dear Sir,');
    expect(store.getState().submissions.some((s) => s.context === 'exam')).toBe(true);
    // Review cannot be marked until the writing is self-assessed.
    expect(screen.getByRole('button', { name: /Tandakan keputusan sudah disemak/ })).toBeDisabled();
  });

  it('auto-submits saved answers when the time has already run out (e.g. after closing the tab)', async () => {
    const past = new Date(Date.now() - 60 * 60_000).toISOString();
    const store = unlockedStore((s) => {
      const exam = buildExam(DEFAULT_EXAM_CONFIG, past, 9);
      return { ...s, exams: [{ ...exam, writing: 'Saved before closing' }] };
    });
    await act(async () => {
      renderApp('/exam', store);
    });
    expect(await screen.findByText('Masa tamat')).toBeInTheDocument();
    const exam = store.getState().exams[0];
    expect(exam).toMatchObject({ status: 'submitted', autoSubmitted: true });
    expect(store.getState().submissions.find((s) => s.id === exam.submissionId)?.text).toBe('Saved before closing');
    expect(store.getState().attempts.filter((a) => a.source === 'exam')).toHaveLength(1);
  });
});

describe('navigation', () => {
  it('opens every main destination', async () => {
    const store = createAppStore();
    store.dispatch({ type: 'onboard' });
    const pages: [string, RegExp][] = [
      ['/', /Selamat datang/],
      ['/curriculum', /Semua pelajaran/],
      ['/writing', /Tugasan penulisan/],
      ['/vocabulary', /Makmal kosa kata/],
      ['/grammar', /Gim tatabahasa/],
      ['/exam', /Ujian percubaan bertempoh/],
      ['/progress', /Kemajuan & Buku Kesilapan/],
      ['/settings', /Tetapan dan data/],
      ['/nope', /Halaman tidak dijumpai/],
    ];
    for (const [route, heading] of pages) {
      const { unmount } = renderApp(route, store);
      expect(await screen.findByText(heading, { selector: 'h1, .empty-state__title' }), route).toBeInTheDocument();
      unmount();
    }
  });
});
