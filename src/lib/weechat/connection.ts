import { WeeChatProtocol } from './parser';
import { transformToReduxAction } from './action_transformer';
import { StoreState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

const protocol = new WeeChatProtocol();

export default class WeechatConnection {
  dispatch: ThunkDispatch<StoreState, undefined, AnyAction>;
  hostname: string;
  password: string;
  ssl: boolean = true;
  compressed: boolean = false;
  websocket?: WebSocket;
  onSuccess: (conn: WeechatConnection) => void;
  onError: (reconnect: boolean) => void;
  connected: boolean;
  reconnect: boolean;

  constructor(
    dispatch: ThunkDispatch<StoreState, undefined, AnyAction>,
    host: string,
    password: string,
    ssl: boolean,
    onSuccess: (conn: WeechatConnection) => void,
    onError: (reconnect: boolean) => void
  ) {
    this.dispatch = dispatch;
    this.hostname = host;
    this.password = password;
    this.ssl = ssl;
    this.onSuccess = onSuccess;
    this.onError = onError;
    this.reconnect = this.connected = false;
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
    this.websocket.onclose = () => this.close();
  }

  onopen(): void {
    this.send(
      `init password=${this.password},compression=${
        this.compressed ? 'zlib' : 'off'
      }\n`
    );
    this.send('(version) info version');
    this.connected = true;
    this.onSuccess(this);
  }

  handleError(event: Event): void {
    console.log(event);
    this.reconnect = this.connected;
    this.onError(this.reconnect);
  }

  close(): void {
    this.connected = false;
    this.send('quit');
    this.websocket?.close();
    this.dispatch({
      type: 'DISCONNECT'
    });

    if (this.reconnect) {
      this.reconnect = false;
      this.openSocket();
    }
  }

  onmessage(event: WebSocketMessageEvent): void {
    const parsed = protocol.parse(event.data) as WeechatResponse<unknown>;

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
