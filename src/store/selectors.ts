import { HotListState } from './hotlists';

const createEmptyHotlist = (bufferId: string) => ({
  buffer: bufferId,
  count: [0, 0, 0, 0],
  message: 0,
  privmsg: 0,
  highlight: 0,
  sum: 0
});

export const getHotlistForBufferId = (
  state: HotListState,
  bufferId: string
): Hotlist => {
  if (bufferId && state[bufferId]) {
    return state[bufferId];
  } else {
    return createEmptyHotlist(bufferId);
  }
};
