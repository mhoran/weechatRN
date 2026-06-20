import * as actions from '../../../store/actions';
import type { NickResponse } from './types';

function isNickResponse(response: unknown): response is NickResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'nick'
  );
}

export default function NickAction(response: NickResponse) {
  if (response.code !== 0) return;

  const { id, visible, parent_group_id, ...rest } = response.body;
  const nick = {
    ...rest,
    id: String(id),
    visible: Number(visible),
    group: 0
  };
  const bufferId = String(response.buffer_id);

  switch (response.event_name) {
    case 'nicklist_nick_removing': {
      return actions.nicklistUpdatedAction({
        removed: [nick],
        added: [],
        bufferId
      });
    }
    case 'nicklist_nick_added': {
      return actions.nicklistUpdatedAction({
        removed: [],
        added: [nick],
        bufferId
      });
    }
  }
}

NickAction.from_response = function (response: unknown) {
  if (!isNickResponse(response)) return;

  return NickAction(response);
};
