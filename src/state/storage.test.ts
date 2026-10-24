import { describe, expect, it } from 'vitest';
import { BACKUP_KEY, STORAGE_KEY, detectStorage, loadState, saveState, validateState, type StorageLike } from './storage';
import { createInitialState } from './initialState';
import { createAppStore } from './store';
import { STATE_VERSION } from '../types/progress';

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('storage', () => {
  it('starts fresh when nothing is stored', () => {
    const result = loadState(memoryStorage());
    expect(result.status).toBe('fresh');
    expect(result.state.onboarded).toBe(false);
    expect(result.state.attempts).toEqual([]);
  });

  it('restores saved state', () => {
    const storage = memoryStorage();
    const state = { ...createInitialState(), onboarded: true, currentLessonId: 'd1-l2' };
    saveState(storage, state);
    const result = loadState(storage);
    expect(result.status).toBe('restored');
    expect(result.state.onboarded).toBe(true);
    expect(result.state.currentLessonId).toBe('d1-l2');
  });

  it('recovers from unreadable JSON without destroying it', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{not json' });
    const result = loadState(storage);
    expect(result.status).toBe('recovered');
    expect(result.state.onboarded).toBe(false);
    expect(storage.data[BACKUP_KEY]).toBe('{not json');
  });

  it('rejects data from an unknown future version', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ version: STATE_VERSION + 1 }) });
    expect(loadState(storage).status).toBe('recovered');
  });

  it('drops malformed records but keeps valid ones', () => {
    const raw = {
      ...createInitialState(),
      onboarded: true,
      lessons: { 'd1-l1': { completedAt: '2026-01-01T00:00:00.000Z' }, bad: 5 },
      attempts: [{ nope: true }, { id: 'a1', slot: 's', source: 'lesson', submittedAt: '2026-01-01T00:00:00.000Z', results: [], earned: 0, total: 0 }],
      vocab: { hobby: { box: 99, correct: 1, incorrect: 0 }, broken: { box: 'x' } },
      preferences: { displayName: 'A'.repeat(100), textSize: 'huge' },
    };
    const result = validateState(raw);
    expect(result).not.toBeNull();
    expect(result!.state.lessons['d1-l1'].completedAt).toBeDefined();
    expect(result!.state.lessons.bad).toBeUndefined();
    expect(result!.state.attempts).toHaveLength(1);
    expect(result!.state.vocab.hobby.box).toBe(5);
    expect(result!.state.vocab.broken).toBeUndefined();
    expect(result!.state.preferences.displayName).toHaveLength(40);
    expect(result!.state.preferences.textSize).toBe('normal');
    expect(result!.dropped).toBe(3);
  });

  it('handles storage that throws', () => {
    expect(detectStorage(throwing)).toBeNull();
    expect(loadState(null).status).toBe('unavailable');
    expect(saveState(null, createInitialState()).ok).toBe(false);
  });

  it('keeps working in memory when storage is unavailable', () => {
    const store = createAppStore(throwing);
    expect(store.getStatus().storage).toBe('unavailable');
    store.dispatch({ type: 'onboard', displayName: 'Aina' });
    expect(store.getState().onboarded).toBe(true);
  });

  it('persists every change immediately and restores it in a new store (page refresh)', () => {
    const storage = memoryStorage();
    const first = createAppStore(storage);
    first.dispatch({ type: 'onboard' });
    first.dispatch({ type: 'saveDraft', promptId: 'email-hobby', text: 'Hi Danial,', at: '2026-01-01T00:00:00.000Z' });
    const second = createAppStore(storage);
    expect(second.getStatus().loadStatus).toBe('restored');
    expect(second.getState().drafts['email-hobby'].text).toBe('Hi Danial,');
  });

  it('reports a failed save (e.g. full storage) instead of crashing', () => {
    const storage = memoryStorage();
    const store = createAppStore(storage);
    storage.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    store.dispatch({ type: 'onboard' });
    expect(store.getStatus().saveError).toBe('QuotaExceededError');
    expect(store.getState().onboarded).toBe(true);
  });
});
