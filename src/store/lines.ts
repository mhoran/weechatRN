import { createReducer } from '@reduxjs/toolkit';
import {
  bufferClearedAction,
  bufferClosedAction,
  bufferLineAddedAction,
  fetchBuffersRemovedAction,
  fetchLinesAction,
  upgradeAction
} from './actions';

export type LineState = { [key: string]: WeechatLine[] };

const initialState: LineState = {};

const linesReducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchLinesAction, (state, action) => {
    return {
      ...state,
      [action.payload[0].buffer]: action.payload
    };
  });
  builder.addCase(bufferClosedAction, (state, action) => {
    const { [action.payload]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(bufferClearedAction, (state, action) => {
    return {
      ...state,
      [action.payload]: []
    };
  });
  builder.addCase(bufferLineAddedAction, (state, action) => {
    return {
      ...state,
      [action.payload.line.buffer]: [
        action.payload.line as WeechatLine,
        ...(state[action.payload.line.buffer] || [])
      ]
    };
  });
  builder.addCase(fetchBuffersRemovedAction, (state, action) => {
    return Object.fromEntries(
      Object.entries(state).filter(
        ([bufferId]) => !(action.payload as string[]).includes(bufferId)
      )
    );
  });
  builder.addCase(upgradeAction, () => {
    return initialState;
  });
});

export default linesReducer;
