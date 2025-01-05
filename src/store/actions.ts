import { createAction, prepareAutoBatched } from '@reduxjs/toolkit';
import type { BufferState } from './buffers';
import type { ConnectionOptions, MediaUploadOptions } from './connection-info';
import type { HotListState } from './hotlists';

export const disconnectAction = createAction('DISCONNECT');
export const fetchVersionAction = createAction<string>('FETCH_VERSION');
export const pongAction = createAction('PONG');
export const upgradeAction = createAction('UPGRADE');
export const setConnectionInfoAction = createAction<ConnectionOptions>(
  'SET_CONNECTION_INFO'
);
export const setMediaUploadOptionsAction = createAction<MediaUploadOptions>(
  'SET_MEDIA_UPLOAD_OPTIONS'
);
export const clearConnectionInfoAction = createAction('CLEAR_CONNECTION_INFO');

export const changeCurrentBufferAction = createAction<string>(
  'CHANGE_CURRENT_BUFFER'
);

export const pendingBufferNotificationAction = createAction<{
  identifier: string;
  bufferId: string;
  lineId: number;
}>('PENDING_BUFFER_NOTIFICATION');
export const bufferNotificationAction = createAction<{
  bufferId: string;
  lineId: number;
  identifier: string;
}>('BUFFER_NOTIFICATION');
export const clearBufferNotificationAction = createAction(
  'CLEAR_BUFFER_NOTIFICATION'
);

export const fetchHotlistsAction = createAction(
  'FETCH_HOTLISTS',
  prepareAutoBatched<{
    hotlists: HotListState;
    currentBufferId: string | null;
  }>()
);

export const fetchBuffersAction = createAction(
  'FETCH_BUFFERS',
  prepareAutoBatched<BufferState>()
);
export const bufferOpenedAction = createAction(
  'BUFFER_OPENED',
  prepareAutoBatched<WeechatBuffer>()
);
export const bufferClosedAction = createAction(
  'BUFFER_CLOSED',
  prepareAutoBatched<string>()
);
export const fetchBuffersRemovedAction = createAction(
  'FETCH_BUFFERS_REMOVED',
  prepareAutoBatched<string[]>()
);
export const bufferLocalvarUpdateAction = createAction(
  'BUFFER_LOCALVAR_UPDATE',
  prepareAutoBatched<WeechatBuffer>()
);
export const bufferTitleChangedAction = createAction(
  'BUFFER_TITLE_CHANGED',
  prepareAutoBatched<WeechatBuffer>()
);
export const bufferRenamedAction = createAction(
  'BUFFER_RENAMED',
  prepareAutoBatched<WeechatBuffer>()
);

export const fetchScriptsAction = createAction(
  'FETCH_SCRIPTS',
  prepareAutoBatched<string[]>()
);

export const lastReadLinesAction = createAction(
  'LAST_READ_LINES',
  prepareAutoBatched<Pick<WeechatLine, 'id' | 'buffer'>[]>()
);

export const fetchLinesAction = createAction(
  'FETCH_LINES',
  prepareAutoBatched<WeechatLine[]>()
);
export const bufferLineAddedAction = createAction(
  'BUFFER_LINE_ADDED',
  prepareAutoBatched<{ line: WeechatLine; currentBufferId: string | null }>()
);
export const bufferLineDataChangedAction = createAction(
  'BUFFER_LINE_DATA_CHANGED',
  prepareAutoBatched<WeechatLine>()
);
export const bufferClearedAction = createAction(
  'BUFFER_CLEARED',
  prepareAutoBatched<string>()
);

export const fetchNicklistAction = createAction(
  'FETCH_NICKLIST',
  prepareAutoBatched<{
    bufferId: string;
    nicklist: WeechatNicklist[];
  }>()
);
export const nicklistUpdatedAction = createAction(
  'NICKLIST_UPDATED',
  prepareAutoBatched<{
    added: WeechatNicklist[];
    removed: WeechatNicklist[];
    bufferId: string;
  }>()
);
