import { createReducer } from '@reduxjs/toolkit';
import {
  disconnectAction,
  fetchVersionAction,
  changeCurrentBufferAction,
  bufferClosedAction,
  fetchBuffersRemovedAction,
  bufferNotificationAction,
  clearBufferNotificationAction,
  fetchLinesAction
} from './actions';

export type AppState = {
  connected: boolean;
  currentBufferId: string | null;
  notification: { bufferId: string; lineId: number; identifier: string } | null;
  currentBufferLinesFetched: boolean;
  version: string;
};

const initialState: AppState = {
  connected: false,
  currentBufferId: null,
  notification: null,
  currentBufferLinesFetched: false,
  version: ''
};

export const app = createReducer(initialState, (builder) => {
  builder.addCase(disconnectAction, (state) => {
    return {
      ...state,
      connected: false,
      currentBufferLinesFetched: false
    };
  });
  builder.addCase(fetchVersionAction, (state, action) => {
    return {
      ...state,
      connected: true,
      version: action.payload
    };
  });
  builder.addCase(changeCurrentBufferAction, (state, action) => {
    return {
      ...state,
      currentBufferId: action.payload,
      currentBufferLinesFetched: false
    };
  });
  builder.addCase(fetchLinesAction, (state, action) => {
    return {
      ...state,
      currentBufferLinesFetched:
        (state.currentBufferId &&
          action.payload[0].buffer === state.currentBufferId) ||
        state.currentBufferLinesFetched
    };
  });
  builder.addCase(bufferNotificationAction, (state, action) => {
    return {
      ...state,
      notification: action.payload
    };
  });
  builder.addCase(clearBufferNotificationAction, (state) => {
    return {
      ...state,
      notification: null
    };
  });
  builder.addCase(bufferClosedAction, (state, action) => {
    return {
      ...state,
      currentBufferId:
        action.payload === state.currentBufferId ? null : state.currentBufferId
    };
  });
  builder.addCase(fetchBuffersRemovedAction, (state, action) => {
    return {
      ...state,
      currentBufferId:
        state.currentBufferId && action.payload.includes(state.currentBufferId)
          ? null
          : state.currentBufferId
    };
  });
});
