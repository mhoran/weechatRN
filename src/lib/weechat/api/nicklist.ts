import * as actions from '../../../store/actions';
import type { NicklistResponse } from './types';

function isNicklistResponse(response: unknown): response is NicklistResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'nick_group'
  );
}

export default function NicklistAction(response: NicklistResponse) {
  if (response.code !== 200) return;

  const bufferId = response.request?.match(/\/buffers\/(\d+)\/nicks/)?.[1];

  if (!bufferId) return;

  const nicks = response.body.groups.flatMap((group) => {
    return group.nicks.map((nicks) => {
      const { id, visible, parent_group_id, ...rest } = nicks;
      return {
        ...rest,
        id: String(id),
        visible: Number(visible),
        group: 0
      };
    });
  });

  return actions.fetchNicklistAction({
    bufferId,
    nicklist: nicks
  });
}

NicklistAction.from_response = function (response: unknown) {
  if (!isNicklistResponse(response)) return;

  return NicklistAction(response);
};
