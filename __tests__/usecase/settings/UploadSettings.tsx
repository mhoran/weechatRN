import { fireEvent, render, screen, userEvent } from '../../../src/test-utils';
import UploadSettings from '../../../src/usecase/settings/UploadSettings';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../../src/store';

describe('UploadSettings', () => {
  it('stores the configured settings', async () => {
    const store = configureStore({ reducer });
    render(<UploadSettings setShowUploadSettings={jest.fn()} />, {
      store: store
    });

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

    const button = screen.getByText('Save');

    fireEvent(button, 'press');

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
    render(<UploadSettings setShowUploadSettings={jest.fn()} />, {
      store: store
    });

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

    const button = screen.getByText('Save');

    fireEvent(button, 'press');

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
    render(<UploadSettings setShowUploadSettings={jest.fn()} />, {
      store: store
    });

    const headerNameInput = screen.getByPlaceholderText(
      'Header Name (optional)'
    );
    await userEvent.type(headerNameInput, 'Authorization');

    const button = screen.getByText('Save');

    fireEvent(button, 'press');

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
    render(<UploadSettings setShowUploadSettings={jest.fn()} />, {
      store: store
    });

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
