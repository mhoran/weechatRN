import WeechatConnection from '../../../src/lib/weechat/connection';

const mockWebSocket = jest.fn(function () {
  this.send = jest.fn();
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
    expect(dispatch).toHaveBeenCalledWith({
      type: 'FETCH_VERSION',
      payload: '4.1.2'
    });
  });
});
