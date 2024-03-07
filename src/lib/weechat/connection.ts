import { WeeChatProtocol } from './parser';
import { transformToReduxAction } from './action_transformer';
import { AppDispatch } from '../../store';

const protocol = new WeeChatProtocol();

export enum ConnectionError {
  Socket = 1,
  Authentication
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
  connected: boolean;
  reconnect: boolean;
  authenticating: boolean;

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
    this.reconnect = this.connected = this.authenticating = false;
  }

  connect(): void {
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
    this.authenticating = true;

    this.send(
      `init password=${this.password},compression=${
        this.compressed ? 'zlib' : 'off'
      }\n`
    );
    this.send('(version) info version');
  }

  handleError(event: Event): void {
    console.log(event);
    this.reconnect = this.connected;
    this.onError(this.reconnect, ConnectionError.Socket);
  }

  handleClose(): void {
    if (this.authenticating) {
      this.onError(false, ConnectionError.Authentication);
      return;
    }

    this.connected = false;
    this.dispatch({
      type: 'DISCONNECT'
    });

    if (this.reconnect) {
      this.reconnect = false;
      this.openSocket();
    }
  }

  close(): void {
    this.send('quit');
    this.websocket?.close();
  }

  onmessage(event: WebSocketMessageEvent): void {
    const parsed = protocol.parse(event.data);

    if (parsed.id === 'version') {
      this.authenticating = false;
      this.connected = true;
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
}
