import {
  bufferClosedAction,
  fetchBuffersRemovedAction,
  fetchNicklistAction,
  nicklistUpdatedAction,
  upgradeAction
} from './actions';
import { createReducer } from '@reduxjs/toolkit';

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
    const { added, removed } = action.payload;

    const removedState = removed.reduce((state, removed) => {
      const [bufferId] = removed.pointers;
      return {
        ...state,
        [bufferId]: (state[bufferId] || []).filter(
          (nick) => nick.name !== removed.name
        )
      };
    }, state);

    const updatedState = added.reduce((state, added) => {
      const [bufferId] = added.pointers;
      return {
        ...state,
        [bufferId]: [...(state[bufferId] || []), added]
      };
    }, removedState);

    return updatedState;
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
  builder.addCase(upgradeAction, () => {
    return initialState;
  });
});

export default nicklistsReducer;
