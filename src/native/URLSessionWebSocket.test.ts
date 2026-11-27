import type { URLSessionWebSocketModule } from './URLSessionWebSocket';
import { Connection, Sockets } from './URLSessionWebSocket';

describe(Connection, () => {
  let listeners: Map<string, (event: never) => void>;
  let subscriptions: { remove: jest.Mock }[];
  let native: ReturnType<typeof createNative>;
  let sockets: Sockets;
  let nextId: number;

  function createNative() {
    return {
      connect: jest.fn(
        (_url: string, _protocols: ReadonlyArray<string>) => ++nextId
      ),
      sendText: jest.fn(),
      close: jest.fn(),
      addListener: jest.fn((type: string, listener: (event: never) => void) => {
        listeners.set(type, listener);
        const subscription = { remove: jest.fn() };
        subscriptions.push(subscription);
        return subscription;
      })
    };
  }

  beforeEach(() => {
    listeners = new Map();
    subscriptions = [];
    nextId = 0;
    native = createNative();
    sockets = new Sockets(native as URLSessionWebSocketModule);
  });

  afterEach(() => {
    sockets.dispose();
  });

  function emit(type: string, event: object) {
    listeners.get(type)?.(event as never);
  }

  function open(url = 'wss://example.com', protocols?: string[]) {
    const socket = new Connection(sockets, url, protocols);
    socket.onopen = jest.fn();
    socket.onmessage = jest.fn();
    socket.onclose = jest.fn();
    emit('open', { id: nextId });
    return socket;
  }

  it('connects with the URL and protocols', () => {
    new Connection(sockets, 'wss://example.com/a', ['one', 'two']);
    new Connection(sockets, 'wss://example.com/b');

    expect(native.connect).toHaveBeenNthCalledWith(1, 'wss://example.com/a', [
      'one',
      'two'
    ]);
    expect(native.connect).toHaveBeenNthCalledWith(
      2,
      'wss://example.com/b',
      []
    );
  });

  it('opens once', () => {
    const socket = new Connection(sockets, 'wss://example.com');
    const onopen = jest.fn();
    socket.onopen = onopen;
    expect(socket.readyState).toBe(Connection.CONNECTING);

    emit('open', { id: 1 });
    emit('open', { id: 1 });

    expect(socket.readyState).toBe(Connection.OPEN);
    expect(onopen).toHaveBeenCalledTimes(1);
  });

  it('throws when sending while connecting', () => {
    const socket = new Connection(sockets, 'wss://example.com');

    expect(() => socket.send('hello')).toThrow(/still connecting/);
    expect(native.sendText).not.toHaveBeenCalled();
  });

  it('sends text when open', () => {
    const socket = open();

    socket.send('hello');

    expect(native.sendText).toHaveBeenCalledWith(1, 'hello');
  });

  it('delivers text messages as strings', () => {
    const socket = open();

    emit('message', { id: 1, text: 'hello' });

    expect(socket.onmessage).toHaveBeenCalledWith({ data: 'hello' });
  });

  it('ignores messages before open', () => {
    const socket = new Connection(sockets, 'wss://example.com');
    const onmessage = jest.fn();
    socket.onmessage = onmessage;

    emit('message', { id: 1, text: 'hello' });

    expect(onmessage).not.toHaveBeenCalled();
  });

  it('delivers the exact binary message as an ArrayBuffer', () => {
    const socket = open();
    emit('message', {
      id: 1,
      data: new Uint8Array([99, 1, 2, 88]).subarray(1, 3)
    });

    const data: unknown = jest.mocked(socket.onmessage!).mock.calls[0][0].data;
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(Array.from(new Uint8Array(data as ArrayBuffer))).toEqual([1, 2]);
  });

  it('delivers a whole-buffer binary message without copying', () => {
    const socket = open();
    const bytes = new Uint8Array([1, 2, 3]);
    emit('message', { id: 1, data: bytes });

    expect(socket.onmessage).toHaveBeenCalledWith({ data: bytes.buffer });
  });

  it.each([
    [1006, 'Received bad response code from server: 401.', false],
    [1006, 'The network connection was lost.', false],
    [1001, 'Stream end encountered', false],
    [1000, 'Server requested shutdown', true]
  ])(
    'passes through close code %i, reason "%s" and wasClean %s',
    (code, reason, wasClean) => {
      const socket = open();
      emit('close', { id: 1, code, reason, wasClean });

      expect(socket.readyState).toBe(Connection.CLOSED);
      expect(socket.onclose).toHaveBeenCalledWith({ code, reason, wasClean });
    }
  );

  it('closes before open', () => {
    const socket = new Connection(sockets, 'wss://example.com');

    socket.close();

    expect(socket.readyState).toBe(Connection.CLOSING);
    expect(native.close).toHaveBeenCalledWith(1, 1000, '');
  });

  it('closes once with the given code and reason', () => {
    const socket = open();

    socket.close(4000, 'bye');
    socket.close();

    expect(socket.readyState).toBe(Connection.CLOSING);
    expect(native.close).toHaveBeenCalledTimes(1);
    expect(native.close).toHaveBeenCalledWith(1, 4000, 'bye');
  });

  it('drops sends after close', () => {
    const socket = open();

    socket.close();
    socket.send('hello');
    emit('close', { id: 1, code: 1000, reason: '', wasClean: true });
    socket.send('hello');

    expect(native.sendText).not.toHaveBeenCalled();
  });

  it('routes events to the socket with the matching id', () => {
    const first = open('wss://example.com/first');
    const second = open('wss://example.com/second');

    emit('message', { id: 2, text: 'second' });
    emit('close', { id: 1, code: 1000, reason: '', wasClean: true });

    expect(first.onmessage).not.toHaveBeenCalled();
    expect(second.onmessage).toHaveBeenCalledWith({ data: 'second' });
    expect(first.onclose).toHaveBeenCalledTimes(1);
    expect(second.onclose).not.toHaveBeenCalled();
    expect(second.readyState).toBe(Connection.OPEN);
  });

  it('ignores events after close', () => {
    const socket = open();
    emit('close', { id: 1, code: 1000, reason: '', wasClean: true });

    emit('message', { id: 1, text: 'late' });
    emit('close', { id: 1, code: 1006, reason: 'late', wasClean: false });

    expect(socket.onmessage).not.toHaveBeenCalled();
    expect(socket.onclose).toHaveBeenCalledTimes(1);
  });

  it('closes open sockets and unsubscribes on dispose', () => {
    const socket = open();

    sockets.dispose();

    expect(native.close).toHaveBeenCalledWith(1, 1001, '');
    expect(socket.onclose).toHaveBeenCalledWith({
      code: 1001,
      reason: '',
      wasClean: false
    });
    expect(subscriptions).toHaveLength(3);
    for (const subscription of subscriptions) {
      expect(subscription.remove).toHaveBeenCalled();
    }
  });
});
