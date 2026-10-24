import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { StoreProvider } from '../state/StoreContext';
import { createAppStore, type AppStore } from '../state/store';

export function renderApp(route = '/', store: AppStore = createAppStore()) {
  const utils = render(
    <StoreProvider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </StoreProvider>,
  );
  return { ...utils, store };
}
