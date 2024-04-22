import { ConnectionError } from '../lib/weechat/connection';
import { useAppSelector } from '../store/hooks';
import SettingsNavigator from './settings/SettingsNavigator';

interface Props {
  connecting: boolean;
  onConnect: (hostname: string, password: string, ssl: boolean) => void;
  children: React.ReactNode;
  connectionError: ConnectionError | null;
}

const ConnectionGate: React.FC<Props> = ({
  connecting,
  children,
  connectionError,
  ...props
}) => {
  const connected = useAppSelector((state) => state.app.connected);

  if (connected) {
    return children;
  } else {
    return (
      <SettingsNavigator
        connecting={connecting}
        connectionError={connectionError}
        onConnect={props.onConnect}
      />
    );
  }
};

export default ConnectionGate;
