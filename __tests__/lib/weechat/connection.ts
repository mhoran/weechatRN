import WeechatConnection, {
  ConnectionError
} from '../../../src/lib/weechat/connection';
import {
  disconnectAction,
  fetchVersionAction
} from '../../../src/store/actions';

const mockWebSocket = jest.fn(function () {
  this.send = jest.fn();
  this.close = jest.fn(() => this.onclose());
  return this;
});

describe(WeechatConnection, () => {
  let realWebSocket: typeof WebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    realWebSocket = window.WebSocket;
    window.WebSocket = mockWebSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    window.WebSocket = realWebSocket;
  });

  it('calls onError when authentication fails', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const connection = new WeechatConnection(
      jest.fn(),
      'example.com',
      'changeme',
      true,
      onSuccess,
      onError
    );
    connection.connect();

    mockWebSocket.mock.instances[0].onopen();

    expect(mockWebSocket.mock.instances[0].send).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('init password=changeme,compression=off')
    );

    expect(mockWebSocket.mock.instances[0].send).toHaveBeenNthCalledWith(
      2,
      '(version) info version\n'
    );

    mockWebSocket.mock.instances[0].onclose();

    expect(onError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess when authentication succeeds', () => {
    const dispatch = jest.fn();
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const connection = new WeechatConnection(
      dispatch,
      'example.com',
      'changeme',
      true,
      onSuccess,
      onError
    );
    connection.connect();

    mockWebSocket.mock.instances[0].onopen();

    expect(mockWebSocket.mock.instances[0].send).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('init password=changeme,compression=off')
    );

    expect(mockWebSocket.mock.instances[0].send).toHaveBeenNthCalledWith(
      2,
      '(version) info version\n'
    );

    mockWebSocket.mock.instances[0].onmessage({
      data: Buffer.from(
        '\x00\x00\x00\x27\x00\x00\x00\x00\x07\x76\x65\x72\x73\x69\x6f\x6e\x69\x6e\x66\x00\x00\x00\x07\x76\x65\x72\x73\x69\x6f\x6e\x00\x00\x00\x05\x34\x2e\x31\x2e\x32'
      )
    } as WebSocketMessageEvent);

    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(fetchVersionAction('4.1.2'));
  });

  describe('close', () => {
    it('closes the WebSocket', () => {
      const dispatch = jest.fn();
      const connection = new WeechatConnection(
        dispatch,
        'example.com',
        'changeme',
        true,
        jest.fn(),
        jest.fn()
      );
      connection.connect();

      expect(mockWebSocket.mock.instances).toHaveLength(1);

      mockWebSocket.mock.instances[0].onopen();
      mockWebSocket.mock.instances[0].onmessage({
        data: Buffer.from(
          '\x00\x00\x00\x27\x00\x00\x00\x00\x07\x76\x65\x72\x73\x69\x6f\x6e\x69\x6e\x66\x00\x00\x00\x07\x76\x65\x72\x73\x69\x6f\x6e\x00\x00\x00\x05\x34\x2e\x31\x2e\x32'
        )
      } as WebSocketMessageEvent);

      connection.close();

      expect(mockWebSocket.mock.instances[0].send).toHaveBeenCalledWith(
        'quit\n'
      );
      expect(mockWebSocket.mock.instances[0].close).toHaveBeenCalled();
      expect(dispatch).toHaveBeenNthCalledWith(2, disconnectAction());
      expect(mockWebSocket.mock.instances).toHaveLength(1);
    });

    it('reconnects on error', () => {
      const dispatch = jest.fn();
      const onError = jest.fn();
      const connection = new WeechatConnection(
        dispatch,
        'example.com',
        'changeme',
        true,
        jest.fn(),
        onError
      );
      connection.connect();

      expect(mockWebSocket.mock.instances).toHaveLength(1);

      mockWebSocket.mock.instances[0].onopen();
      mockWebSocket.mock.instances[0].onmessage({
        data: Buffer.from(
          '\x00\x00\x00\x27\x00\x00\x00\x00\x07\x76\x65\x72\x73\x69\x6f\x6e\x69\x6e\x66\x00\x00\x00\x07\x76\x65\x72\x73\x69\x6f\x6e\x00\x00\x00\x05\x34\x2e\x31\x2e\x32'
        )
      } as WebSocketMessageEvent);
      mockWebSocket.mock.instances[0].onerror();
      mockWebSocket.mock.instances[0].close();

      expect(onError).toHaveBeenCalledWith(true, ConnectionError.Socket);
      expect(dispatch).toHaveBeenNthCalledWith(2, disconnectAction());
      expect(mockWebSocket.mock.instances).toHaveLength(2);
    });
  });
});
