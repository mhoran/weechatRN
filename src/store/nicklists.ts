import { createReducer } from '@reduxjs/toolkit';
import {
  bufferClosedAction,
  fetchBuffersAction,
  fetchNicklistAction,
  nicklistUpdatedAction
} from './actions';

export type NicklistState = { [key: string]: WeechatNicklist[] };

const initialState: NicklistState = {};

const nicklistsReducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchNicklistAction, (state, action) => {
    return {
      ...state,
      [action.payload.bufferId]: action.payload.nicklist
    };
  });
  builder.addCase(nicklistUpdatedAction, (state, action) => {
    const { added, removed, bufferId } = action.payload;
    const nicklist = state[bufferId] ?? [];

    const filtered = nicklist.filter(
      (nick) => !removed.some((removed) => nick.id === removed.id)
    );

    return { ...state, [bufferId]: [...filtered, ...added] };
  });
  builder.addCase(bufferClosedAction, (state, action) => {
    const { [action.payload]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(fetchBuffersAction, (state, action) => {
    return Object.fromEntries(
      Object.entries(state).filter(([bufferId]) => bufferId in action.payload)
    );
  });
});

export default nicklistsReducer;
