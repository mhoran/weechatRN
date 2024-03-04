import { AnyAction } from 'redux';

export type ConnectionInfo = {
  hostname: string | null;
  password: string | null;
  ssl: boolean;
  filterBuffers: boolean;
  mediaUploadOptions: {
    url: string;
    fieldName?: string;
    basicAuth: boolean;
    username?: string;
    password?: string;
  };
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

export default (
  state: ConnectionInfo = initialState,
  action: AnyAction
): ConnectionInfo => {
  switch (action.type) {
    case 'SET_CONNECTION_INFO':
      return {
        ...state,
        hostname: action.hostname,
        password: action.password,
        ssl: action.ssl,
        filterBuffers: action.filterBuffers
      };
    case 'SET_MEDIA_UPLOAD_OPTIONS':
      return { ...state, mediaUploadOptions: action.payload };
    case 'CLEAR_CONNECTION_INFO':
      return initialState;
    default:
      return state;
  }
};
