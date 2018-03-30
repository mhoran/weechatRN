import React from "react";
import { StatusBar, AppRegistry } from "react-native";
import { Provider } from "react-redux";

import WeechatConnection from "./src/lib/weechat/connection";
import { HOSTNAME, PASSWORD } from "./config";

import store from "./src/store";

import App from "./src/usecase/App";
import ConnectionGate from "./src/usecase/ConnectionGate";

class WeechatNative extends React.Component {
  componentWillMount() {
    let connection = new WeechatConnection(store.dispatch, HOSTNAME, PASSWORD);
    let compressed = false;

    connection.connect().then(
      conn => {
        conn.send(
          `init password=${PASSWORD},compression=${compressed ? "zlib" : "off"}`
        );
        conn.send("(version) info version");
        // conn.send("(hotlist) hdata hotlist:gui_hotlist(*)");
        conn.send(
          "(buffers) hdata buffer:gui_buffers(*) local_variables,notify,number,full_name,short_name,title,hidden,type"
        );
        // conn.send("(nicklist) nicklist");
        // conn.send("sync");
      },
      error => {
        console.log(error);
      }
    );
  }
  render() {
    return (
      <Provider store={store}>
        <ConnectionGate>
          <App />
        </ConnectionGate>
      </Provider>
    );
  }
}

AppRegistry.registerComponent("WeechatNative", () => WeechatNative);
