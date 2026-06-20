import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { StoreState } from '../../../store';
import * as actions from '../../../store/actions';
import { reduceToObjectByKey } from '../action_transformer';

interface HotlistResponse {
  code: number;
  body_type: string;
  body: { buffer_id: number; count: [number, number, number, number] }[];
}

function isHotlistResponse(response: unknown): response is HotlistResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'hotlist'
  );
}

export default function HotlistAction(response: HotlistResponse) {
  if (response.code !== 200) return;

  return (
    dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
    getState: () => StoreState
  ) => {
    const state: StoreState = getState();

    dispatch(
      actions.fetchHotlistsAction({
        hotlists: reduceToObjectByKey(
          response.body,
          (hotlist) => String(hotlist.buffer_id),
          ({ buffer_id, count }) => {
            const [, message, privmsg, highlight] = count;
            const sum = message + privmsg + highlight;
            return {
              buffer: String(buffer_id),
              message,
              privmsg,
              highlight,
              sum
            };
          }
        ),
        currentBufferId: state.app.currentBufferId
      })
    );
  };
}

HotlistAction.from_response = function (response: unknown) {
  if (!isHotlistResponse(response)) return;

  return HotlistAction(response);
};
