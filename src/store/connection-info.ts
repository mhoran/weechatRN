export type ConnectionInfo = {
  hostname: string | null;
  password: string | null;
  ssl: boolean;
  filterBuffers: boolean;
};

const initialState: ConnectionInfo = {
  hostname: null,
  password: null,
  ssl: true,
  filterBuffers: true
};

export default (
  state: ConnectionInfo = initialState,
  action: {
    type: string;
    hostname: string;
    password: string;
    ssl: boolean;
    filterBuffers: boolean;
  }
): ConnectionInfo => {
  switch (action.type) {
    case 'SET_CONNECTION_INFO':
      return {
        hostname: action.hostname,
        password: action.password,
        ssl: action.ssl,
        filterBuffers: action.filterBuffers
      };
    case 'CLEAR_CONNECTION_INFO':
      return initialState;
    default:
      return state;
  }
};
