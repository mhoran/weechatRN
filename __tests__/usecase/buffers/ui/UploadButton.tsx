import { render, screen } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import type { TapGesture } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId
} from 'react-native-gesture-handler/jest-utils';
import UploadButton from '../../../../src/usecase/buffers/ui/UploadButton';

jest.mock('expo-file-system', () => {
  const FileSystem = jest.requireActual('expo-file-system');
  return {
    FileSystemUploadType: FileSystem.FileSystemUploadType,
    uploadAsync: jest.fn()
  };
});
const mockedFileSystem = jest.mocked(FileSystem);

describe('UploadButton', () => {
  let resolveUpload: (result: FileSystem.FileSystemUploadResult) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(ImagePicker, 'launchImageLibraryAsync')
      .mockImplementation(() => {
        return Promise.resolve({
          assets: [{ uri: 'file:///tmp/image.jpg' }]
        } as ImagePicker.ImagePickerResult);
      });

    mockedFileSystem.uploadAsync.mockImplementation(() => {
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
      body: 'https://example.com/image.jpg'
    } as FileSystem.FileSystemUploadResult);

    await screen.findByLabelText('Upload Image');

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1
    });
    expect(FileSystem.uploadAsync).toHaveBeenCalledWith(
      'https://example.com',
      'file:///tmp/image.jpg',
      {
        fieldName: 'file',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          Authorization:
            'Basic ' + Buffer.from('test:changeme').toString('base64')
        }
      }
    );
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
        body: 'https://example.com/image.jpg'
      } as FileSystem.FileSystemUploadResult);

      await screen.findByLabelText('Upload Image');

      expect(FileSystem.uploadAsync).toHaveBeenCalledWith(
        'https://example.com',
        'file:///tmp/image.jpg',
        {
          fieldName: 'file',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: {
            Authorization: 'Bearer token'
          }
        }
      );
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
