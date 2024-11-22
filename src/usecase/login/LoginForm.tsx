import * as React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ConnectedProps } from 'react-redux';
import { connect } from 'react-redux';
import { ConnectionError } from '../../lib/weechat/connection';
import type { StoreState } from '../../store';
import { setConnectionInfoAction } from '../../store/actions';
import { styles } from '../settings/styles';
import UndoTextInput from '../shared/UndoTextInput';

const connector = connect((state: StoreState) => ({
  hostname: state.connection.hostname || '',
  password: state.connection.password || '',
  ssl: state.connection.ssl,
  filterBuffers: state.connection.filterBuffers
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  onConnect: (hostname: string, password: string, ssl: boolean) => void;
  connecting: boolean;
  connectionError: ConnectionError | null;
  setShowUploadSettings: (show: boolean) => void;
};

interface State {
  hostname: string;
  password: string;
  ssl: boolean;
  filterBuffers: boolean;
}

class LoginForm extends React.Component<Props, State> {
  state: State = {
    hostname: this.props.hostname,
    password: this.props.password,
    ssl: this.props.ssl,
    filterBuffers: this.props.filterBuffers
  };

  onPress = () => {
    this.props.dispatch(
      setConnectionInfoAction({
        hostname: this.state.hostname,
        password: this.state.password,
        ssl: this.state.ssl,
        filterBuffers: this.state.filterBuffers
      })
    );
    const { hostname, password, ssl } = this.state;
    this.props.onConnect(hostname, password, ssl);
  };

  setHostname = (hostname: string) => {
    this.setState({ hostname });
  };

  setPassword = (password: string) => {
    this.setState({ password });
  };

  setSSL = (ssl: boolean) => {
    this.setState({ ssl });
  };

  setFilterBuffers = (filterBuffers: boolean) => {
    this.setState({ filterBuffers });
  };

  connectionErrorToMessage = (connectionError: ConnectionError) => {
    switch (connectionError) {
      case ConnectionError.Authentication:
        return 'Failed to authenticate with weechat relay. Check password.';
      case ConnectionError.Socket:
        return 'Failed to connect to weechat relay. Check hostname and SSL configuration.';
    }
  };

  render() {
    const { connecting, connectionError, setShowUploadSettings } = this.props;
    const { hostname, password, ssl, filterBuffers } = this.state;

    return (
      <View style={styles.container}>
        <SafeAreaView>
          <StatusBar barStyle="dark-content" />
          <Text style={styles.header}>
            Connect to Weechat relay via websocket
          </Text>
          <UndoTextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            keyboardType="url"
            autoCapitalize="none"
            placeholder="Hostname"
            onChangeText={this.setHostname}
            value={hostname}
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            autoCapitalize="none"
            placeholder="Password"
            secureTextEntry
            onChangeText={this.setPassword}
            value={password}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.text}>SSL</Text>
            <Switch
              style={{ margin: 10 }}
              value={ssl}
              onValueChange={this.setSSL}
            />
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.text}>Hide server buffers</Text>
            <Switch
              style={{ margin: 10 }}
              value={filterBuffers}
              onValueChange={this.setFilterBuffers}
            />
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {connectionError !== null && (
              <Text style={[styles.text, { color: 'red' }]}>
                {this.connectionErrorToMessage(connectionError)}
              </Text>
            )}
          </View>

          <View>
            <TouchableOpacity onPress={() => setShowUploadSettings(true)}>
              <Text style={[styles.text, { textDecorationLine: 'underline' }]}>
                Media Upload Settings
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centeredButton}>
            <TouchableOpacity
              disabled={connecting}
              style={styles.button}
              onPress={this.onPress}
            >
              {connecting ? (
                <ActivityIndicator color="#4157af" animating={connecting} />
              ) : (
                <Text style={styles.buttonText}>Connect</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

export default connector(LoginForm);
