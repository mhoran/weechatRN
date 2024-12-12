import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { UnsubscribeListener } from '@reduxjs/toolkit';
import { addListener } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { registerForPushNotificationsAsync } from '../lib/helpers/push-notifications';
import RelayClient from '../lib/weechat/client';
import type { ConnectionError } from '../lib/weechat/connection';
import type { AppDispatch, StoreState } from '../store';
import { store } from '../store';
import * as actions from '../store/actions';
import { PendingBufferNotificationListener } from '../store/listeners';
import App from './App';
import PersistGate from './PersistGate';
import ConnectionSettings from './settings/ConnectionSettings';
import UploadSettings from './settings/UploadSettings';

void SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  'Connection Settings': undefined;
  'Media Upload Settings': undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          bufferId: BigInt(bufferId as string).toString(),
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
    const token = await registerForPushNotificationsAsync();
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

  onConnect = (): void => {
    const { hostname, password, ssl } = store.getState().connection;
    if (!hostname || !password) return;

    this.setState({ connecting: true, connectionError: null });
    this.client.connect(hostname, password, ssl);
  };

  onBeforeLift = (): void => {
    SplashScreen.hide();

    this.onConnect();
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
    const { connectionError } = this.state;

    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <PersistGate onBeforeLift={this.onBeforeLift}>
            <GestureHandlerRootView>
              <NavigationContainer>
                <Stack.Navigator>
                  <>
                    <Stack.Screen
                      name="App"
                      options={{ headerShown: false, gestureEnabled: false }}
                    >
                      {(props) => (
                        <App
                          {...props}
                          connect={this.onConnect}
                          disconnect={this.disconnect}
                          client={this.client}
                        />
                      )}
                    </Stack.Screen>
                    <Stack.Screen name="Connection Settings">
                      {(props) => (
                        <ConnectionSettings
                          {...props}
                          connectionError={connectionError}
                        />
                      )}
                    </Stack.Screen>
                    <Stack.Screen
                      name="Media Upload Settings"
                      component={UploadSettings}
                    />
                  </>
                </Stack.Navigator>
              </NavigationContainer>
            </GestureHandlerRootView>
          </PersistGate>
        </SafeAreaProvider>
      </Provider>
    );
  }
}
