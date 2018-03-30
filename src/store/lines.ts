type LinesState = { [key: string]: WeechatLine };

const initialState: LinesState = {};

export default (state: LinesState = initialState, action): LinesState => {
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
