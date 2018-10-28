import { omit } from "lodash";

export type BufferState = { [key: string]: WeechatBuffer };

const initialState: BufferState = {};

export default (state: BufferState = initialState, action): BufferState => {
  switch (action.type) {
    case "FETCH_BUFFERS": {
      return action.payload;
    }
    case "BUFFER_CLOSED": {
      return omit(state, action.bufferId);
    }
    case "BUFFER_OPENED": {
      return {
        ...state,
        [action.bufferId]: action.payload
      };
    }
    case "BUFFER_LOCALVAR_UPDATE": {
      return {
        ...state,
        [action.bufferId]: {
          ...state[action.bufferId],
          local_variables: {
            ...state[action.bufferId].local_variables,
            ...action.payload.local_variables
          }
        }
      };
    }
    case "BUFFER_LOCALVAR_REMOVE": {
      if (state[action.bufferId]) {
        return {
          ...state,
          [action.bufferId]: {
            ...state[action.bufferId],
            local_variables: {
              ...action.payload.local_variables
            }
          }
        };
      } else {
        return state;
      }
    }
    case "BUFFER_RENAMED": {
      return {
        ...state,
        [action.bufferId]: {
          ...state[action.bufferId],
          full_name: action.payload.full_name,
          short_name: action.payload.short_name
        }
      };
    }
    default:
      return state;
  }
};
