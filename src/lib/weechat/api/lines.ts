import * as actions from '../../../store/actions';
import type { LinesResponse } from './types';

function isLinesResponse(response: unknown): response is LinesResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'lines'
  );
}

export default function LinesAction(response: LinesResponse) {
  if (response.code !== 200) return;

  if (response.body.length === 0) return;

  const bufferId = response.request.match(/\/(\d+)\/lines/)?.[1];

  if (!bufferId) return;

  return actions.fetchLinesAction(
    response.body.reduceRight((lines, line) => {
      const { tags, ...rest } = line;

      return [
        ...lines,
        {
          ...rest,
          tags_array: line.tags,
          highlight: Number(line.highlight),
          displayed: Number(line.displayed),
          buffer: bufferId
        }
      ];
    }, [] as WeechatLine[])
  );
}

LinesAction.from_response = function (response: unknown) {
  if (!isLinesResponse(response)) return;

  return LinesAction(response);
};
