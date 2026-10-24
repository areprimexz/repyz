import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import type { AppState } from '../types/progress';
import type { Action } from './reducer';
import type { AppStore, StoreStatus } from './store';

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ store, children }: { store: AppStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function useStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('StoreProvider is missing');
  return store;
}

export function useAppState(): AppState {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function useStoreStatus(): StoreStatus {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getStatus, store.getStatus);
}

export function useDispatch(): (action: Action) => void {
  return useStore().dispatch;
}

/** Synchronous access to the latest state (e.g. inside event handlers). */
export function useGetState(): () => AppState {
  return useStore().getState;
}
