import * as actions from '../../../store/actions';

interface VersionResponse {
  code: number;
  body_type: string;
  body: { weechat_version: string };
}

function isVersionResponse(response: unknown): response is VersionResponse {
  return (
    response instanceof Object &&
    'code' in response &&
    'body' in response &&
    'body_type' in response &&
    response.body_type === 'version'
  );
}

export default function VersionAction(response: VersionResponse) {
  if (response.code !== 200) return;

  return actions.fetchVersionAction(response.body.weechat_version);
}

VersionAction.from_response = function (response: unknown) {
  if (!isVersionResponse(response)) return;

  return VersionAction(response);
};
