import * as actions from '../../../store/actions';
import { reduceToObjectByKey } from '../action_transformer';
import type { BuffersResponse } from './types';

function isBuffersResponse(response: unknown): response is BuffersResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'buffers'
  );
}

export default function BuffersAction(response: BuffersResponse) {
  if (response.code !== 200) return;

  const newBuffers = reduceToObjectByKey(
    response.body,
    (buffer) => String(buffer.id),
    (buf) => {
      const { id, last_read_line_id, name, ...rest } = buf;

      return {
        ...rest,
        id: String(id),
        _id: String(id),
        full_name: name
      };
    }
  );

  return actions.fetchBuffersAction(newBuffers);
}

BuffersAction.from_response = function (response: unknown) {
  if (!isBuffersResponse(response)) return;

  return BuffersAction(response);
};
