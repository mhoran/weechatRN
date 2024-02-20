export type LineState = { [key: string]: WeechatLine[] };

const initialState: LineState = {};

export default (
  state: LineState = initialState,
  action: { type: string; bufferId: string; payload: unknown }
): LineState => {
  switch (action.type) {
    case 'FETCH_LINES':
      return {
        ...state,
        [action.bufferId]: action.payload as WeechatLine[]
      };
    case 'BUFFER_CLOSED': {
      return Object.fromEntries(
        Object.entries(state).filter(
          ([bufferId]) => bufferId !== action.bufferId
        )
      );
    }
    case 'BUFFER_CLEARED': {
      return {
        ...state,
        [action.bufferId]: []
      };
    }
    case 'BUFFER_LINE_ADDED':
      return {
        ...state,
        [action.bufferId]: [
          action.payload as WeechatLine,
          ...(state[action.bufferId] || [])
        ]
      };
    default:
      return state;
  }
};
