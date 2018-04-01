import { connect } from "react-redux";

interface Props {
  connected: boolean;
  children: React.ReactChild;
}

const ConnectionGate = (props: Props) => {
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
