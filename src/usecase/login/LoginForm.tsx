import * as React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Switch,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { StoreState } from '../../store';
import { ConnectionError } from '../../lib/weechat/connection';
import UndoTextInput from '../buffers/ui/UndoTextInput';

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
    this.props.dispatch({
      type: 'SET_CONNECTION_INFO',
      hostname: this.state.hostname,
      password: this.state.password,
      ssl: this.state.ssl,
      filterBuffers: this.state.filterBuffers
    });
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
    const { connecting } = this.props;
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
            {this.props.connectionError && (
              <Text style={[styles.text, { color: 'red' }]}>
                {this.connectionErrorToMessage(this.props.connectionError)}
              </Text>
            )}
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
                <Text style={styles.buttonText}>CONNECT</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

export default connector(LoginForm);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    flex: 1,
    padding: 20
  },
  header: {
    textAlign: 'center',
    color: '#4157af',
    fontSize: 20
  },
  text: {
    padding: 10,
    color: '#4157af',
    fontSize: 18
  },
  input: {
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 2,
    fontSize: 18,
    borderColor: '#4157af',
    color: '#4157af'
  },
  centeredButton: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    borderWidth: 2,
    borderColor: '#4157af',
    width: 200,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  buttonText: {
    textAlign: 'center',
    color: '#4157af',
    fontWeight: '400',
    fontSize: 18
  }
});
