import {
  bufferClosedAction,
  bufferLocalvarUpdateAction,
  bufferOpenedAction,
  bufferRenamedAction,
  fetchBuffersAction,
  lastReadLinesAction,
  upgradeAction
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
  builder.addCase(bufferRenamedAction, (state, action) => {
    return {
      ...state,
      [action.payload.id]: {
        ...state[action.payload.id],
        full_name: action.payload.full_name,
        short_name: action.payload.short_name
      }
    };
  });
  builder.addCase(lastReadLinesAction, (state, action) => {
    const newState = { ...state };
    action.payload.forEach(({ id, buffer }) => {
      newState[buffer] = { ...state[buffer], last_read_line: id };
    });
    return newState;
  });
  builder.addCase(upgradeAction, () => {
    return initialState;
  });
});

export default bufferReducer;
