import * as actions from '../../../store/actions';
import type { BufferResponse } from './types';

function isBufferResponse(response: unknown): response is BufferResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'buffer'
  );
}

export default function BufferAction(response: BufferResponse) {
  if (response.code === 200) {
    const { id, last_read_line_id, name, ...buffer } = response.body;

    return actions.bufferOpenedAction({
      ...buffer,
      id: String(id),
      _id: String(id),
      ...(last_read_line_id >= 0 && { last_read_line: last_read_line_id }),
      full_name: name
    });
  } else if (response.code !== 0) return;

  switch (response.event_name) {
    case 'buffer_cleared': {
      return actions.bufferClearedAction(String(response.buffer_id));
    }
    case 'buffer_closing': {
      return actions.bufferClosedAction(String(response.buffer_id));
    }
    case 'buffer_opened': {
      const { last_read_line_id, name, ...buffer } = response.body;

      return actions.bufferOpenedAction({
        ...buffer,
        id: String(response.buffer_id),
        _id: String(response.buffer_id),
        full_name: name
      });
    }
    case 'buffer_renamed': {
      return actions.bufferRenamedAction({
        id: String(response.buffer_id),
        short_name: response.body.short_name,
        full_name: response.body.name
      });
    }
    case 'buffer_moved':
    case 'buffer_merged':
    case 'buffer_unmerged': {
      return actions.bufferMovedAction({
        id: String(response.buffer_id),
        number: response.body.number
      });
    }
    case 'buffer_hidden': {
      return actions.bufferHiddenAction({
        id: String(response.buffer_id)
      });
    }
    case 'buffer_unhidden': {
      return actions.bufferUnhiddenAction({
        id: String(response.buffer_id)
      });
    }
    case 'buffer_localvar_removed':
    case 'buffer_localvar_changed':
    case 'buffer_localvar_added': {
      return actions.bufferLocalvarUpdateAction({
        id: String(response.buffer_id),
        local_variables: response.body.local_variables
      });
    }
    case 'buffer_title_changed': {
      return actions.bufferTitleChangedAction({
        id: String(response.buffer_id),
        title: response.body.title
      });
    }
  }
}

BufferAction.from_response = function (response: unknown) {
  if (!isBufferResponse(response)) return;

  return BufferAction(response);
};
