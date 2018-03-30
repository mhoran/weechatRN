import { connect } from "react-redux";

const ConnectionGate = props => {
  console.log("connection gate", props.connected);
  if (props.connected) {
    return props.children;
  } else {
    return null;
  }
};

export default connect(state => ({
  connected: state.app.connected
}))(ConnectionGate);
