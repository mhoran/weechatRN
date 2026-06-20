import * as actions from '../../../store/actions';

interface ScriptsResponse {
  code: number;
  body: { name: string }[];
}

function isScriptsResponse(response: unknown): response is ScriptsResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'scripts'
  );
}

export default function ScriptsAction(response: ScriptsResponse) {
  if (response.code !== 200) return;

  return actions.fetchScriptsAction(response.body.map(({ name }) => name));
}

ScriptsAction.from_response = function (response: unknown) {
  if (!isScriptsResponse(response)) return;

  return ScriptsAction(response);
};
