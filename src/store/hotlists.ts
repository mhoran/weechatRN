import { AnyAction } from 'redux';
import { getHotlistForBufferId } from './selectors';

export type HotListState = { [key: string]: Hotlist };

const initialState: HotListState = {};

export default (
  state: HotListState = initialState,
  action: AnyAction
): HotListState => {
  switch (action.type) {
    case 'FETCH_HOTLISTS':
      if (action.currentBufferId) {
        const { [action.currentBufferId]: _, ...rest } = action.payload as HotListState;
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
        tag !== 'irc_smart_filter' && tag !== 'notify_none';
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
    case 'BUFFER_CLOSED': {
      const { [action.bufferId]: _, ...rest } = state;
      return rest;
    }
    case 'FETCH_BUFFERS_REMOVED': {
      return Object.fromEntries(
        Object.entries(state).filter(
          ([bufferId]) => !(action.payload as string[]).includes(bufferId)
        )
      );
    }
    default:
      return state;
  }
};
