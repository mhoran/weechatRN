export type ConnectionInfo = {
  hostname: string | null;
  password: string | null;
  ssl: boolean;
};

const initialState: ConnectionInfo = {
  hostname: null,
  password: null,
  ssl: false
};

export default (state: ConnectionInfo = initialState, action) => {
  switch (action.type) {
    case "SET_CONNECTION_INFO":
      return {
        hostname: action.hostname,
        password: action.password,
        ssl: action.ssl
      };
    case "CLEAR_CONNECTION_INFO":
      return initialState;
    default:
      return state;
  }
};
