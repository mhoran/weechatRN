import * as React from "react";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import WeechatConnection from "../lib/weechat/connection";
import { store, persistor } from "../store";

import App from "./App";
import ConnectionGate from "./ConnectionGate";

interface State {
  connecting: boolean;
}

export default class WeechatNative extends React.Component<{}, State> {
  state: State = {
    connecting: false
  };

  connection: WeechatConnection;

  constructor(props) {
    super(props);
    this.connection = new WeechatConnection(store.dispatch);
  }

  onConnectionSuccess = connection => {
    this.setState({ connecting: false });
    connection.send("(hotlist) hdata hotlist:gui_hotlist(*)");
    connection.send(
      "(buffers) hdata buffer:gui_buffers(*) local_variables,notify,number,full_name,short_name,title,hidden,type"
    );
    // connection.send("(nicklist) nicklist");
    connection.send("sync");
  };

  onConnectionError = error => {
    this.setState({ connecting: false });
    console.log(error);
  };

  disconnect = () => {
    this.connection.close();
  };

  onConnect = (hostname: string, password: string, ssl: boolean) => {
    this.setState({ connecting: true });
    this.connection.connect(
      hostname,
      password,
      ssl,
      this.onConnectionSuccess,
      this.onConnectionError
    );
  };

  fetchLines = (bufferId: string, numLines: number = 50) => {
    this.connection &&
      this.connection.send(
        `(lines) hdata buffer:0x${bufferId}/own_lines/last_line(-${numLines})/data`
      );
  };
  sendMessageToBuffer = (fullBufferName: string, message: string) => {
    this.connection &&
      this.connection.send(`(input) input ${fullBufferName} ${message}`);
  };
  clearHotlistForBuffer = (fullBufferName: string) => {
    this.sendMessageToBuffer(fullBufferName, "/buffer set hotlist -1");
    this.sendMessageToBuffer(
      fullBufferName,
      "/input set_unread_current_buffer"
    );
  };
  render() {
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
              fetchLinesForBuffer={this.fetchLines}
            />
          </ConnectionGate>
        </PersistGate>
      </Provider>
    );
  }
}
