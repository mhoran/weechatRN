import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useEffectEvent, useState } from 'react';
import {
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setConnectionInfoAction } from '../../store/actions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../Root';
import { styles } from './styles';

type NavigationProps = StackScreenProps<
  RootStackParamList,
  'Connection Settings'
>;

const ConnectionSettings: React.FC<NavigationProps> = ({ navigation }) => {
  const connectionOptions = useAppSelector((state) => ({
    hostname: state.connection.hostname || '',
    password: state.connection.password || '',
    ssl: state.connection.ssl,
    filterBuffers: state.connection.filterBuffers
  }));

  const [hostname, setHostname] = useState(connectionOptions.hostname);
  const [password, setPassword] = useState(connectionOptions.password);
  const [ssl, setSsl] = useState(connectionOptions.ssl);
  const [filterBuffers, setFilterBuffers] = useState(
    connectionOptions.filterBuffers
  );

  const dispatch = useAppDispatch();

  const onBeforeRemove = useEffectEvent(() => {
    dispatch(
      setConnectionInfoAction({
        hostname,
        password,
        ssl,
        filterBuffers
      })
    );
  });

  useEffect(() => {
    return navigation.addListener('beforeRemove', onBeforeRemove);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['right', 'bottom', 'left']}>
        <StatusBar barStyle="dark-content" translucent={true} />
        <Text style={styles.text}>
          WeechatRN is a relay client for the WeeChat IRC client. WeechatRN
          supports the WebSocket connection method only. Configure your relay
          hostname and password below, then go back to the main screen and click
          the connect icon. Hostname will be prepended with the appropriate
          scheme (http(s)://) and suffixed with /weechat.
        </Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#4157af"
          keyboardType="url"
          autoCapitalize="none"
          placeholder="Hostname"
          onChangeText={setHostname}
          value={hostname}
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#4157af"
          autoCapitalize="none"
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.text}>SSL</Text>
          <Switch style={{ margin: 10 }} value={ssl} onValueChange={setSsl} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.text}>Hide server buffers</Text>
          <Switch
            style={{ margin: 10 }}
            value={filterBuffers}
            onValueChange={setFilterBuffers}
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
};

export default ConnectionSettings;
