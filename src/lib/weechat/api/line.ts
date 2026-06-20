import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { StoreState } from '../../../store';
import * as actions from '../../../store/actions';
import type { LineResponse } from './types';

function isLineResponse(response: unknown): response is LineResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'line'
  );
}

export default function LineAction(response: LineResponse) {
  if (response.code !== 0) return;

  const { tags, highlight, displayed, ...line } = response.body;

  switch (response.event_name) {
    case 'buffer_line_added': {
      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const state: StoreState = getState();

        dispatch(
          actions.bufferLineAddedAction({
            currentBufferId: state.app.currentBufferId,
            line: {
              ...line,
              tags_array: tags,
              highlight: Number(highlight),
              displayed: Number(displayed),
              buffer: String(response.buffer_id)
            }
          })
        );
      };
    }
    case 'buffer_line_data_changed': {
      if (line.id === undefined) return;

      return actions.bufferLineDataChangedAction({
        ...line,
        tags_array: tags,
        highlight: Number(highlight),
        displayed: Number(displayed),
        buffer: String(response.buffer_id)
      });
    }
  }
}

LineAction.from_response = function (response: unknown) {
  if (!isLineResponse(response)) return;

  return LineAction(response);
};
