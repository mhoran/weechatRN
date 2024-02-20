import { getHotlistForBufferId } from './selectors';

export type HotListState = { [key: string]: Hotlist };

const initialState: HotListState = {};

export default (
  state: HotListState = initialState,
  action: {
    type: string;
    currentBufferId: string;
    payload: unknown;
    bufferId: string;
  }
): HotListState => {
  switch (action.type) {
    case 'FETCH_HOTLISTS':
      if (action.currentBufferId) {
        return Object.fromEntries(
          Object.entries(<HotListState>action.payload).filter(
            ([bufferId]) => bufferId !== action.currentBufferId
          )
        );
      }

      return action.payload as HotListState;
    case 'CHANGE_CURRENT_BUFFER':
      return Object.fromEntries(
        Object.entries(state).filter(
          ([bufferId]) => bufferId !== action.bufferId
        )
      );
    case 'BUFFER_LINE_ADDED': {
      if (action.bufferId === action.currentBufferId) {
        return state;
      }

      const payload = action.payload as WeechatLine;
      const hotlist = {
        ...getHotlistForBufferId(state, action.bufferId)
      };

      const shouldNotify = (tag: string) =>
        tag != 'irc_smart_filter' && tag != 'notify_none';
      if (payload.tags_array.every(shouldNotify)) {
        if (payload.highlight !== 0) {
          hotlist.highlight++;
        }
        hotlist.sum++;
      }

      return {
        ...state,
        [action.bufferId]: hotlist
      };
    }
    default:
      return state;
  }
};
