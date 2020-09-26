import * as React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import WeechatConnection from '../lib/weechat/connection';
import { store, persistor } from '../store';

import App from './App';
import ConnectionGate from './ConnectionGate';
import { getPushNotificationStatusAsync } from '../lib/helpers/push-notifications';

interface State {
  connecting: boolean;
}

export default class WeechatNative extends React.Component<null, State> {
  state: State = {
    connecting: false
  };

  connection: WeechatConnection;

  constructor(props: null) {
    super(props);
    this.connection = new WeechatConnection(store.dispatch);
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
    // connection.send("(nicklist) nicklist");
    connection.send('sync');
    this.setNotificationToken();
  };

  onConnectionError = (reconnect: boolean): void => {
    this.setState({ connecting: reconnect });
  };

  disconnect = (): void => {
    this.connection.close();
  };

  onConnect = (hostname: string, password: string, ssl: boolean): void => {
    this.setState({ connecting: true });
    this.connection.connect(
      hostname,
      password,
      ssl,
      this.onConnectionSuccess,
      this.onConnectionError
    );
  };

  fetchBufferInfo = (bufferId: string, numLines = 50): void => {
    if (this.connection) {
      this.connection.send(
        `(lines) hdata buffer:0x${bufferId}/own_lines/last_line(-${numLines})/data`
      );
      this.connection.send(`(nicklist) nicklist 0x${bufferId}`);
    }
  };

  sendMessageToBuffer = (fullBufferName: string, message: string): void => {
    this.connection &&
      this.connection.send(`(input) input ${fullBufferName} ${message}`);
  };

  clearHotlistForBuffer = (fullBufferName: string): void => {
    this.sendMessageToBuffer(fullBufferName, '/buffer set hotlist -1');
    this.sendMessageToBuffer(
      fullBufferName,
      '/input set_unread_current_buffer'
    );
  };

  render(): JSX.Element {
    const { connecting } = this.state;

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConnectionGate connecting={connecting} onConnect={this.onConnect}>
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
