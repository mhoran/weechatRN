import * as React from "react";
import { connect } from "react-redux";
import LoginForm from "./login/LoginForm";
import { StoreState } from "../store";

interface Props {
  connecting: boolean;
  connected: boolean;
  onConnect: (hostname: string, password: string, ssl: boolean) => void;
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

export default connect((state: StoreState) => ({
  connected: state.app.connected
}))(ConnectionGate);
