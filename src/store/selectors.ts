import { StoreState } from ".";

const createEmptyHotlist = (bufferId: string) => ({
  buffer: bufferId,
  count: [0, 0, 0, 0],
  message: 0,
  privmsg: 0,
  highlight: 0,
  sum: 0
});

export const getHotlistForBufferId = (
  state: StoreState,
  bufferId: string
): Hotlist => {
  if (bufferId && state.hotlists[bufferId]) {
    return state.hotlists[bufferId];
  } else {
    return createEmptyHotlist(bufferId);
  }
};
