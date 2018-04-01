import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import * as _ from "lodash";

import Drawer from "react-native-drawer";

import { changeCurrentBuffer } from "./buffers/actions/BufferActions";

import BufferContainer from "./buffers/ui/BufferContainer";
import BufferList from "./buffers/ui/BufferList";
import { StoreState } from "../store";

interface Props {
  buffers: WeechatBuffer[];
  currentBufferId: string | null;
  currentBuffer: WeechatBuffer | null;
  fetchLinesForBuffer: (string) => void;
  dispatch: (any) => void;
}

class App extends React.Component<Props> {
  drawer: Drawer;

  changeCurrentBuffer = buffer => {
    const { currentBufferId, fetchLinesForBuffer } = this.props;

    this.drawer.close();
    if (currentBufferId !== buffer.id) {
      this.props.dispatch({
        type: "CHANGE_CURRENT_BUFFER",
        bufferId: buffer.id
      });
      fetchLinesForBuffer(buffer.id);
    }
  };
  render() {
    const {
      buffers,
      currentBufferId,
      currentBuffer,
      fetchLinesForBuffer
    } = this.props;

    const sidebar = (
      <BufferList
        buffers={_.orderBy(buffers, ["number"])}
        currentBufferId={currentBufferId}
        onSelectBuffer={this.changeCurrentBuffer}
      />
    );

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
          <SafeAreaView style={styles.container}>
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
                <Text style={styles.topbarText}>
                  {currentBuffer && currentBuffer.short_name}
                </Text>
              </View>
              <View style={styles.channels} />
            </View>
            <BufferContainer
              fetchLinesForBuffer={fetchLinesForBuffer}
              bufferId={currentBufferId}
            />
          </SafeAreaView>
        </Drawer>
      </View>
    );
  }
}

export default connect((state: StoreState) => {
  const currentBufferId = state.app.currentBufferId;
  const currentBuffer = currentBufferId && state.buffers[currentBufferId];

  return {
    buffers: _.values(state.buffers),
    currentBufferId,
    currentBuffer
  };
})(App);

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10
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
    backgroundColor: "#333"
  }
});
