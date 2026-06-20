import * as actions from '../../../store/actions';

interface PongResponse {
  code: number;
  request: string;
}

function isPongResponse(response: unknown): response is PongResponse {
  return (
    response instanceof Object &&
    'request' in response &&
    response.request === 'POST /api/ping'
  );
}

export default function PongAction() {
  return actions.pongAction();
}

PongAction.from_response = function (response: unknown) {
  if (!isPongResponse(response)) return;

  return PongAction();
};
