import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { connect } from "react-redux";
import * as _ from "lodash";

import Drawer from "react-native-drawer";

import { changeCurrentBuffer } from "./buffers/actions/BufferActions";

import BufferView from "./buffers/ui/BufferView";
import BufferList from "./buffers/ui/BufferList";

interface Props {
  buffers: WeechatBuffer[];
  currentBufferName: string;
  fetchLinesForBuffer: (string) => void;
}

interface State {
  currentBufferId: string | null;
}

class App extends React.Component<Props, State> {
  drawer: Drawer;

  state: State = { currentBufferId: null };

  changeCurrentBuffer = buffer => {
    // this.props.dispatch(changeCurrentBuffer(bufferName));
    this.drawer.close();
    this.props.fetchLinesForBuffer(buffer.id);
    console.log(buffer, buffer.id);
    this.setState({
      currentBufferId: buffer.id
    });
  };
  render() {
    const { currentBufferId } = this.state;
    const { buffers, currentBufferName } = this.props;

    const sidebar = (
      <BufferList
        buffers={_.orderBy(buffers, ["number"])}
        currentBufferName={currentBufferName}
        onSelectBuffer={this.changeCurrentBuffer}
      />
    );

    console.log({ currentBufferId });

    return (
      <View style={styles.container}>
        <Drawer
          type="static"
          content={sidebar}
          panOpenMask={0.03}
          tapToClose={true}
          openDrawerOffset={100}
          captureGestures={true}
          ref={d => (this.drawer = d)}
          tweenHandler={Drawer.tweenPresets.parallax}
        >
          <View style={styles.topbar}>
            <View style={styles.channels}>
              <TouchableOpacity
                style={styles.channelsButton}
                onPress={() => this.drawer.open()}
              >
                <Text style={styles.channelsButtonText}>#</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.topbarText}>{currentBufferName}</Text>
            </View>
            <View style={styles.channels} />
          </View>
          <BufferView bufferId={currentBufferId} />
        </Drawer>
      </View>
    );
  }
}

export default connect(state => ({
  buffers: _.values(state.buffers)
}))(App);

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    paddingTop: 20,
    height: 70,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center"
  },
  channels: {
    flex: 1,
    paddingHorizontal: 5
  },
  channelsButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: 40
  },
  channelsButtonText: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Gill Sans",
    color: "#eee",
    fontWeight: "bold"
  },
  topbarText: {
    color: "#eee",
    fontFamily: "Thonburi",
    fontWeight: "bold",
    fontSize: 15
  },
  container: {
    flex: 1,
    backgroundColor: "#89a"
  }
});
