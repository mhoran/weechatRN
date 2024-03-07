import { connect } from 'react-redux';
import { StoreState } from '../store';
import { ConnectionError } from '../lib/weechat/connection';
import SettingsNavigator from './settings/SettingsNavigator';

interface Props {
  connecting: boolean;
  connected: boolean;
  onConnect: (hostname: string, password: string, ssl: boolean) => void;
  children: React.ReactNode;
  connectionError: ConnectionError | null;
}

const ConnectionGate: React.FC<Props> = ({
  connecting,
  connected,
  children,
  onConnect,
  connectionError
}) => {
  if (connected) {
    return children;
  } else {
    return (
      <SettingsNavigator
        connecting={connecting}
        connectionError={connectionError}
        onConnect={onConnect}
      />
    );
  }
};

export default connect((state: StoreState) => ({
  connected: state.app.connected
}))(ConnectionGate);
