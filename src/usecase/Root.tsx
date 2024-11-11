import * as React from 'react';
import { AppState, StatusBar } from 'react-native';
import { Provider } from 'react-redux';

import WeechatConnection, { ConnectionError } from '../lib/weechat/connection';
import { AppDispatch, StoreState, store } from '../store';

import { UnsubscribeListener, addListener } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getPushNotificationStatusAsync } from '../lib/helpers/push-notifications';
import {
  fetchScriptsAction,
  pendingBufferNotificationAction,
  upgradeAction
} from '../store/actions';
import App from './App';
import Buffer from './buffers/ui/Buffer';
import ConnectionGate from './ConnectionGate';
import PersistGate from './PersistGate';
import { PendingBufferNotificationListener } from '../store/listeners';

interface State {
  connecting: boolean;
  connectionError: ConnectionError | null;
}

export interface RelayClient {
  isConnected: () => boolean;
  ping: () => void;
}

export default class WeechatNative extends React.Component<null, State> {
  static RelayClient = class implements RelayClient {
    parent: WeechatNative;

    constructor(parent: WeechatNative) {
      this.parent = parent;
    }

    isConnected = () => this.parent.connection?.isConnected() || false;
    ping = () => this.parent.connection?.send('ping');
  };

  state: State = {
    connecting: false,
    connectionError: null
  };

  connectOnResume = true;

  connection?: WeechatConnection;

  client = new WeechatNative.RelayClient(this);

  appStateListener = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      this.onResume();
    }
  });

  responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const request = response.notification.request;
      const { bufferId, lineId } = request.content.data;

      if (!bufferId || !lineId) return;

      store.dispatch(
        pendingBufferNotificationAction({
          identifier: request.identifier,
          bufferId: Number(bufferId),
          lineId: Number(lineId)
        })
      );
    }
  );

  unsubscribeUpgradeListener: UnsubscribeListener;
  unsubscribeFetchScriptsListener: UnsubscribeListener;
  unsubscribePendingBufferNotificationListener: UnsubscribeListener;

  constructor(props: null) {
    super(props);
    this.unsubscribeUpgradeListener = store.dispatch(
      addListener({
        actionCreator: upgradeAction,
        effect: () => {
          this.disconnect();
        }
      })
    );
    this.unsubscribeFetchScriptsListener = store.dispatch(
      addListener({
        actionCreator: fetchScriptsAction,
        effect: (scripts) => {
          if (scripts.payload.includes('WeechatRN'))
            this.setNotificationToken();
        }
      })
    );
    this.unsubscribePendingBufferNotificationListener = store.dispatch(
      addListener.withTypes<StoreState, AppDispatch>()(
        PendingBufferNotificationListener(this.client)
      )
    );
  }

  componentWillUnmount(): void {
    this.connection?.disconnect();
    this.appStateListener.remove();
    this.unsubscribeUpgradeListener();
    this.unsubscribeFetchScriptsListener();
    this.responseListener.remove();
    this.unsubscribePendingBufferNotificationListener();
  }

  onBeforeLift = (): void => {
    const { hostname, password, ssl } = store.getState().connection;
    if (hostname && password) this.onConnect(hostname, password, ssl);
  };

  setNotificationToken = async (): Promise<void> => {
    const token = await getPushNotificationStatusAsync();
    if (token) this.sendMessageToBuffer('core.weechat', '/weechatrn ' + token);
  };

  onConnectionSuccess = (connection: WeechatConnection): void => {
    this.connectOnResume = true;
    this.setState({ connecting: false });
    connection.send('(hotlist) hdata hotlist:gui_hotlist(*)');
    connection.send(
      '(buffers) hdata buffer:gui_buffers(*) id,local_variables,notify,number,full_name,short_name,title,hidden,type'
    );
    connection.send('(scripts) hdata python_script:scripts(*) name');
    connection.send('sync');
  };

  onConnectionError = (
    reconnect: boolean,
    connectionError: ConnectionError | null
  ): void => {
    this.setState({
      connecting: reconnect,
      connectionError: reconnect ? null : connectionError
    });
  };

  disconnect = (): void => {
    this.connectOnResume = false;
    this.connection && this.connection.disconnect();
  };

  onConnect = (hostname: string, password: string, ssl: boolean): void => {
    this.setState({ connecting: true, connectionError: null });
    this.connection = new WeechatConnection(
      store.dispatch,
      hostname,
      password,
      ssl,
      this.onConnectionSuccess,
      this.onConnectionError
    );
    this.connection.connect();
  };

  onResume = () => {
    if (this.connectOnResume && this.connection?.isDisconnected()) {
      this.setState({ connecting: true, connectionError: null });
      this.connection.connect();
    }
  };

  fetchBufferInfo = (
    bufferId: string,
    numLines = Buffer.DEFAULT_LINE_INCREMENT
  ): void => {
    if (this.connection) {
      this.connection.send(
        `(last_read_lines) hdata buffer:0x${bufferId}/own_lines/last_read_line/data buffer`
      );
      this.connection.send(
        `(lines) hdata buffer:0x${bufferId}/own_lines/last_line(-${numLines})/data`
      );
      this.connection.send(`(nicklist) nicklist 0x${bufferId}`);
    }
  };

  sendMessageToBuffer = (bufferIdOrFullName: string, message: string): void => {
    this.connection &&
      this.connection.send(`(input) input ${bufferIdOrFullName} ${message}`);
  };

  clearHotlistForBuffer = (currentBufferId: string | null): void => {
    if (currentBufferId) {
      this.sendMessageToBuffer(
        `0x${currentBufferId}`,
        '/buffer set hotlist -1'
      );
      this.sendMessageToBuffer(
        `0x${currentBufferId}`,
        '/input set_unread_current_buffer'
      );
    }
  };

  render() {
    const { connecting, connectionError } = this.state;

    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <PersistGate loading={null} onBeforeLift={this.onBeforeLift}>
            <GestureHandlerRootView>
              <ConnectionGate
                connecting={connecting}
                connectionError={connectionError}
                onConnect={this.onConnect}
              >
                <StatusBar barStyle="light-content" />
                <App
                  disconnect={this.disconnect}
                  clearHotlistForBuffer={this.clearHotlistForBuffer}
                  sendMessageToBuffer={this.sendMessageToBuffer}
                  fetchBufferInfo={this.fetchBufferInfo}
                />
              </ConnectionGate>
            </GestureHandlerRootView>
          </PersistGate>
        </SafeAreaProvider>
      </Provider>
    );
  }
}
