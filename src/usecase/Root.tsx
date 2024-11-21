import { UnsubscribeListener, addListener } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import * as React from 'react';
import { AppState, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { getPushNotificationStatusAsync } from '../lib/helpers/push-notifications';
import RelayClient from '../lib/weechat/client';
import { ConnectionError } from '../lib/weechat/connection';
import { AppDispatch, StoreState, store } from '../store';
import * as actions from '../store/actions';
import { PendingBufferNotificationListener } from '../store/listeners';
import App from './App';
import ConnectionGate from './ConnectionGate';
import PersistGate from './PersistGate';

interface State {
  connecting: boolean;
  connectionError: ConnectionError | null;
}

export default class WeechatNative extends React.Component<null, State> {
  state: State = {
    connecting: false,
    connectionError: null
  };

  connectOnResume = true;

  appStateListener = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      this.onResume();
    }
  });

  responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const request = response.notification.request;
      const { bufferId, lineId } = request.content.data;

      if (bufferId === undefined || lineId === undefined) return;

      store.dispatch(
        actions.pendingBufferNotificationAction({
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
        actionCreator: actions.upgradeAction,
        effect: () => {
          this.disconnect();
        }
      })
    );
    this.unsubscribeFetchScriptsListener = store.dispatch(
      addListener({
        actionCreator: actions.fetchScriptsAction,
        effect: (scripts) => {
          if (scripts.payload.includes('WeechatRN'))
            void this.setNotificationToken();
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
    this.client.disconnect();
    this.appStateListener.remove();
    this.unsubscribeUpgradeListener();
    this.unsubscribeFetchScriptsListener();
    this.responseListener.remove();
    this.unsubscribePendingBufferNotificationListener();
  }

  setNotificationToken = async (): Promise<void> => {
    const token = await getPushNotificationStatusAsync();
    if (token)
      this.client.sendMessageToBuffer('core.weechat', '/weechatrn ' + token);
  };

  onConnectionSuccess = (): void => {
    this.connectOnResume = true;
    this.setState({ connecting: false });
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

  client = new RelayClient(
    store.dispatch,
    this.onConnectionSuccess,
    this.onConnectionError
  );

  onConnect = (hostname: string, password: string, ssl: boolean): void => {
    this.setState({ connecting: true, connectionError: null });
    this.client.connect(hostname, password, ssl);
  };

  onBeforeLift = (): void => {
    const { hostname, password, ssl } = store.getState().connection;
    if (hostname && password) this.onConnect(hostname, password, ssl);
  };

  disconnect = (): void => {
    this.connectOnResume = false;
    this.client.disconnect();
  };

  onResume = (): void => {
    if (this.connectOnResume && this.client.isDisconnected()) {
      this.setState({ connecting: true, connectionError: null });
      this.client.reconnect();
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
                <App disconnect={this.disconnect} client={this.client} />
              </ConnectionGate>
            </GestureHandlerRootView>
          </PersistGate>
        </SafeAreaProvider>
      </Provider>
    );
  }
}
