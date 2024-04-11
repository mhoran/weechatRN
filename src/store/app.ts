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
  fetchLinesAction
} from './actions';

export type AppState = {
  connected: boolean;
  currentBufferId: string | null;
  notification: { bufferId: string; lineId: string; identifier: string } | null;
  notificationBufferLinesFetched: boolean;
};

const initialState: AppState = {
  connected: false,
  currentBufferId: null,
  notification: null,
  notificationBufferLinesFetched: false
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
  builder.addCase(fetchLinesAction, (state, action) => {
    return {
      ...state,
      notificationBufferLinesFetched:
        (state.notification &&
          action.payload[0].buffer === state.notification.bufferId) ||
        state.notificationBufferLinesFetched
    };
  });
  builder.addCase(bufferNotificationAction, (state, action) => {
    return {
      ...state,
      notification: action.payload,
      notificationBufferLinesFetched: false
    };
  });
  builder.addCase(clearBufferNotificationAction, (state) => {
    return {
      ...state,
      notification: null,
      notificationBufferLinesFetched: false
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
