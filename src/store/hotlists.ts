import { omit } from "lodash";

export type HotListState = { [key: string]: Hotlist };

const initialState: HotListState = {};

export default (state: HotListState = initialState, action): HotListState => {
  switch (action.type) {
    case "FETCH_HOTLISTS":
      return action.payload;
    default:
      return state;
  }
};
