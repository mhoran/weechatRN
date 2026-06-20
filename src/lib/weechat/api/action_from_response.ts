import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import type { StoreState } from '../../../store';
import BufferAction from './buffer';
import BuffersAction from './buffers';
import LineAction from './line';
import LinesAction from './lines';
import VersionAction from './version';
import PongAction from './pong';
import ScriptsAction from './scripts';
import HotlistAction from './hotlist';
import NicklistAction from './nicklist';
import NickAction from './nick';
import UpgradeAction from './upgrade';

export default function actionFromResponse(
  response: unknown
):
  | UnknownAction
  | ThunkAction<void, StoreState, undefined, UnknownAction>
  | undefined {
  const action_creators = [
    VersionAction,
    PongAction,
    BuffersAction,
    BufferAction,
    LinesAction,
    LineAction,
    HotlistAction,
    NicklistAction,
    NickAction,
    ScriptsAction,
    UpgradeAction
  ];
  for (const action_creator of action_creators) {
    const action = action_creator.from_response(response);
    if (action) return action;
  }
}
