import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import type { EmitterSubscription } from 'react-native';
import {
  Dimensions,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import {
  SafeAreaInsetsContext,
  SafeAreaView
} from 'react-native-safe-area-context';
import type { ConnectedProps } from 'react-redux';
import { connect } from 'react-redux';
import type RelayClient from '../lib/weechat/client';
import type { StoreState } from '../store';
import * as actions from '../store/actions';
import BufferGate from './buffers/ui/BufferGate';
import BufferList from './buffers/ui/BufferList';
import NicklistModal from './buffers/ui/NicklistModal';
import type { RootStackParamList } from './Root';

const connector = connect((state: StoreState) => {
  const currentBufferId = state.app.currentBufferId;
  const currentBuffer = currentBufferId
    ? (state.buffers[currentBufferId] ?? null)
    : null;
  const numHighlights = Object.values(state.hotlists).reduce(
    (sum, hlist) => sum + hlist.highlight,
    0
  );

  return {
    currentBufferId,
    currentBuffer,
    hasHighlights: numHighlights > 0,
    notification: state.app.notification,
    connected: state.app.connected
  };
});

type PropsFromRedux = ConnectedProps<typeof connector>;

type NavigationProps = NativeStackScreenProps<RootStackParamList, 'App'>;

type Props = PropsFromRedux &
  NavigationProps & {
    connect: () => void;
    disconnect: () => void;
    client: RelayClient;
  };

interface State {
  showTopic: boolean;
  drawerWidth: number;
  drawerOpen: boolean;
  showNicklistModal: boolean;
}

class App extends React.PureComponent<Props, State> {
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
    drawerOpen: this.props.connected && !this.props.currentBufferId,
    showNicklistModal: false
  };

  changeCurrentBuffer = (buffer: WeechatBuffer | string) => {
    const { currentBufferId, dispatch, client } = this.props;
    const bufferId = typeof buffer === 'string' ? buffer : buffer.id;

    this.closeDrawer();
    if (currentBufferId !== bufferId) {
      dispatch(actions.changeCurrentBufferAction(bufferId));
      client.fetchBufferInfo(bufferId);
      client.clearHotlistForBuffer(bufferId);
    }
  };

  toggleShowTopic = () => {
    this.setState((state) => ({
      showTopic: !state.showTopic
    }));
  };

  toggleShowNicklistModal = () => {
    this.setState((state) => ({ showNicklistModal: !state.showNicklistModal }));
  };

  openDrawer = () => {
    this.setState({ drawerOpen: true });
    Keyboard.dismiss();
  };

  closeDrawer = () => {
    this.setState({ drawerOpen: false });
  };

  updateWidth = () => {
    if (this.state.drawerWidth !== this.drawerWidth()) {
      this.setState({ drawerWidth: this.drawerWidth() });
    }
  };

  openSettings = () => this.props.navigation.navigate('Connection Settings');

  componentDidMount() {
    this.dimensionsListener = Dimensions.addEventListener(
      'change',
      this.updateWidth
    );
  }

  componentWillUnmount() {
    this.dimensionsListener?.remove();
  }

  componentDidUpdate(prevProps: Props) {
    const { currentBufferId, notification, connected, client } = this.props;

    if (
      notification &&
      notification.identifier !== prevProps.notification?.identifier
    ) {
      this.changeCurrentBuffer(notification.bufferId);

      return;
    }

    if (connected && connected !== prevProps.connected) {
      if (currentBufferId) {
        client.fetchBufferInfo(currentBufferId);
        client.clearHotlistForBuffer(currentBufferId);
      } else {
        this.openDrawer();
      }
      return;
    }

    if (currentBufferId !== prevProps.currentBufferId && !currentBufferId) {
      this.openDrawer();
    }
  }

  render() {
    const {
      currentBufferId,
      currentBuffer,
      hasHighlights,
      client,
      connected,
      connect,
      disconnect
    } = this.props;

    const { showTopic, drawerWidth, showNicklistModal } = this.state;

    const sidebar = () => (
      <BufferList
        currentBufferId={currentBufferId}
        onSelectBuffer={this.changeCurrentBuffer}
      />
    );

    return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <View style={styles.container}>
            <Drawer
              open={this.state.drawerOpen}
              renderDrawerContent={sidebar}
              keyboardDismissMode={'on-drag'}
              drawerStyle={{
                width: drawerWidth + (insets?.left ?? 0),
                backgroundColor: '#121212',
                paddingTop: insets?.top,
                paddingBottom: insets?.bottom,
                paddingLeft: insets?.left
              }}
              onOpen={this.openDrawer}
              onClose={this.closeDrawer}
              swipeEdgeWidth={60}
              drawerPosition={'left'}
              drawerType="slide"
            >
              <SafeAreaView
                style={[styles.container]}
                edges={['right', 'bottom', 'left']}
              >
                <StatusBar
                  barStyle="light-content"
                  backgroundColor="transparent"
                  translucent={true}
                />

                <NicklistModal
                  bufferId={currentBufferId}
                  visible={showNicklistModal}
                  close={this.toggleShowNicklistModal}
                />

                <View style={[styles.topbar, { paddingTop: insets?.top }]}>
                  <View style={styles.channelsButtonWrapper}>
                    <TouchableOpacity
                      style={styles.topbarButton}
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

                  <View style={styles.topbarTextWrapper}>
                    <TouchableOpacity onPress={this.toggleShowTopic}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.topbarText]}
                      >
                        {currentBuffer && currentBuffer.short_name}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rightTopbarButtons}>
                    {currentBufferId && (
                      <TouchableOpacity
                        style={styles.topbarButton}
                        onPress={this.toggleShowNicklistModal}
                      >
                        <Feather name="users" size={22} color="white" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.topbarButton}
                      onPress={this.openSettings}
                    >
                      <MaterialCommunityIcons
                        name="account-wrench"
                        size={22}
                        color="white"
                      />
                    </TouchableOpacity>
                    {connected ? (
                      <TouchableOpacity
                        style={styles.topbarButton}
                        onPress={disconnect}
                      >
                        <MaterialCommunityIcons
                          name="lan-disconnect"
                          size={22}
                          color="white"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.topbarButton}
                        onPress={connect}
                      >
                        <MaterialCommunityIcons
                          name="lan-connect"
                          size={22}
                          color="white"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <BufferGate
                  bufferId={currentBufferId}
                  showTopic={showTopic}
                  client={client}
                />
              </SafeAreaView>
            </Drawer>
          </View>
        )}
      </SafeAreaInsetsContext.Consumer>
    );
  }
}

export default connector(App);

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    zIndex: 1
  },
  channelsButtonWrapper: {
    paddingLeft: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  topbarButton: {
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  channelsButtonText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#eee',
    fontWeight: 'bold'
  },
  topbarTextWrapper: {
    flex: 2,
    alignItems: 'center'
  },
  topbarText: {
    color: '#eee',
    fontWeight: 'bold',
    fontSize: 15
  },
  rightTopbarButtons: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 10,
    flexDirection: 'row'
  },
  container: {
    flex: 1,
    backgroundColor: '#333'
  }
});
