export type BufferState = { [key: string]: WeechatBuffer };

const initialState: BufferState = {};

export default (
  state: BufferState = initialState,
  action: { type: string; bufferId: string; payload: unknown }
): BufferState => {
  switch (action.type) {
    case 'FETCH_BUFFERS': {
      return action.payload as BufferState;
    }
    case 'BUFFER_CLOSED': {
      const { [action.bufferId]: _, ...rest } = state;
      return rest;
    }
    case 'BUFFER_OPENED': {
      return {
        ...state,
        [action.bufferId]: action.payload as WeechatBuffer
      };
    }
    case 'BUFFER_LOCALVAR_UPDATE': {
      return {
        ...state,
        [action.bufferId]: {
          ...state[action.bufferId],
          local_variables: {
            ...state[action.bufferId].local_variables,
            ...(action.payload as WeechatBuffer).local_variables
          }
        }
      };
    }
    case 'BUFFER_LOCALVAR_REMOVE': {
      if (state[action.bufferId]) {
        return {
          ...state,
          [action.bufferId]: {
            ...state[action.bufferId],
            local_variables: {
              ...(action.payload as WeechatBuffer).local_variables
            }
          }
        };
      } else {
        return state;
      }
    }
    case 'BUFFER_RENAMED': {
      return {
        ...state,
        [action.bufferId]: {
          ...state[action.bufferId],
          full_name: (action.payload as WeechatBuffer).full_name,
          short_name: (action.payload as WeechatBuffer).short_name
        }
      };
    }
    default:
      return state;
  }
};
