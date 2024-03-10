import { createAction } from '@reduxjs/toolkit';
import { BufferState } from './buffers';

export const disconnectAction = createAction<undefined>('DISCONNECT');
export const fetchVersionAction = createAction<string>('FETCH_VERSION');
export const changeCurrentBufferAction = createAction<string>(
  'CHANGE_CURRENT_BUFFER'
);
export const bufferClosedAction = createAction<string>('BUFFER_CLOSED');
export const fetchBuffersRemovedAction = createAction<string[]>(
  'FETCH_BUFFERS_REMOVED'
);
export const upgradeAction = createAction<undefined>('UPGRADE');

export const fetchBuffersAction = createAction<BufferState>('FETCH_BUFFERS');
export const bufferOpenedAction = createAction<WeechatBuffer>('BUFFER_OPENED');
export const bufferLocalvarUpdateAction = createAction<WeechatBuffer>(
  'BUFFER_LOCALVAR_UPDATE'
);
export const bufferLocalvarRemoveAction = createAction<WeechatBuffer>(
  'BUFFER_LOCALVAR_REMOVE'
);
export const bufferRenamedAction =
  createAction<WeechatBuffer>('BUFFER_RENAMED');
export const lastReadLinesAction = createAction<unknown>('LAST_READ_LINES');
