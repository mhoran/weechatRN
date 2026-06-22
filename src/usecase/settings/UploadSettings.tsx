import { Host, List, Switch, Text, TextInput } from '@expo/ui';
import { Section } from '@expo/ui/swift-ui';
import type { StackScreenProps } from '@react-navigation/stack';
import { memo, useEffect, useEffectEvent, useReducer } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setMediaUploadOptionsAction } from '../../store/actions';
import type { MediaUploadOptions } from '../../store/connection-info';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../Root';
import { styles } from './styles';
import { accessibilityLabel } from '@expo/ui/swift-ui/modifiers';

type NavigationProps = StackScreenProps<
  RootStackParamList,
  'Media Upload Settings'
>;

const mergeState = <T,>(oldState: T, newState: Partial<T>): T => ({
  ...oldState,
  ...newState
});

const initialState = (uploadOptions: MediaUploadOptions) => {
  const headers: [string, string][] = uploadOptions.headers
    ? Object.entries(uploadOptions.headers)
    : [['', '']];

  return { ...uploadOptions, headers };
};

const UploadSettings: React.FC<NavigationProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const uploadOptions = useAppSelector(
    (state) => state.connection.mediaUploadOptions
  );

  const [state, setState] = useReducer(
    mergeState<ReturnType<typeof initialState>>,
    uploadOptions,
    initialState
  );

  const setUploadOptionsHeaderName = (index: number, name: string) => {
    const header: [string, string] = [name, state.headers[index][1]];
    setState({ headers: state.headers.toSpliced(index, 1, header) });
  };

  const setUploadOptionsHeaderValue = (index: number, value: string) => {
    const header: [string, string] = [state.headers[index][0], value];
    setState({ headers: state.headers.toSpliced(index, 1, header) });
  };

  const setUploadOptions = useEffectEvent(() => {
    const { headers, ...rest } = state;
    const filteredHeaders = Object.fromEntries(
      headers.filter(([name, value]) => name && value)
    );

    dispatch(
      setMediaUploadOptionsAction({
        ...rest,
        username: rest.username || undefined,
        password: rest.password || undefined,
        fieldName: rest.fieldName || undefined,
        regexp: rest.regexp || undefined,
        ...(Object.keys(filteredHeaders).length > 0 && {
          headers: filteredHeaders
        })
      })
    );
  });

  useEffect(() => {
    return navigation.addListener('beforeRemove', setUploadOptions);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <StatusBar barStyle="dark-content" translucent={true} />
      <Host style={{ flex: 1 }}>
        <List>
          <Text>
            Use the form below to configure media upload settings. This allows
            for uploading media to hosting provider and will automatically paste
            the link in the input box. When configured, an upload button will
            appear next to the input box. Press the button once to upload media
            from the camera roll. Press the button twice to upload media from
            elsewhere on your device. Press and hold the button to take a photo.
          </Text>

          <Section title="Upload Service URL">
            <TextInput
              keyboardType="url"
              autoCapitalize="none"
              placeholder="Required"
              modifiers={[accessibilityLabel('Upload Service URL')]}
              testID="upload-settings-upload-service-url"
              onChangeText={(url) => setState({ url })}
              defaultValue={state.url}
              autoCorrect={false}
            />
          </Section>
          <Section title="Basic Auth">
            <Switch
              onValueChange={(basicAuth) => setState({ basicAuth })}
              value={state.basicAuth}
              label="Use Basic Auth"
              testID="upload-settings-use-basic-auth"
            />
            {state.basicAuth && (
              <>
                <TextInput
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Username"
                  modifiers={[accessibilityLabel('Upload Service Username')]}
                  onChangeText={(username) => setState({ username })}
                  defaultValue={state.username}
                  autoCorrect={false}
                />
                <TextInput
                  autoCapitalize="none"
                  placeholder="Password"
                  modifiers={[accessibilityLabel('Upload Service Password')]}
                  secureTextEntry
                  onChangeText={(password) => setState({ password })}
                  defaultValue={state.password}
                />
              </>
            )}
          </Section>
          <Section title="Form Field Name">
            <TextInput
              autoCapitalize="none"
              placeholder="file"
              modifiers={[accessibilityLabel('Form Field Name')]}
              autoCorrect={false}
              onChangeText={(fieldName) => setState({ fieldName })}
              defaultValue={state.fieldName}
            />
          </Section>
          <Section title="Response Regexp">
            <TextInput
              autoCapitalize="none"
              placeholder="/^https://\S+/"
              modifiers={[accessibilityLabel('Response Regexp')]}
              autoCorrect={false}
              keyboardType="ascii-capable"
              onChangeText={(regexp) => setState({ regexp })}
              defaultValue={state.regexp}
            />
          </Section>
          {state.headers.map(([headerName, headerValue], index) => (
            <Section key={index} title="Additional Headers">
              <>
                <TextInput
                  autoCapitalize="none"
                  placeholder="Name"
                  modifiers={[accessibilityLabel('Header Name')]}
                  autoCorrect={false}
                  defaultValue={headerName}
                  onChangeText={(text) =>
                    setUploadOptionsHeaderName(index, text)
                  }
                />
                <TextInput
                  autoCapitalize="none"
                  placeholder="Value"
                  modifiers={[accessibilityLabel('Header Value')]}
                  autoCorrect={false}
                  defaultValue={headerValue}
                  onChangeText={(text) =>
                    setUploadOptionsHeaderValue(index, text)
                  }
                />
              </>
            </Section>
          ))}
        </List>
      </Host>
    </SafeAreaView>
  );
};

export default memo(UploadSettings);
