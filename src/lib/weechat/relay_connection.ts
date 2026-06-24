import type { AppDispatch } from '../../store';
import { transformToReduxAction } from './action_transformer';
import type { ConnectionError } from './connection';
import WeechatConnection, { AuthenticationError, State } from './connection';
import { WeeChatProtocol } from './parser';

const protocol = new WeeChatProtocol();

export default class WeechatRelayConnection extends WeechatConnection {
  private compressed = false;

  constructor(
    protected dispatch: AppDispatch,
    hostname: string,
    path: string | null,
    private password: string,
    ssl: boolean,
    private onSuccess: (conn: WeechatConnection) => void,
    protected onError: (
      reconnect: boolean,
      connectionError: ConnectionError | null
    ) => void
  ) {
    super(dispatch, onError, hostname, path || '/weechat', ssl);
  }

  protected openSocket(): void {
    this.websocket = new WebSocket(this.url.toString());

    this.websocket.onopen = () => this.onopen();
    this.websocket.onmessage = (event) => this.onmessage(event);
    this.websocket.onclose = (event) => this.handleClose(event);
  }

  protected onopen(): void {
    this.state = State.AUTHENTICATING;

    this.send(
      `init password=${this.password},compression=${
        this.compressed ? 'zlib' : 'off'
      }\n`
    );
    this.send('(version) info version');
  }

  protected handleClose(event: CloseEvent) {
    if (this.state === State.AUTHENTICATING) {
      this.state = State.DISCONNECTED;
      this.onError(false, new AuthenticationError());
      return;
    }

    super.handleClose(event);
  }

  protected onmessage(event: WebSocketMessageEvent): void {
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
}
