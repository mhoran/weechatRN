import { createAction } from '@reduxjs/toolkit';

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
