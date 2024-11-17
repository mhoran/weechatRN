import { createReducer } from '@reduxjs/toolkit';
import {
  bufferClearedAction,
  bufferClosedAction,
  bufferLineAddedAction,
  bufferLineDataChangedAction,
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
        action.payload.line,
        ...(state[action.payload.line.buffer] ?? [])
      ]
    };
  });
  builder.addCase(bufferLineDataChangedAction, (state, action) => {
    const lines = state[action.payload.buffer];
    if (lines === undefined) return state;

    const lineIndex = lines.findIndex((line) => line.id === action.payload.id);
    if (lineIndex < 0) return state;

    return {
      ...state,
      [action.payload.buffer]: lines.toSpliced(lineIndex, 1, action.payload)
    };
  });
  builder.addCase(fetchBuffersRemovedAction, (state, action) => {
    return Object.fromEntries(
      Object.entries(state).filter(
        ([bufferId]) => !action.payload.includes(bufferId)
      )
    );
  });
  builder.addCase(upgradeAction, () => {
    return initialState;
  });
});

export default linesReducer;
