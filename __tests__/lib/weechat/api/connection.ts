import WeechatApiConnection from '../../../../src/lib/weechat/api/connection';
import type { ConnectionError } from '../../../../src/lib/weechat/connection';
import {
  disconnectAction,
  fetchVersionAction
} from '../../../../src/store/actions';

const mockWebSocket = jest.fn(function () {
  this.readyState = WebSocket.OPEN;
  this.send = jest.fn();
  this.close = jest.fn(() => {
    this.readyState = WebSocket.CLOSED;
    this.onclose({ code: 1000 });
  });
  return this;
});

describe(WeechatApiConnection, () => {
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
    const connection = new WeechatApiConnection(
      jest.fn(),
      'example.com',
      null,
      'changeme',
      true,
      onSuccess,
      onError
    );
    connection.connect();

    mockWebSocket.mock.instances[0].onopen();

    expect(mockWebSocket).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('wss://example.com/api'),
      expect.arrayContaining([
        'api.weechat',
        'base64url.bearer.authorization.weechat.cGxhaW46Y2hhbmdlbWU='
      ])
    );

    expect(mockWebSocket.mock.instances[0].send).toHaveBeenNthCalledWith(
      1,
      `${JSON.stringify({ request: 'GET /api/version', request_id: 'version' })}\n`
    );

    mockWebSocket.mock.instances[0].onclose({ code: 1006, reason: '401' });

    expect(onError).toHaveBeenCalledWith(
      false,
      expect.objectContaining<ConnectionError>({
        message: expect.any(Function)
      })
    );
    expect(onError.mock.calls[0][1].message()).toMatch(
      /Failed to authenticate with weechat relay/
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess when authentication succeeds', () => {
    const dispatch = jest.fn();
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const connection = new WeechatApiConnection(
      dispatch,
      'example.com',
      null,
      'changeme',
      true,
      onSuccess,
      onError
    );
    connection.connect();

    mockWebSocket.mock.instances[0].onopen();

    expect(mockWebSocket).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('wss://example.com/api'),
      expect.arrayContaining([
        'api.weechat',
        'base64url.bearer.authorization.weechat.cGxhaW46Y2hhbmdlbWU='
      ])
    );

    expect(mockWebSocket.mock.instances[0].send).toHaveBeenNthCalledWith(
      1,
      `${JSON.stringify({ request: 'GET /api/version', request_id: 'version' })}\n`
    );

    mockWebSocket.mock.instances[0].onmessage({
      data: JSON.stringify({
        request_id: 'version',
        code: 200,
        body_type: 'version',
        body: { weechat_version: '4.10.0' }
      })
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(fetchVersionAction('4.10.0'));
  });

  describe('disconnect', () => {
    it('closes the WebSocket', () => {
      const dispatch = jest.fn();
      const connection = new WeechatApiConnection(
        dispatch,
        'example.com',
        null,
        'changeme',
        true,
        jest.fn(),
        jest.fn()
      );
      connection.connect();

      expect(mockWebSocket.mock.instances).toHaveLength(1);

      mockWebSocket.mock.instances[0].onopen();
      mockWebSocket.mock.instances[0].onmessage({
        data: JSON.stringify({
          request_id: 'version',
          code: 200,
          body_type: 'version',
          body: { weechat_version: '4.10.0' }
        })
      });

      connection.disconnect();

      expect(mockWebSocket.mock.instances[0].close).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(2, disconnectAction());
      expect(mockWebSocket.mock.instances).toHaveLength(1);
    });

    it('reconnects on error', () => {
      const dispatch = jest.fn();
      const onError = jest.fn();
      const connection = new WeechatApiConnection(
        dispatch,
        'example.com',
        null,
        'changeme',
        true,
        jest.fn(),
        onError
      );
      connection.connect();

      expect(mockWebSocket.mock.instances).toHaveLength(1);

      mockWebSocket.mock.instances[0].onopen();
      mockWebSocket.mock.instances[0].onmessage({
        data: JSON.stringify({
          request_id: 'version',
          code: 200,
          body_type: 'version',
          body: { weechat_version: '4.10.0' }
        })
      });
      mockWebSocket.mock.instances[0].onclose({ code: 1006 });

      expect(onError).toHaveBeenCalledWith(
        true,
        expect.objectContaining<ConnectionError>({
          message: expect.any(Function)
        })
      );
      expect(onError.mock.calls[0][1].message()).toMatch(
        /Failed to connect to weechat relay/
      );
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(2, disconnectAction());
      expect(mockWebSocket.mock.instances).toHaveLength(2);
    });
  });

  describe('send', () => {
    it('does not send the message when disconnected', () => {
      const dispatch = jest.fn();
      const connection = new WeechatApiConnection(
        dispatch,
        'example.com',
        null,
        'changeme',
        true,
        jest.fn(),
        jest.fn()
      );
      connection.connect();

      expect(mockWebSocket.mock.instances).toHaveLength(1);

      mockWebSocket.mock.instances[0].onopen();
      mockWebSocket.mock.instances[0].onmessage({
        data: JSON.stringify({
          request_id: 'version',
          code: 200,
          body_type: 'version',
          body: { weechat_version: '4.10.0' }
        })
      });

      connection.disconnect();

      connection.send(
        '(input) input 0x845963200 This message should not be sent.'
      );
      expect(mockWebSocket.mock.instances[0].send).not.toHaveBeenCalledWith(
        '(input) input 0x845963200 This message should not be sent.'
      );
    });
  });
});
