import {
  Button,
  FieldGroup,
  Host,
  Switch,
  Text,
  TextInput,
  useNativeState
} from '@expo/ui';
import { clickable } from '@expo/ui/jetpack-compose/modifiers';
import { accessibilityLabel, buttonStyle } from '@expo/ui/swift-ui/modifiers';
import type { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useEffectEvent, useState } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSelector } from 'reselect';
import type { StoreState } from '../../store';
import { setConnectionInfoAction } from '../../store/actions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { Settings } from '../../store/settings';
import type { RootStackParamList } from '../Root';
import { styles } from './styles';

type NavigationProps = StackScreenProps<
  RootStackParamList,
  'Connection Settings'
>;
const selectConnectionState = createSelector(
  [(state: StoreState) => state.settings],
  (connectionState: Settings) => ({
    hostname: connectionState.hostname || '',
    password: connectionState.password || '',
    ssl: connectionState.ssl,
    filterBuffers: connectionState.filterBuffers,
    path: connectionState.path || ''
  })
);

const ConnectionSettings: React.FC<NavigationProps> = ({ navigation }) => {
  const connectionOptions = useAppSelector(selectConnectionState);

  const hostname = useNativeState(connectionOptions.hostname);
  const path = useNativeState(connectionOptions.path);
  const password = useNativeState(connectionOptions.password);
  const [ssl, setSsl] = useState(connectionOptions.ssl);
  const [filterBuffers, setFilterBuffers] = useState(
    connectionOptions.filterBuffers
  );

  const dispatch = useAppDispatch();

  const onBeforeRemove = useEffectEvent(() => {
    dispatch(
      setConnectionInfoAction({
        hostname: hostname.value || null,
        path: path.value || null,
        password: password.value || null,
        ssl: ssl,
        filterBuffers: filterBuffers
      })
    );
  });

  useEffect(() => {
    return navigation.addListener('beforeRemove', onBeforeRemove);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['right', 'bottom', 'left']} style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" translucent={true} />

        <Host style={{ flex: 1 }}>
          <FieldGroup>
            <Text>
              WeechatRN is a relay client for the WeeChat IRC client. WeechatRN
              supports the WebSocket connection method only. Configure your
              relay hostname and password below, then go back to the main screen
              and click the connect icon. Hostname will be prepended with the
              appropriate scheme (ws(s)://) and suffixed with the configured
              path (/weechat by default).
            </Text>

            <FieldGroup.Section title="Relay Settings">
              <TextInput
                keyboardType="url"
                autoCapitalize="none"
                placeholder="Hostname"
                modifiers={[accessibilityLabel('Relay Hostname')]}
                value={hostname}
                autoCorrect={false}
              />
              <TextInput
                keyboardType="url"
                autoCapitalize="none"
                placeholder="/weechat"
                modifiers={[accessibilityLabel('Relay Path')]}
                value={path}
                autoCorrect={false}
              />
              <TextInput
                autoCapitalize="none"
                placeholder="Password"
                modifiers={[accessibilityLabel('Relay Password')]}
                secureTextEntry
                value={password}
              />
              <Switch label="Use TLS" value={ssl} onValueChange={setSsl} />
            </FieldGroup.Section>
            <FieldGroup.Section title="Options">
              <Switch
                label="Hide server buffers"
                value={filterBuffers}
                onValueChange={setFilterBuffers}
              />
            </FieldGroup.Section>
            {Platform.select({
              ios: (
                <Button
                  modifiers={[buttonStyle('automatic')]}
                  onPress={() => navigation.navigate('Media Upload Settings')}
                  label="Media Upload Settings"
                ></Button>
              ),
              android: (
                <FieldGroup.Section
                  modifiers={[
                    clickable(
                      () => navigation.navigate('Media Upload Settings'),
                      {
                        indication: true
                      }
                    )
                  ]}
                >
                  <Text>Media Upload Settings</Text>
                </FieldGroup.Section>
              )
            })}
          </FieldGroup>
        </Host>
      </SafeAreaView>
    </View>
  );
};

export default ConnectionSettings;
