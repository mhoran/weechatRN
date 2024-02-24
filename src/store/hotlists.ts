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
        const { [action.currentBufferId]: _, ...rest } = <HotListState>(
          action.payload
        );
        return rest;
      }

      return action.payload as HotListState;
    case 'CHANGE_CURRENT_BUFFER': {
      const { [action.bufferId]: _, ...rest } = state;
      return rest;
    }
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
    case 'UPGRADE':
      return initialState;
    default:
      return state;
  }
};
