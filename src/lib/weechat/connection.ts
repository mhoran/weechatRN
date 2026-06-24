import type { AppDispatch } from '../../store';
import { disconnectAction } from '../../store/actions';

export interface ConnectionError {
  message: () => string;
}

class SocketError implements ConnectionError {
  message = () => {
    return 'Failed to connect to weechat relay. Check hostname and SSL configuration.';
  };
}

export class AuthenticationError implements ConnectionError {
  message = () => {
    return 'Failed to authenticate with weechat relay. Check password.';
  };
}

export enum State {
  CONNECTING = 1,
  AUTHENTICATING,
  CONNECTED,
  DISCONNECTED
}

export default abstract class WeechatConnection {
  protected websocket?: WebSocket;
  protected state = State.DISCONNECTED;
  protected url: URL;

  constructor(
    protected dispatch: AppDispatch,
    protected onError: (
      reconnect: boolean,
      connectionError: ConnectionError | null
    ) => void,
    hostname: string,
    path: string | null,
    ssl: boolean
  ) {
    try {
      this.url = new URL(
        path || '/weechat',
        `${ssl ? 'wss' : 'ws'}://${hostname}`
      );
    } catch (e) {
      throw Error('Failed to construct a valid URL from hostname and path', {
        cause: e
      });
    }
  }

  connect(): void {
    if (this.state !== State.DISCONNECTED) return;
    this.state = State.CONNECTING;
    this.openSocket();
  }

  protected abstract openSocket(): void;

  protected abstract onopen(): void;

  protected handleClose(event: CloseEvent): void {
    if (this.state === State.DISCONNECTED) return;

    let reconnect = false;

    if (event.code === 1006) {
      reconnect = this.state === State.CONNECTED;
      this.onError(reconnect, new SocketError());
    }

    this.state = State.DISCONNECTED;
    this.dispatch(disconnectAction());

    if (reconnect) {
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

  protected abstract onmessage(event: WebSocketMessageEvent): void;

  send(data: string): void {
    if (this.websocket?.readyState !== WebSocket.OPEN) return;
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
