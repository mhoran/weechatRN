import * as React from "react";
import { connect } from "react-redux";
import LoginForm from "./login/LoginForm";

interface Props {
  connecting: boolean;
  connected: boolean;
  onConnect: (hostname: string, password: string) => void;
}

class ConnectionGate extends React.Component<Props> {
  render() {
    const { connecting, connected, children, onConnect } = this.props;
    if (connected) {
      return children;
    } else {
      return <LoginForm connecting={connecting} onConnect={onConnect} />;
    }
  }
}

export default connect(state => ({
  connected: state.app.connected
}))(ConnectionGate);
