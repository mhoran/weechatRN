import { createReducer } from '@reduxjs/toolkit';
import {
  clearConnectionInfoAction,
  setConnectionInfoAction,
  setMediaUploadOptionsAction
} from './actions';

export type ConnectionOptions = {
  hostname: string | null;
  password: string | null;
  ssl: boolean;
  filterBuffers: boolean;
  path: string | null;
};

export type MediaUploadOptions = {
  url?: string;
  fieldName?: string;
  regexp?: string;
  basicAuth: boolean;
  username?: string;
  password?: string;
  headers?: Record<string, string>;
};

export type Settings = ConnectionOptions & {
  mediaUploadOptions: MediaUploadOptions;
};

const initialState: Settings = {
  hostname: null,
  password: null,
  ssl: true,
  filterBuffers: true,
  path: null,
  mediaUploadOptions: {
    basicAuth: true
  }
};

const connectionInfoReducer = createReducer(initialState, (builder) => {
  builder.addCase(setConnectionInfoAction, (state, action) => {
    return {
      ...state,
      ...action.payload
    };
  });
  builder.addCase(setMediaUploadOptionsAction, (state, action) => {
    return { ...state, mediaUploadOptions: action.payload };
  });
  builder.addCase(clearConnectionInfoAction, () => {
    return initialState;
  });
});

export default connectionInfoReducer;
