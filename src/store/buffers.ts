import {
  bufferClosedAction,
  bufferLocalvarUpdateAction,
  bufferMovedAction,
  bufferOpenedAction,
  bufferRenamedAction,
  bufferTitleChangedAction,
  fetchBuffersAction,
  lastReadLinesAction
} from './actions';
import { createReducer } from '@reduxjs/toolkit';

export type BufferState = { [key: string]: WeechatBuffer };

const initialState: BufferState = {};

const bufferReducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchBuffersAction, (state, action) => {
    return action.payload;
  });
  builder.addCase(bufferClosedAction, (state, action) => {
    const { [action.payload]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(bufferOpenedAction, (state, action) => {
    return {
      ...state,
      [action.payload.id]: action.payload
    };
  });
  builder.addCase(bufferLocalvarUpdateAction, (state, action) => {
    if (state[action.payload.id] === undefined) return;

    return {
      ...state,
      [action.payload.id]: {
        ...state[action.payload.id],
        local_variables: {
          ...action.payload.local_variables
        }
      }
    };
  });
  builder.addCase(bufferTitleChangedAction, (state, action) => {
    if (state[action.payload.id] === undefined) return;

    return {
      ...state,
      [action.payload.id]: {
        ...state[action.payload.id],
        title: action.payload.title
      }
    };
  });
  builder.addCase(bufferRenamedAction, (state, action) => {
    if (state[action.payload.id] === undefined) return;

    return {
      ...state,
      [action.payload.id]: {
        ...state[action.payload.id],
        full_name: action.payload.full_name,
        short_name: action.payload.short_name
      }
    };
  });
  builder.addCase(bufferMovedAction, (state, action) => {
    if (state[action.payload.id] === undefined) return;

    return {
      ...state,
      [action.payload.id]: {
        ...state[action.payload.id],
        number: action.payload.number
      }
    };
  });
  builder.addCase(lastReadLinesAction, (state, action) => {
    const newState = { ...state };
    action.payload.forEach(({ id, buffer }) => {
      if (state[buffer] === undefined) return;

      newState[buffer] = { ...state[buffer], last_read_line: id };
    });
    return newState;
  });
});

export default bufferReducer;
