import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Keyboard
} from "react-native";
import { connect } from "react-redux";
import * as _ from "lodash";

import Drawer from "react-native-drawer";

import { changeCurrentBuffer } from "./buffers/actions/BufferActions";

import BufferContainer from "./buffers/ui/BufferContainer";
import BufferList from "./buffers/ui/BufferList";
import { StoreState } from "../store";
import { renderWeechatFormat } from "../lib/weechat/color-formatter";

interface Props {
  buffers: { [key: string]: WeechatBuffer };
  currentBufferId: string | null;
  currentBuffer: WeechatBuffer | null;
  hasHighlights: boolean;
  disconnect: () => void;
  fetchLinesForBuffer: (bufferId: string) => void;
  sendMessageToBuffer: (fullBufferName: string, message: string) => void;
  clearHotlistForBuffer: (fullBufferName: string) => void;
  dispatch: (any) => void;
}

interface State {
  showTopic: boolean;
}

class App extends React.Component<Props, State> {
  drawer: Drawer;

  state: State = {
    showTopic: false
  };

  changeCurrentBuffer = (buffer: WeechatBuffer) => {
    const { currentBufferId, fetchLinesForBuffer } = this.props;

    this.drawer.close();
    if (currentBufferId !== buffer.id) {
      this.props.dispatch({
        type: "CHANGE_CURRENT_BUFFER",
        bufferId: buffer.id
      });
      this.props.clearHotlistForBuffer(buffer.full_name);
      fetchLinesForBuffer(buffer.id);
    }
  };

  toggleShowTopic = () => {
    this.setState(state => ({
      showTopic: !state.showTopic
    }));
  };

  openDrawer = () => {
    this.drawer.open();
    Keyboard.dismiss();
  };

  sendMessage = (message: string) => {
    const { currentBuffer, sendMessageToBuffer } = this.props;

    sendMessageToBuffer(currentBuffer.full_name, message);
  };

  render() {
    const {
      buffers,
      currentBufferId,
      currentBuffer,
      fetchLinesForBuffer,
      hasHighlights
    } = this.props;

    const { showTopic } = this.state;

    const sidebar = (
      <BufferList
        buffers={_.orderBy(_.values(buffers), ["number"])}
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
                  onPress={this.openDrawer}
                >
                  <Text
                    style={[
                      styles.channelsButtonText,
                      hasHighlights && {
                        color: "#ffcf7f"
                      }
                    ]}
                  >
                    #
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={this.toggleShowTopic}>
                <Text style={styles.topbarText}>
                  {currentBuffer && currentBuffer.short_name}
                </Text>
              </TouchableOpacity>
              <View style={styles.channels}>
                <TouchableOpacity
                  style={styles.channelsButton}
                  onPress={this.props.disconnect}
                >
                  <Image source={require("./icons/eject.png")} />
                </TouchableOpacity>
              </View>
            </View>
            <BufferContainer
              showTopic={showTopic}
              buffer={currentBuffer}
              sendMessage={this.sendMessage}
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

  const numHighlights = _.values(state.hotlists).reduce(
    (sum, hlist) => sum + hlist.highlight,
    0
  );

  return {
    buffers: state.buffers,
    currentBufferId,
    currentBuffer,
    hasHighlights: numHighlights > 0
  };
})(App);

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    backgroundColor: "#333",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10
  },
  channels: {
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
