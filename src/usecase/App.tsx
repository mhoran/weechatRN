import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Dimensions,
  Platform
} from "react-native";
import { connect } from "react-redux";
import * as _ from "lodash";

import DrawerLayout from 'react-native-drawer-layout-polyfill';

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
  fetchBufferInfo: (bufferId: string) => void;
  sendMessageToBuffer: (fullBufferName: string, message: string) => void;
  clearHotlistForBuffer: (fullBufferName: string) => void;
  dispatch: (any) => void;
}

interface State {
  showTopic: boolean;
  drawerWidth: number;
}

class App extends React.Component<Props, State> {
  drawer: DrawerLayout;

  drawerWidth = () => {
    /*
     * Default drawer width is screen width - header height
     * with a max width of 280 on mobile and 320 on tablet
     * https://material.io/guidelines/patterns/navigation-drawer.html
     */
    const { height, width } = Dimensions.get('window');
    const smallerAxisSize = Math.min(height, width);
    const isLandscape = width > height;
    const isTablet = smallerAxisSize >= 600;
    const appBarHeight = Platform.OS === 'ios' ? isLandscape ? 32 : 44 : 56;
    const maxWidth = isTablet ? 320 : 280;

    return Math.min(smallerAxisSize - appBarHeight, maxWidth);
  }

  state: State = {
    showTopic: false,
    drawerWidth: this.drawerWidth()
  };

  changeCurrentBuffer = (buffer: WeechatBuffer) => {
    const { currentBufferId, fetchBufferInfo } = this.props;

    this.drawer.closeDrawer();
    if (currentBufferId !== buffer.id) {
      this.props.dispatch({
        type: "CHANGE_CURRENT_BUFFER",
        bufferId: buffer.id
      });
      this.props.clearHotlistForBuffer(buffer.full_name);
      fetchBufferInfo(buffer.id);
    }
  };

  toggleShowTopic = () => {
    this.setState(state => ({
      showTopic: !state.showTopic
    }));
  };

  openDrawer = () => {
    this.drawer.openDrawer();
    Keyboard.dismiss();
  };

  sendMessage = (message: string) => {
    const { currentBuffer, sendMessageToBuffer } = this.props;

    sendMessageToBuffer(currentBuffer.full_name, message);
  };

  updateWidth = () => {
    if (this.state.drawerWidth !== this.drawerWidth()) {
      this.setState({ drawerWidth: this.drawerWidth() });
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this.updateWidth);

    const { currentBufferId, fetchBufferInfo } = this.props;
    if (currentBufferId) {
      fetchBufferInfo(currentBufferId);
    } else {
      this.drawer.openDrawer();
    }
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.updateWidth);
  }

  componentDidUpdate(prevProps: Props) {
    const { currentBufferId } = this.props;
    if (currentBufferId !== prevProps.currentBufferId && !currentBufferId) {
      this.drawer.openDrawer();
    }
  }

  render() {
    const {
      buffers,
      currentBufferId,
      currentBuffer,
      hasHighlights
    } = this.props;

    const { showTopic, drawerWidth } = this.state;

    const sidebar = () => (
      <BufferList
        buffers={_.orderBy(_.values(buffers), ["number"])}
        currentBufferId={currentBufferId}
        onSelectBuffer={this.changeCurrentBuffer}
      />
    );

    return (
      <View style={styles.container}>
        <DrawerLayout
          ref={ d => (this.drawer = d) }
          renderNavigationView={sidebar}
          keyboardDismissMode={'on-drag'}
          drawerWidth={drawerWidth}
          useNativeAnimations={true}>
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
              sendMessage={this.sendMessage}
              bufferId={currentBufferId}
            />
          </SafeAreaView>
        </DrawerLayout>
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
    currentBufferId: currentBuffer && currentBufferId,
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
