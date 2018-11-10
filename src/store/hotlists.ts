import { omit } from "lodash";
import { getHotlistForBufferId } from "./selectors";

export type HotListState = { [key: string]: Hotlist };

const initialState: HotListState = {};

export default (state: HotListState = initialState, action): HotListState => {
  switch (action.type) {
    case "FETCH_HOTLISTS":
      if (action.currentBufferId) {
          return omit(action.payload, currentBufferId);
      }

      return action.payload;
    case "CHANGE_CURRENT_BUFFER":
      return omit(state, action.bufferId);
    case "BUFFER_LINE_ADDED": {
      if (action.bufferId === action.currentBufferId) {
        return state;
      }

      const payload = action.payload as WeechatLine;
      const hotlist = {
        ...getHotlistForBufferId(state, action.bufferId)
      };

      const shouldNotify = (tag) => (
        tag != "irc_smart_filter" && tag != "notify_none"
      );
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
