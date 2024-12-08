import { getHotlistForBufferId } from './selectors';
import {
  bufferClosedAction,
  bufferLineAddedAction,
  changeCurrentBufferAction,
  fetchBuffersRemovedAction,
  fetchHotlistsAction
} from './actions';
import { createReducer } from '@reduxjs/toolkit';

export type HotListState = { [key: string]: Hotlist };

const initialState: HotListState = {};

const hotlistsReducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchHotlistsAction, (state, action) => {
    if (action.payload.currentBufferId) {
      const { [action.payload.currentBufferId]: _, ...rest } =
        action.payload.hotlists;
      return rest;
    }

    return action.payload.hotlists;
  });
  builder.addCase(changeCurrentBufferAction, (state, action) => {
    const { [action.payload]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(bufferLineAddedAction, (state, action) => {
    const { line, currentBufferId } = action.payload;

    if (line.buffer === currentBufferId) {
      return state;
    }

    const hotlist = {
      ...getHotlistForBufferId(state, line.buffer)
    };

    const shouldNotify =
      line.notify_level !== undefined
        ? line.notify_level > 0
        : line.tags_array.every(
            (tag) => tag !== 'irc_smart_filter' && tag !== 'notify_none'
          );
    if (shouldNotify) {
      if (line.highlight !== 0) {
        hotlist.highlight++;
      }
      hotlist.sum++;
    }

    return {
      ...state,
      [line.buffer]: hotlist
    };
  });
  builder.addCase(bufferClosedAction, (state, action) => {
    const { [action.payload]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(fetchBuffersRemovedAction, (state, action) => {
    return Object.fromEntries(
      Object.entries(state).filter(
        ([bufferId]) => !action.payload.includes(bufferId)
      )
    );
  });
});

export default hotlistsReducer;
