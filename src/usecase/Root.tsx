import * as React from "react";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";

import WeechatConnection from "../lib/weechat/connection";
import { HOSTNAME, PASSWORD } from "../../config";

import store from "../store";

import App from "./App";
import ConnectionGate from "./ConnectionGate";

const compressed = false;
const connection = new WeechatConnection(
  store.dispatch,
  HOSTNAME,
  PASSWORD,
  compressed
);

export default class WeechatNative extends React.Component {
  componentWillMount() {
    connection.connect().then(
      conn => {
        conn.send("(hotlist) hdata hotlist:gui_hotlist(*)");
        conn.send(
          "(buffers) hdata buffer:gui_buffers(*) local_variables,notify,number,full_name,short_name,title,hidden,type"
        );
        // conn.send("(nicklist) nicklist");
        conn.send("sync");
      },
      error => {
        console.log(error);
      }
    );
  }
  fetchLines = (bufferId: string, numLines: number = 50) => {
    connection &&
      connection.send(
        `(lines) hdata buffer:0x${bufferId}/own_lines/last_line(-${numLines})/data`
      );
  };
  sendMessageToBuffer = (fullBufferName: string, message: string) => {
    connection && connection.send(`(input) input ${fullBufferName} ${message}`);
  };
  clearHotlistForBuffer = (fullBufferName: string) => {
    this.sendMessageToBuffer(fullBufferName, "/buffer set hotlist -1");
    this.sendMessageToBuffer(
      fullBufferName,
      "/input set_unread_current_buffer"
    );
  };
  render() {
    return (
      <Provider store={store}>
        <ConnectionGate>
          <StatusBar barStyle="light-content" />
          <App
            clearHotlistForBuffer={this.clearHotlistForBuffer}
            sendMessageToBuffer={this.sendMessageToBuffer}
            fetchLinesForBuffer={this.fetchLines}
          />
        </ConnectionGate>
      </Provider>
    );
  }
}
