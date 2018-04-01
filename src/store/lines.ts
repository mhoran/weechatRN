export type LineState = { [key: string]: WeechatLine };

const initialState: LineState = {};

export default (state: LineState = initialState, action): LineState => {
  switch (action.type) {
    case "FETCH_LINES":
      return {
        ...state,
        [action.bufferId]: action.payload
      };
    default:
      return state;
  }
};
