import { render, screen } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import type { FetchResponse } from 'expo/build/winter/fetch/FetchResponse';
import { fetch } from 'expo/fetch';
import * as fs from 'fs';
import path from 'path';
import type { TapGesture } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId
} from 'react-native-gesture-handler/jest-utils';
import UploadButton from '../../../../src/usecase/buffers/ui/UploadButton';

const mockFile = new Blob([
  new Uint8Array(fs.readFileSync(path.join(__dirname, 'test.jpg')))
]);
jest.mock('expo-file-system', () => {
  return {
    File: jest.fn().mockImplementation(() => mockFile)
  };
});

const mockedFetch = jest.mocked(fetch);

describe('UploadButton', () => {
  let resolveUpload: (result: FetchResponse) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(ImagePicker, 'launchImageLibraryAsync')
      .mockImplementation(() => {
        return Promise.resolve({
          assets: [{ uri: 'file:///tmp/image.jpg' }]
        } as ImagePicker.ImagePickerResult);
      });
    mockedFetch.mockImplementation(() => {
      return new Promise((resolve) => (resolveUpload = resolve));
    });
  });

  it('uploads an image from library on press', async () => {
    const onUpload = jest.fn();
    const uploadOptions = {
      url: 'https://example.com',
      basicAuth: true,
      username: 'test',
      password: 'changeme'
    };
    render(<UploadButton onUpload={onUpload} uploadOptions={uploadOptions} />);

    fireGestureHandler<TapGesture>(getByGestureTestId('uploadButtonSingleTap'));

    await screen.findByLabelText('Image Uploading');

    resolveUpload({
      status: 200,
      text: () => Promise.resolve('https://example.com/image.jpg')
    } as FetchResponse);

    await screen.findByLabelText('Upload Image');

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1
    });
    expect(fetch).toHaveBeenCalledWith('https://example.com', {
      method: 'POST',
      body: expect.any(FormData),
      headers: {
        Authorization:
          'Basic ' + Buffer.from('test:changeme').toString('base64')
      }
    });

    const fetchOptions = mockedFetch.mock.calls[0][1];
    expect(fetchOptions).not.toBeNull();
    const formData = fetchOptions!.body as FormData;
    expect(formData.has('file')).toEqual(true);
    const blob = formData.get('file') as Blob;
    expect(await blob.bytes()).toEqual(await mockFile.bytes());

    expect(onUpload).toHaveBeenCalledWith('https://example.com/image.jpg');
  });

  it('hides the button when the url is empty', () => {
    const uploadOptions = {
      url: '',
      basicAuth: false
    };
    render(<UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />);

    expect(screen.queryByLabelText('Upload Image')).toBeNull();
  });

  it('hides the button when the field name is empty', () => {
    const uploadOptions = {
      url: 'https://example.com',
      fieldName: '',
      basicAuth: false
    };
    render(<UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />);

    expect(screen.queryByLabelText('Upload Image')).toBeNull();
  });

  describe('basic auth disabled', () => {
    it('shows the button when the url is not empty', () => {
      const uploadOptions = {
        url: 'https://example.com',
        basicAuth: false
      };
      render(
        <UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />
      );

      expect(screen.queryByLabelText('Upload Image')).not.toBeNull();
    });

    it('does not overwrite the authorization header', async () => {
      const uploadOptions = {
        url: 'https://example.com',
        basicAuth: false,
        headers: { Authorization: 'Bearer token' }
      };
      render(
        <UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />
      );

      fireGestureHandler<TapGesture>(
        getByGestureTestId('uploadButtonSingleTap')
      );

      await screen.findByLabelText('Image Uploading');

      resolveUpload({
        status: 200,
        text: () => Promise.resolve('https://example.com/image.jpg')
      } as FetchResponse);

      await screen.findByLabelText('Upload Image');

      expect(fetch).toHaveBeenCalledWith('https://example.com', {
        method: 'POST',
        body: expect.any(FormData),
        headers: {
          Authorization: 'Bearer token'
        }
      });
    });
  });

  describe('basic auth enabled', () => {
    it('hides the button when the username or password is empty', () => {
      const uploadOptions = {
        url: 'https://example.com',
        basicAuth: true,
        username: '',
        password: ''
      };
      const { rerender } = render(
        <UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />
      );

      expect(screen.queryByLabelText('Upload Image')).toBeNull();

      rerender(
        <UploadButton
          onUpload={jest.fn()}
          uploadOptions={{ ...uploadOptions, username: 'test', password: '' }}
        />
      );

      expect(screen.queryByLabelText('Upload Image')).toBeNull();

      rerender(
        <UploadButton
          onUpload={jest.fn()}
          uploadOptions={{
            ...uploadOptions,
            username: '',
            password: 'changeme'
          }}
        />
      );

      expect(screen.queryByLabelText('Upload Image')).toBeNull();
    });
  });
});
