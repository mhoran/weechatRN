import * as actions from '../../../store/actions';

type UpgradeResponse = object;

function isUpgradeResponse(response: unknown): response is UpgradeResponse {
  return (
    response instanceof Object &&
    'event_name' in response &&
    response.event_name === 'upgrade'
  );
}

export default function UpgradeAction() {
  return actions.upgradeAction();
}

UpgradeAction.from_response = function (response: unknown) {
  if (!isUpgradeResponse(response)) return;

  return UpgradeAction();
};
