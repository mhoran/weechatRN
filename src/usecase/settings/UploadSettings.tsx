import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { memo, useCallback, useEffect, useReducer, useRef } from 'react';
import {
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setMediaUploadOptionsAction } from '../../store/actions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../Root';
import { KeyboardAvoidingView } from '../shared/KeyboardAvoidingView';
import UndoTextInput from '../shared/UndoTextInput';
import { styles } from './styles';

type NavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Media Upload Settings'
>;

const mergeState = <T,>(oldState: T, newState: Partial<T>): T => ({
  ...oldState,
  ...newState
});

const UploadSettings: React.FC<NavigationProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const uploadOptions = useAppSelector(
    (state) => state.connection.mediaUploadOptions
  );

  const initialStateHeaders: [string, string][] = uploadOptions.headers
    ? Object.entries(uploadOptions.headers)
    : [['', '']];

  const initialState = {
    ...uploadOptions,
    headers: initialStateHeaders
  };

  const [state, setState] = useReducer(
    mergeState<typeof initialState>,
    initialState
  );

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setUploadOptionsHeaderName = (index: number, name: string) => {
    const header: [string, string] = [name, state.headers[index][1]];
    setState({ headers: state.headers.toSpliced(index, 1, header) });
  };

  const setUploadOptionsHeaderValue = (index: number, value: string) => {
    const header: [string, string] = [state.headers[index][0], value];
    setState({ headers: state.headers.toSpliced(index, 1, header) });
  };

  const setUploadOptions = useCallback(() => {
    const { headers, ...rest } = stateRef.current;
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
  }, [dispatch, stateRef]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', setUploadOptions);
  }, [navigation, setUploadOptions]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <KeyboardAvoidingView behavior="padding">
        <ScrollView alwaysBounceVertical={false}>
          <StatusBar barStyle="dark-content" translucent={true} />
          <Text style={styles.text}>
            Use the form below to configure media upload settings. This allows
            for uploading media to hosting provider and will automatically paste
            the link in the input box. When configured, an upload button will
            appear next to the input box. Press the button once to upload media
            from the camera roll. Press the button twice to upload media from
            elsewhere on your device. Press and hold the button to take a photo.
          </Text>
          <UndoTextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            keyboardType="url"
            autoCapitalize="none"
            placeholder="Upload Service URL"
            onChangeText={(url) => setState({ url })}
            value={state.url}
            autoCorrect={false}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.text}>Use Basic Auth</Text>
            <Switch
              style={{ margin: 10 }}
              onValueChange={(basicAuth) => setState({ basicAuth })}
              value={state.basicAuth}
              accessibilityLabel="Use Basic Auth"
            />
          </View>
          {state.basicAuth && (
            <>
              <UndoTextInput
                style={styles.input}
                placeholderTextColor="#4157af"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Upload Service Username"
                onChangeText={(username) => setState({ username })}
                value={state.username}
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholderTextColor="#4157af"
                autoCapitalize="none"
                placeholder="Upload Service Password"
                secureTextEntry
                onChangeText={(password) => setState({ password })}
                value={state.password}
              />
            </>
          )}
          <UndoTextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            autoCapitalize="none"
            placeholder="Form Field Name (default: file)"
            autoCorrect={false}
            onChangeText={(fieldName) => setState({ fieldName })}
            value={state.fieldName}
          />
          <UndoTextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            autoCapitalize="none"
            placeholder="RegExp (default: /^https://\S+/)"
            autoCorrect={false}
            keyboardType="ascii-capable"
            onChangeText={(regexp) => setState({ regexp })}
            value={state.regexp}
          />
          {state.headers.map(([headerName, headerValue], index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                columnGap: 10
              }}
            >
              <UndoTextInput
                style={[styles.input, { minWidth: 300, flexGrow: 1 }]}
                placeholderTextColor="#4157af"
                autoCapitalize="none"
                placeholder="Header Name (optional)"
                autoCorrect={false}
                value={headerName}
                onChangeText={(text) => setUploadOptionsHeaderName(index, text)}
              />
              <UndoTextInput
                style={[styles.input, { minWidth: 300, flexGrow: 1 }]}
                placeholderTextColor="#4157af"
                autoCapitalize="none"
                placeholder="Header Value (optional)"
                autoCorrect={false}
                value={headerValue}
                onChangeText={(text) =>
                  setUploadOptionsHeaderValue(index, text)
                }
              />
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default memo(UploadSettings);
