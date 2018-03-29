import React from "react";
import { StatusBar, AppRegistry } from "react-native";
import { Provider } from "react-redux";

import WeechatConnection from "./src/lib/weechat/connection";
import { HOSTNAME, PASSWORD } from "./config";

import store from "./src/store";

import App from "./src/usecase/App";

class WeechatNative extends React.Component {
  componentWillMount() {
    let connection = new WeechatConnection(HOSTNAME, PASSWORD);
    let compressed = false;

    connection.connect().then(
      conn => {
        conn.send(
          `init password=${PASSWORD},compression=${
            compressed ? "zlib" : "off"
          }\n`
        );
        conn.send("(id) info version\n");
      },
      error => {
        console.log(error);
      }
    );
  }
  render() {
    return (
      <Provider store={store}>
        <StatusBar barStyle="light-content">
          <App />
        </StatusBar>
      </Provider>
    );
  }
}

AppRegistry.registerComponent("WeechatNative", () => WeechatNative);
