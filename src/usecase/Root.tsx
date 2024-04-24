import * as React from 'react';
import { AppState, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import WeechatConnection, { ConnectionError } from '../lib/weechat/connection';
import { AppDispatch, StoreState, persistor, store } from '../store';

import {
  TypedAddListener,
  UnsubscribeListener,
  addListener,
  createAction
} from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getPushNotificationStatusAsync } from '../lib/helpers/push-notifications';
import {
  bufferNotificationAction,
  fetchBuffersAction,
  fetchScriptsAction,
  upgradeAction
} from '../store/actions';
import App from './App';
import ConnectionGate from './ConnectionGate';
import Buffer from './buffers/ui/Buffer';

const fetchBuffersDispatchAction = createAction<
  ReturnType<typeof bufferNotificationAction>
>('FETCH_BUFFERS_DISPATCH');

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

  connection?: WeechatConnection;

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
        fetchBuffersDispatchAction(
          bufferNotificationAction({
            identifier: request.identifier,
            bufferId: bufferId.replace(/^0x/, ''),
            lineId: lineId.replace(/^0x/, '')
          })
        )
      );
    }
  );

  unsubscribeUpgradeListener: UnsubscribeListener;
  unsubscribeFetchScriptsListener: UnsubscribeListener;
  unsubscribeFetchBuffersDispatchListener: UnsubscribeListener;

  private readonly FETCH_BUFFERS_COMMAND =
    '(buffers) hdata buffer:gui_buffers(*) local_variables,notify,number,full_name,short_name,title,hidden,type';

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
    this.unsubscribeFetchBuffersDispatchListener = store.dispatch(
      (addListener as TypedAddListener<StoreState, AppDispatch>)({
        actionCreator: fetchBuffersDispatchAction,
        effect: async (action, listenerApi) => {
          listenerApi.cancelActiveListeners();

          if (this.connection?.isConnected()) {
            this.connection.send(this.FETCH_BUFFERS_COMMAND);
          }

          await listenerApi.condition(fetchBuffersAction.match);

          const wrappedAction = action.payload;
          if (listenerApi.getState().buffers[wrappedAction.payload.bufferId]) {
            listenerApi.dispatch(wrappedAction);
          }
        }
      })
    );
  }

  componentWillUnmount(): void {
    this.connection?.disconnect();
    this.appStateListener.remove();
    this.unsubscribeUpgradeListener();
    this.unsubscribeFetchScriptsListener();
    this.responseListener.remove();
    this.unsubscribeFetchBuffersDispatchListener();
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
    connection.send(this.FETCH_BUFFERS_COMMAND);
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
          <PersistGate
            loading={null}
            persistor={persistor}
            onBeforeLift={this.onBeforeLift}
          >
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
          </PersistGate>
        </SafeAreaProvider>
      </Provider>
    );
  }
}
