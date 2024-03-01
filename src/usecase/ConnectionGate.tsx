import * as React from 'react';
import { connect } from 'react-redux';
import LoginForm from './login/LoginForm';
import { StoreState } from '../store';
import { ConnectionError } from '../lib/weechat/connection';

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
      <LoginForm
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
