import { omit } from "lodash";

export type NicklistState = { [key: string]: WeechatNicklist[] };

const initialState: NicklistState = {};

export default (state: NicklistState = initialState, action): NicklistState => {
  switch (action.type) {
    case "FETCH_NICKLIST":
      return {
        ...state,
        [action.bufferId]: action.payload
      };
    case "NICK_ADDED": {
      return {
        ...state,
        [action.bufferId]: [...(state[action.bufferId] || []), action.payload]
      };
    }
    case "NICK_REMOVED": {
      return {
        ...state,
        [action.bufferId]: (state[action.bufferId] || []).filter(
          nick => nick.name !== action.payload.name
        )
      };
    }
    case "BUFFER_CLOSED": {
      const newState = omit(state, action.bufferId);
      return newState;
    }
    default:
      return state;
  }
};
