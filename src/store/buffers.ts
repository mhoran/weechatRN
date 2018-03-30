type BufferState = { [key: string]: WeechatBuffer };

const initialState: BufferState = {};

export default (state: BufferState = initialState, action): BufferState => {
  switch (action.type) {
    case "FETCH_BUFFERS":
      return action.payload;
    default:
      return state;
  }
};
