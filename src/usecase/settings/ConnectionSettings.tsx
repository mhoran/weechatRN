import type { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import {
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
import type { StoreState } from '../../store';
import { setConnectionInfoAction } from '../../store/actions';
import type { RootStackParamList } from '../Root';
import { styles } from './styles';
import UndoTextInput from '../shared/UndoTextInput';

const connector = connect((state: StoreState) => ({
  hostname: state.connection.hostname || '',
  password: state.connection.password || '',
  ssl: state.connection.ssl,
  filterBuffers: state.connection.filterBuffers
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

type NavigationProps = StackScreenProps<
  RootStackParamList,
  'Connection Settings'
>;

type Props = PropsFromRedux & NavigationProps;

interface State {
  hostname: string;
  password: string;
  ssl: boolean;
  filterBuffers: boolean;
}

class ConnectionSettings extends React.PureComponent<Props, State> {
  state: State = {
    hostname: this.props.hostname,
    password: this.props.password,
    ssl: this.props.ssl,
    filterBuffers: this.props.filterBuffers
  };

  componentDidMount(): void {
    this.props.navigation.addListener('beforeRemove', this.onBeforeRemove);
  }

  componentWillUnmount(): void {
    this.props.navigation.removeListener('beforeRemove', this.onBeforeRemove);
  }

  onBeforeRemove = () => {
    this.props.dispatch(
      setConnectionInfoAction({
        hostname: this.state.hostname,
        password: this.state.password,
        ssl: this.state.ssl,
        filterBuffers: this.state.filterBuffers
      })
    );
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

  render() {
    const { navigation } = this.props;
    const { hostname, password, ssl, filterBuffers } = this.state;

    return (
      <View style={styles.container}>
        <SafeAreaView edges={['right', 'bottom', 'left']}>
          <StatusBar barStyle="dark-content" translucent={true} />
          <Text style={styles.text}>
            WeechatRN is a relay client for the WeeChat IRC client. WeechatRN
            supports the WebSocket connection method only. Configure your relay
            hostname and password below, then go back to the main screen and
            click the connect icon. Hostname will be prepended with the
            appropriate scheme (http(s)://) and suffixed with /weechat.
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
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Media Upload Settings')}
            >
              <Text style={[styles.text, { textDecorationLine: 'underline' }]}>
                Media Upload Settings
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

export default connector(ConnectionSettings);
