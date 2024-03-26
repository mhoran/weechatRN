import { createReducer } from '@reduxjs/toolkit';
import {
  disconnectAction,
  fetchVersionAction,
  changeCurrentBufferAction,
  bufferClosedAction,
  fetchBuffersRemovedAction,
  upgradeAction,
  bufferNotificationAction,
  clearBufferNotificationAction,
} from './actions';

type AppState = {
  connected: boolean;
  currentBufferId: string | null;
  notificationBufferId: string | null;
};

const initialState: AppState = {
  connected: false,
  currentBufferId: null,
  notificationBufferId: null
};

export const app = createReducer(initialState, (builder) => {
  builder.addCase(disconnectAction, (state) => {
    return {
      ...state,
      connected: false
    };
  });
  builder.addCase(fetchVersionAction, (state) => {
    return {
      ...state,
      connected: true
    };
  });
  builder.addCase(changeCurrentBufferAction, (state, action) => {
    return {
      ...state,
      currentBufferId: action.payload
    };
  });
  builder.addCase(bufferNotificationAction, (state, action) => {
    return {
      ...state,
      notificationBufferId: action.payload
    };
  });
  builder.addCase(clearBufferNotificationAction, (state) => {
    return {
      ...state,
      notificationBufferId: null
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
  builder.addCase(upgradeAction, (state) => {
    return { ...state, currentBufferId: null };
  });
});
