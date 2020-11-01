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
      return Object.fromEntries(Object.entries(state)
        .filter(([bufferId]) => bufferId !== action.bufferId));
    }
    default:
      return state;
  }
};
