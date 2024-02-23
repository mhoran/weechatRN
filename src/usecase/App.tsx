import * as React from 'react';
import {
  Dimensions,
  EmitterSubscription,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaInsetsContext
} from 'react-native-safe-area-context';
import { ConnectedProps, connect } from 'react-redux';

import { registerForPushNotificationsAsync } from '../lib/helpers/push-notifications';
import { StoreState } from '../store';
import BufferGate from './buffers/ui/BufferGate';
import BufferList from './buffers/ui/BufferList';

const connector = connect((state: StoreState) => {
  const currentBufferId = state.app.currentBufferId;
  const currentBuffer =
    (currentBufferId && state.buffers[currentBufferId]) || null;

  const numHighlights = Object.values(state.hotlists).reduce(
    (sum, hlist) => sum + hlist.highlight,
    0
  );

  return {
    buffers: state.buffers,
    currentBufferId: currentBuffer && currentBufferId,
    currentBuffer,
    hasHighlights: numHighlights > 0
  };
});

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  disconnect: () => void;
  fetchBufferInfo: (bufferId: string, numLines?: number) => void;
  sendMessageToBuffer: (fullBufferName: string, message: string) => void;
  clearHotlistForBuffer: (fullBufferName: string) => void;
};

interface State {
  showTopic: boolean;
  drawerWidth: number;
  drawerOpen: boolean;
}

class App extends React.Component<Props, State> {
  dimensionsListener: EmitterSubscription | undefined;

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
    const appBarHeight = Platform.OS === 'ios' ? (isLandscape ? 32 : 44) : 56;
    const maxWidth = isTablet ? 320 : 280;

    return Math.min(smallerAxisSize - appBarHeight, maxWidth);
  };

  state: State = {
    showTopic: false,
    drawerWidth: this.drawerWidth(),
    drawerOpen: !this.props.currentBufferId
  };

  changeCurrentBuffer = (buffer: WeechatBuffer) => {
    const { currentBufferId, fetchBufferInfo } = this.props;

    this.closeDrawer();
    if (currentBufferId !== buffer.id) {
      this.props.dispatch({
        type: 'CHANGE_CURRENT_BUFFER',
        bufferId: buffer.id
      });
      this.props.clearHotlistForBuffer(buffer.full_name);
      fetchBufferInfo(buffer.id);
    }
  };

  toggleShowTopic = () => {
    this.setState((state) => ({
      showTopic: !state.showTopic
    }));
  };

  openDrawer = () => {
    this.setState(() => ({ drawerOpen: true }));
    Keyboard.dismiss();
  };

  closeDrawer = () => {
    this.setState(() => ({ drawerOpen: false }));
  };

  sendMessage = (message: string) => {
    const { currentBuffer, sendMessageToBuffer } = this.props;

    if (!currentBuffer) return;
    sendMessageToBuffer(currentBuffer.full_name, message);
  };

  updateWidth = () => {
    if (this.state.drawerWidth !== this.drawerWidth()) {
      this.setState({ drawerWidth: this.drawerWidth() });
    }
  };

  componentDidMount() {
    this.dimensionsListener = Dimensions.addEventListener(
      'change',
      this.updateWidth
    );

    const { currentBufferId, fetchBufferInfo } = this.props;
    if (currentBufferId) {
      fetchBufferInfo(currentBufferId);
    }

    registerForPushNotificationsAsync();
  }

  componentWillUnmount() {
    this.dimensionsListener?.remove();
  }

  componentDidUpdate(prevProps: Props) {
    const { currentBufferId } = this.props;
    if (currentBufferId !== prevProps.currentBufferId && !currentBufferId) {
      this.openDrawer();
    }
  }

  render() {
    const { buffers, currentBufferId, currentBuffer, hasHighlights } =
      this.props;

    const { showTopic, drawerWidth } = this.state;

    const sidebar = () => (
      <BufferList
        buffers={Object.values(buffers).sort((a, b) => a.number - b.number)}
        currentBufferId={currentBufferId}
        onSelectBuffer={this.changeCurrentBuffer}
      />
    );

    return (
      <SafeAreaProvider>
        <SafeAreaInsetsContext.Consumer>
          {(insets) => (
            <View style={styles.container}>
              <Drawer
                open={this.state.drawerOpen}
                renderDrawerContent={sidebar}
                keyboardDismissMode={'on-drag'}
                drawerStyle={{
                  width: drawerWidth + (insets?.left || 0),
                  backgroundColor: '#121212',
                  paddingTop: insets?.top,
                  paddingBottom: insets?.bottom,
                  paddingLeft: insets?.left
                }}
                onOpen={this.openDrawer}
                onClose={this.closeDrawer}
                swipeEdgeWidth={60}
                drawerPosition={'left'}
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
                              color: '#ffcf7f'
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
                        <Image source={require('./icons/eject.png')} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <BufferGate
                    showTopic={showTopic}
                    sendMessage={this.sendMessage}
                    bufferId={currentBufferId}
                    fetchMoreLines={(lines: number) => {
                      currentBufferId &&
                        this.props.fetchBufferInfo(currentBufferId, lines);
                    }}
                  />
                </SafeAreaView>
              </Drawer>
            </View>
          )}
        </SafeAreaInsetsContext.Consumer>
      </SafeAreaProvider>
    );
  }
}

export default connector(App);

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    backgroundColor: '#333',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Gill Sans',
    color: '#eee',
    fontWeight: 'bold'
  },
  topbarText: {
    color: '#eee',
    fontFamily: 'Thonburi',
    fontWeight: 'bold',
    fontSize: 15
  },
  container: {
    flex: 1,
    backgroundColor: '#333'
  }
});
