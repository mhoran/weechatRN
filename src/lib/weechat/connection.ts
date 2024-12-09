import type { AppDispatch } from '../../store';
import { disconnectAction } from '../../store/actions';
import { transformToReduxAction } from './action_transformer';
import { WeeChatProtocol } from './parser';

const protocol = new WeeChatProtocol();

export enum ConnectionError {
  Socket = 1,
  Authentication
}

enum State {
  CONNECTING = 1,
  AUTHENTICATING,
  CONNECTED,
  DISCONNECTED
}

export default class WeechatConnection {
  private compressed = false;
  private websocket?: WebSocket;
  private reconnect = false;
  private state = State.DISCONNECTED;

  constructor(
    private dispatch: AppDispatch,
    private hostname: string,
    private password: string,
    private ssl: boolean,
    private onSuccess: (conn: WeechatConnection) => void,
    private onError: (
      reconnect: boolean,
      connectionError: ConnectionError | null
    ) => void
  ) {}

  connect(): void {
    if (this.state !== State.DISCONNECTED) return;
    this.state = State.CONNECTING;
    this.openSocket();
  }

  private openSocket(): void {
    this.websocket = new WebSocket(
      `${this.ssl ? 'wss' : 'ws'}://${this.hostname}/weechat`
    );

    this.websocket.onopen = () => this.onopen();
    this.websocket.onmessage = (event) => this.onmessage(event);
    this.websocket.onerror = (event) => this.handleError(event);
    this.websocket.onclose = () => this.handleClose();
  }

  private onopen(): void {
    this.state = State.AUTHENTICATING;

    this.send(
      `init password=${this.password},compression=${
        this.compressed ? 'zlib' : 'off'
      }\n`
    );
    this.send('(version) info version');
  }

  private handleError(event: Event): void {
    console.log(event);
    this.reconnect = this.state === State.CONNECTED;
    this.onError(this.reconnect, ConnectionError.Socket);
  }

  private handleClose(): void {
    if (this.state === State.AUTHENTICATING) {
      this.state = State.DISCONNECTED;
      this.onError(false, ConnectionError.Authentication);
      return;
    }

    if (this.state === State.DISCONNECTED) return;

    this.state = State.DISCONNECTED;
    this.dispatch(disconnectAction());

    if (this.reconnect) {
      this.reconnect = false;
      this.connect();
    }
  }

  disconnect(): void {
    this.state = State.DISCONNECTED;
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.close();
    }
    this.dispatch(disconnectAction());
  }

  private onmessage(event: WebSocketMessageEvent): void {
    const parsed = protocol.parse(event.data as ArrayBuffer);

    if (parsed.id === 'version') {
      this.state = State.CONNECTED;
      this.onSuccess(this);
    }

    console.log('Parsed data:', parsed);
    try {
      const action = transformToReduxAction(parsed);
      if (action) {
        this.dispatch(action);
      }
    } catch (e) {
      console.log(e, parsed);
    }
  }

  send(data: string): void {
    if (this.state === State.DISCONNECTED) return;
    console.log('Sending data:', data);
    this.websocket?.send(data + '\n');
  }

  isConnected(): boolean {
    return this.state === State.CONNECTED;
  }

  isDisconnected(): boolean {
    return this.state === State.DISCONNECTED;
  }
}
