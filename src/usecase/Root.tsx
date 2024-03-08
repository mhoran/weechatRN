import * as React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import WeechatConnection, { ConnectionError } from '../lib/weechat/connection';
import { persistor, store } from '../store';

import { getPushNotificationStatusAsync } from '../lib/helpers/push-notifications';
import App from './App';
import ConnectionGate from './ConnectionGate';
import Buffer from './buffers/ui/Buffer';
import { addListener } from '@reduxjs/toolkit';

interface State {
  connecting: boolean;
  connectionError: ConnectionError | null;
}

export default class WeechatNative extends React.Component<null, State> {
  state: State = {
    connecting: false,
    connectionError: null
  };

  connection?: WeechatConnection;

  constructor(props: null) {
    super(props);
    store.dispatch(
      addListener({
        predicate: (action) => {
          return action.type === 'UPGRADE';
        },
        effect: () => {
          this.disconnect();
        }
      })
    );
  }

  setNotificationToken = async (): Promise<void> => {
    const token = await getPushNotificationStatusAsync();
    if (token) this.sendMessageToBuffer('core.weechat', '/weechatrn ' + token);
  };

  onConnectionSuccess = (connection: WeechatConnection): void => {
    this.setState({ connecting: false });
    connection.send('(hotlist) hdata hotlist:gui_hotlist(*)');
    connection.send(
      '(buffers) hdata buffer:gui_buffers(*) local_variables,notify,number,full_name,short_name,title,hidden,type'
    );
    this.connection &&
      this.connection.send(
        '(last_read_lines) hdata buffer:gui_buffers(*)/own_lines/last_read_line/data buffer'
      );
    // connection.send("(nicklist) nicklist");
    connection.send('sync');
    this.setNotificationToken();
  };

  onConnectionError = (
    reconnect: boolean,
    connectionError: ConnectionError | null
  ): void => {
    this.setState((state) => ({
      connecting: reconnect,
      connectionError: state.connecting ? connectionError : null
    }));
  };

  disconnect = (): void => {
    this.connection && this.connection.close();
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

  fetchBufferInfo = (
    bufferId: string,
    numLines = Buffer.DEFAULT_LINE_INCREMENT
  ): void => {
    if (this.connection) {
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

  clearHotlistForBuffer = (
    currentBufferId: string | null,
    bufferId: string
  ): void => {
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
    this.connection &&
      this.connection.send(
        `(last_read_lines) hdata buffer:0x${bufferId}/own_lines/last_read_line/data buffer`
      );
  };

  render() {
    const { connecting, connectionError } = this.state;

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
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
      </Provider>
    );
  }
}
