import type { AppState } from '../types/progress';
import { reducer, type Action } from './reducer';
import { detectStorage, loadState, saveState, type LoadStatus, type StorageLike } from './storage';

export interface StoreStatus {
  /** 'unavailable' when the browser blocks storage; progress then lasts only for this page session. */
  storage: 'ok' | 'unavailable';
  loadStatus: LoadStatus;
  /** Malformed records dropped while loading. */
  dropped: number;
  /** Set when the most recent save failed (e.g. storage full). */
  saveError?: string;
}

export interface AppStore {
  getState(): AppState;
  getStatus(): StoreStatus;
  dispatch(action: Action): void;
  subscribe(listener: () => void): () => void;
}

/**
 * A small external store. Every state change is written to storage
 * synchronously, so work typed just before a refresh or tab close is kept.
 */
export function createAppStore(storageCandidate?: StorageLike | null): AppStore {
  const storage = detectStorage(storageCandidate);
  const loaded = loadState(storage);
  let state = loaded.state;
  let status: StoreStatus = {
    storage: storage ? 'ok' : 'unavailable',
    loadStatus: loaded.status,
    dropped: loaded.dropped,
  };
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((l) => l());

  return {
    getState: () => state,
    getStatus: () => status,
    dispatch(action) {
      const next = reducer(state, action);
      if (next === state) return;
      state = next;
      if (storage) {
        const result = saveState(storage, state);
        const saveError = result.ok ? undefined : (result.error ?? 'unknown');
        if (saveError !== status.saveError) status = { ...status, saveError };
      }
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
