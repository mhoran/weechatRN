interface NativeEvents {
  readonly open: { readonly id: number };
  readonly message: {
    readonly id: number;
    readonly text?: string;
    readonly data?: Uint8Array;
  };
  readonly close: {
    readonly id: number;
    readonly code: number;
    readonly reason: string;
    readonly wasClean: boolean;
  };
}

export interface URLSessionWebSocketModule {
  connect(url: string, protocols: ReadonlyArray<string>): number;
  sendText(id: number, text: string): void;
  close(id: number, code: number, reason: string): void;
  addListener<K extends keyof NativeEvents>(
    event: K,
    listener: (event: NativeEvents[K]) => void
  ): { remove(): void };
}

export class Connection {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState: 0 | 1 | 2 | 3 = Connection.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose:
    | ((event: { code: number; reason: string; wasClean: boolean }) => void)
    | null = null;

  readonly #id: number;
  readonly #sockets: Sockets;

  constructor(
    sockets: Sockets,
    url: string,
    protocols: ReadonlyArray<string> = []
  ) {
    this.#sockets = sockets;
    this.#id = sockets.native.connect(url, protocols);
    sockets.register(this.#id, this);
  }

  send(data: string): void {
    if (this.readyState === Connection.CONNECTING) {
      throw new Error('InvalidStateError: WebSocket is still connecting');
    }
    if (this.readyState !== Connection.OPEN) return;
    this.#sockets.native.sendText(this.#id, data);
  }

  close(code = 1000, reason = ''): void {
    if (this.readyState >= Connection.CLOSING) return;
    this.readyState = Connection.CLOSING;
    this.#sockets.native.close(this.#id, code, reason);
  }

  handleOpen(): void {
    if (this.readyState !== Connection.CONNECTING) return;
    this.readyState = Connection.OPEN;
    this.onopen?.();
  }

  handleMessage(event: NativeEvents['message']): void {
    if (this.readyState !== Connection.OPEN) return;
    const bytes = event.data;
    const data =
      event.text ??
      (bytes &&
      bytes.byteOffset === 0 &&
      bytes.byteLength === bytes.buffer.byteLength
        ? bytes.buffer
        : bytes?.slice().buffer);
    this.onmessage?.({ data });
  }

  handleClose({ code, reason, wasClean }: NativeEvents['close']): void {
    if (this.readyState === Connection.CLOSED) return;
    this.readyState = Connection.CLOSED;
    this.#sockets.unregister(this.#id);
    this.onclose?.({ code, reason, wasClean });
  }
}

export class Sockets {
  readonly native: URLSessionWebSocketModule;
  readonly #open = new Map<number, Connection>();
  readonly #subscriptions: ReadonlyArray<{ remove(): void }>;

  constructor(native: URLSessionWebSocketModule) {
    this.native = native;
    this.#subscriptions = [
      native.addListener('open', (event) =>
        this.#open.get(event.id)?.handleOpen()
      ),
      native.addListener('message', (event) =>
        this.#open.get(event.id)?.handleMessage(event)
      ),
      native.addListener('close', (event) =>
        this.#open.get(event.id)?.handleClose(event)
      )
    ];
  }

  register(id: number, socket: Connection): void {
    this.#open.set(id, socket);
  }

  unregister(id: number): void {
    this.#open.delete(id);
  }

  dispose(): void {
    for (const subscription of this.#subscriptions) subscription.remove();
    for (const socket of this.#open.values()) {
      socket.close(1001);
      socket.handleClose({ id: 0, code: 1001, reason: '', wasClean: false });
    }
  }
}
