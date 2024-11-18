import { ListenerEffectAPI, isAnyOf } from '@reduxjs/toolkit';
import { AppDispatch, StoreState } from '.';
import RelayClient from '../lib/weechat/client';
import {
  bufferNotificationAction,
  disconnectAction,
  fetchBuffersAction,
  pendingBufferNotificationAction,
  pongAction
} from './actions';

export const PendingBufferNotificationListener = (client: RelayClient) => ({
  actionCreator: pendingBufferNotificationAction,
  effect: async (
    action: ReturnType<typeof pendingBufferNotificationAction>,
    listenerApi: ListenerEffectAPI<StoreState, AppDispatch>
  ) => {
    listenerApi.cancelActiveListeners();

    let reallyConnected = false;

    if (client.isConnected()) {
      client.ping();
      const [responseAction] = await listenerApi.take(
        isAnyOf(pongAction, disconnectAction)
      );
      reallyConnected = pongAction.match(responseAction);
    }
    if (!reallyConnected) {
      await listenerApi.condition(fetchBuffersAction.match);
    }

    const buffer = Object.values(listenerApi.getState().buffers).find(
      (buffer) => buffer._id === action.payload.bufferId
    );
    if (!buffer) return;

    listenerApi.dispatch(
      bufferNotificationAction({
        ...action.payload,
        bufferId: buffer.id
      })
    );
  }
});
