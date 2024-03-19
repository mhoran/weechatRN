import { WeeChatProtocol } from './parser';
import { transformToReduxAction } from './action_transformer';
import { AppDispatch } from '../../store';
import { disconnectAction } from '../../store/actions';

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
  dispatch: AppDispatch;
  hostname: string;
  password: string;
  ssl: boolean = true;
  compressed: boolean = false;
  websocket?: WebSocket;
  onSuccess: (conn: WeechatConnection) => void;
  onError: (
    reconnect: boolean,
    connectionError: ConnectionError | null
  ) => void;
  reconnect = false;
  state = State.DISCONNECTED;

  constructor(
    dispatch: AppDispatch,
    host: string,
    password: string,
    ssl: boolean,
    onSuccess: (conn: WeechatConnection) => void,
    onError: (
      reconnect: boolean,
      connectionError: ConnectionError | null
    ) => void
  ) {
    this.dispatch = dispatch;
    this.hostname = host;
    this.password = password;
    this.ssl = ssl;
    this.onSuccess = onSuccess;
    this.onError = onError;
  }

  connect(): void {
    if (this.state !== State.DISCONNECTED) return;
    this.state = State.CONNECTING;
    this.openSocket();
  }

  openSocket(): void {
    this.websocket = new WebSocket(
      `${this.ssl ? 'wss' : 'ws'}://${this.hostname}/weechat`
    );

    this.websocket.onopen = () => this.onopen();
    this.websocket.onmessage = (event) => this.onmessage(event);
    this.websocket.onerror = (event) => this.handleError(event);
    this.websocket.onclose = () => this.handleClose();
  }

  onopen(): void {
    this.state = State.AUTHENTICATING;

    this.send(
      `init password=${this.password},compression=${
        this.compressed ? 'zlib' : 'off'
      }\n`
    );
    this.send('(version) info version');
  }

  handleError(event: Event): void {
    console.log(event);
    this.reconnect = this.state === State.CONNECTED;
    this.onError(this.reconnect, ConnectionError.Socket);
  }

  handleClose(): void {
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

  onmessage(event: WebSocketMessageEvent): void {
    const parsed = protocol.parse(event.data);

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
    if (!this.websocket) return;
    console.log('Sending data:', data);
    this.websocket.send(data + '\n');
  }

  isDisconnected(): boolean {
    return this.state === State.DISCONNECTED;
  }
}
