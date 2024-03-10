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
};

export type MediaUploadOptions = {
  url: string;
  fieldName?: string;
  regexp?: string;
  basicAuth: boolean;
  username?: string;
  password?: string;
  headers?: Record<string, string>;
};

export type ConnectionInfo = ConnectionOptions & {
  mediaUploadOptions: MediaUploadOptions;
};

const initialState: ConnectionInfo = {
  hostname: null,
  password: null,
  ssl: true,
  filterBuffers: true,
  mediaUploadOptions: {
    url: '',
    basicAuth: true
  }
};

const connectionInfoReducer = createReducer(initialState, (builder) => {
  builder.addCase(setConnectionInfoAction, (state, action) => {
    return {
      ...state,
      hostname: action.payload.hostname,
      password: action.payload.password,
      ssl: action.payload.ssl,
      filterBuffers: action.payload.filterBuffers
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
