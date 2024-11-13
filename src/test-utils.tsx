import { Store, configureStore } from '@reduxjs/toolkit';
import {
  RenderOptions,
  render as rtlRender
} from '@testing-library/react-native';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { StoreState, reducer } from './store';

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
