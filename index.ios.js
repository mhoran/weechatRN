/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React from 'react-native'

import { Provider } from 'react-redux/native';

//import WeechatConnection from './src/connection'
import {HOSTNAME, PASSWORD} from './config'

import store from './src/store';

import App from './src/usecase/App';

let {
  AppRegistry,
  StatusBarIOS
} = React;

StatusBarIOS.setStyle('light-content');

let WeechatRN = React.createClass({
    render() {
        return (
            <Provider store={store}>
                {() => <App />}
            </Provider>
        );
    }
});

AppRegistry.registerComponent('WeechatRN', () => WeechatRN);


//let connection = new WeechatConnection(HOSTNAME, PASSWORD);
//let compressed = false;


//connection.connect().then((conn) => {
//    conn.send(`init password=${PASSWORD},compression=${compressed ? 'zlib' : 'off'}\n`);
//    conn.send('(id) info version\n');
//});




