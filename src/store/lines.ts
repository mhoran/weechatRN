import { omit } from "lodash";

export type LineState = { [key: string]: WeechatLine[] };

const initialState: LineState = {};

export default (state: LineState = initialState, action): LineState => {
  switch (action.type) {
    case "FETCH_LINES":
      return {
        ...state,
        [action.bufferId]: action.payload
      };
    case "BUFFER_CLOSED": {
      const newState = omit(state, action.bufferId);
      return newState;
    }
    case "BUFFER_LINE_ADDED":
      return {
        ...state,
        [action.bufferId]: [action.payload, ...(state[action.bufferId] || [])]
      };
    default:
      return state;
  }
};
