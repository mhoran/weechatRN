import type { Store } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react-native';
import { render as rtlRender } from '@testing-library/react-native';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import type { StoreState } from './store';
import { reducer } from './store';

interface ExtendedRenderOptions extends RenderOptions {
  preloadedState?: Partial<StoreState>;
  store?: Store<StoreState>;
}

function render(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({ reducer, preloadedState }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren): React.JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react-native';
// override render method
export { render };
