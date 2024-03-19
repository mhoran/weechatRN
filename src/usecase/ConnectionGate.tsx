import { useEffect } from 'react';
import { connect, useStore } from 'react-redux';
import { ConnectionError } from '../lib/weechat/connection';
import { StoreState } from '../store';
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
  const store = useStore<StoreState>();

  useEffect(() => {
    const connectionSettings = store.getState().connection;
    if (connectionSettings.hostname && connectionSettings.password) {
      onConnect(
        connectionSettings.hostname,
        connectionSettings.password,
        connectionSettings.ssl
      );
    }
  }, [onConnect, store]);

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
