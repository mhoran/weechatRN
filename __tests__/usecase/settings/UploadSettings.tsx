import { HeaderHeightContext } from '@react-navigation/elements';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../../src/store';
import {
  act,
  fireEvent,
  render,
  screen,
  userEvent
} from '../../../src/test-utils';
import type { RootStackParamList } from '../../../src/usecase/Root';
import UploadSettings from '../../../src/usecase/settings/UploadSettings';

describe('UploadSettings', () => {
  it('stores the configured settings', async () => {
    const store = configureStore({ reducer });
    const listeners: (() => void)[] = [];
    render(
      <HeaderHeightContext.Provider value={0}>
        <UploadSettings
          route={{} as RouteProp<RootStackParamList, 'Media Upload Settings'>}
          navigation={
            {
              addListener: (eventName: string, callback: () => void) => {
                listeners.push(callback);
                return () => {};
              }
            } as StackNavigationProp<
              RootStackParamList,
              'Media Upload Settings'
            >
          }
        />
      </HeaderHeightContext.Provider>,
      {
        store: store
      }
    );

    const urlInput = screen.getByPlaceholderText('Upload Service URL');
    await userEvent.type(urlInput, 'https://example.com');

    const usernameInput = screen.getByPlaceholderText(
      'Upload Service Username'
    );
    await userEvent.type(usernameInput, 'root');

    const passwordInput = screen.getByPlaceholderText(
      'Upload Service Password'
    );
    await userEvent.type(passwordInput, 'changeme');

    act(() => listeners.forEach((listener) => listener()));

    const uploadOptions = store.getState().connection.mediaUploadOptions;

    expect(uploadOptions.url).toEqual('https://example.com');
    expect(uploadOptions.basicAuth).toEqual(true);
    expect(uploadOptions.username).toEqual('root');
    expect(uploadOptions.password).toEqual('changeme');
    expect(uploadOptions.fieldName).toBeUndefined();
    expect(uploadOptions.regexp).toBeUndefined();
    expect(uploadOptions.headers).toBeUndefined();
  });

  it('allows configuring additional headers', async () => {
    const store = configureStore({ reducer });
    const listeners: (() => void)[] = [];
    render(
      <HeaderHeightContext.Provider value={0}>
        <UploadSettings
          route={{} as RouteProp<RootStackParamList, 'Media Upload Settings'>}
          navigation={
            {
              addListener: (eventName: string, callback: () => void) => {
                listeners.push(callback);
                return () => {};
              }
            } as StackNavigationProp<
              RootStackParamList,
              'Media Upload Settings'
            >
          }
        />
      </HeaderHeightContext.Provider>,
      {
        store: store
      }
    );

    const urlInput = screen.getByPlaceholderText('Upload Service URL');
    await userEvent.type(urlInput, 'https://example.com');

    const basicAuthSwitch = screen.getByLabelText('Use Basic Auth');
    fireEvent(basicAuthSwitch, 'onValueChange', false);

    const headerNameInput = screen.getByPlaceholderText(
      'Header Name (optional)'
    );
    await userEvent.type(headerNameInput, 'Authorization');

    const headerValueInput = screen.getByPlaceholderText(
      'Header Value (optional)'
    );
    await userEvent.type(headerValueInput, 'Bearer token');

    act(() => listeners.forEach((listener) => listener()));

    const uploadOptions = store.getState().connection.mediaUploadOptions;

    expect(uploadOptions.url).toEqual('https://example.com');
    expect(uploadOptions.basicAuth).toEqual(false);
    expect(uploadOptions.username).toBeUndefined();
    expect(uploadOptions.password).toBeUndefined();
    expect(uploadOptions.fieldName).toBeUndefined();
    expect(uploadOptions.regexp).toBeUndefined();
    expect(uploadOptions.headers).toEqual({ Authorization: 'Bearer token' });
  });

  it('does not store incomplete headers', async () => {
    const store = configureStore({ reducer });
    const listeners: (() => void)[] = [];
    render(
      <HeaderHeightContext.Provider value={0}>
        <UploadSettings
          route={{} as RouteProp<RootStackParamList, 'Media Upload Settings'>}
          navigation={
            {
              addListener: (eventName: string, callback: () => void) => {
                listeners.push(callback);
                return () => {};
              }
            } as StackNavigationProp<
              RootStackParamList,
              'Media Upload Settings'
            >
          }
        />
      </HeaderHeightContext.Provider>,
      {
        store: store
      }
    );

    const headerNameInput = screen.getByPlaceholderText(
      'Header Name (optional)'
    );
    await userEvent.type(headerNameInput, 'Authorization');

    act(() => listeners.forEach((listener) => listener()));

    let uploadOptions = store.getState().connection.mediaUploadOptions;

    expect(uploadOptions.headers).toBeUndefined();

    await userEvent.type(headerNameInput, '');

    const headerValueInput = screen.getByPlaceholderText(
      'Header Value (optional)'
    );
    await userEvent.type(headerValueInput, 'Bearer token');

    uploadOptions = store.getState().connection.mediaUploadOptions;
    expect(uploadOptions.headers).toBeUndefined();
  });

  it('populates form fields with values from the store', () => {
    const preloadedState = {
      connection: {
        hostname: null,
        password: null,
        ssl: true,
        filterBuffers: true,
        mediaUploadOptions: {
          url: 'https://example.com',
          basicAuth: false,
          headers: { Authorization: 'Bearer token' }
        }
      }
    };
    const store = configureStore({ reducer, preloadedState });
    render(
      <HeaderHeightContext.Provider value={0}>
        <UploadSettings
          route={{} as RouteProp<RootStackParamList, 'Media Upload Settings'>}
          navigation={
            {
              addListener: (_eventName: string, _callback: () => void) => {
                return () => {};
              }
            } as StackNavigationProp<
              RootStackParamList,
              'Media Upload Settings'
            >
          }
        />
      </HeaderHeightContext.Provider>,
      {
        store: store
      }
    );

    const urlInput = screen.getByPlaceholderText('Upload Service URL');
    expect(urlInput.props.value).toEqual('https://example.com');

    const basicAuthSwitch = screen.getByLabelText('Use Basic Auth');
    expect(basicAuthSwitch.props.value).toBe(false);

    const headerNameInput = screen.getByPlaceholderText(
      'Header Name (optional)'
    );
    expect(headerNameInput.props.value).toEqual('Authorization');

    const headerValueInput = screen.getByPlaceholderText(
      'Header Value (optional)'
    );
    expect(headerValueInput.props.value).toEqual('Bearer token');
  });
});
