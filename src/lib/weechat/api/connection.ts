import { Buffer } from 'buffer';
import type { AppDispatch } from '../../../store';
import type { ConnectionError } from '../connection';
import WeechatConnection, { AuthenticationError, State } from '../connection';
import actionFromResponse from './action_from_response';

export default class WeechatApiConnection extends WeechatConnection {
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
    super(dispatch, onError, hostname, path || '/api', ssl);
  }

  protected openSocket(): void {
    this.websocket = new WebSocket(this.url.toString(), [
      'api.weechat',
      `base64url.bearer.authorization.weechat.${Buffer.from(`plain:${this.password}`).toString('base64')}`
    ]);

    this.websocket.onopen = () => this.onopen();
    this.websocket.onmessage = (event) => this.onmessage(event);
    this.websocket.onclose = (event) => this.handleClose(event);
  }

  protected onopen(): void {
    this.send({ request: 'GET /api/version', request_id: 'version' });
  }

  protected handleClose(event: CloseEvent) {
    if (this.state === State.CONNECTING && event.reason.includes('401')) {
      this.state = State.DISCONNECTED;
      this.onError(false, new AuthenticationError());
      return;
    }

    super.handleClose(event);
  }

  protected onmessage(event: WebSocketMessageEvent): void {
    const parsed: unknown = JSON.parse(event.data as string);

    if (this.state === State.CONNECTING) {
      this.state = State.CONNECTED;
      this.onSuccess(this);
    }

    try {
      const action = actionFromResponse(parsed);
      if (action) {
        this.dispatch(action);
      }
    } catch (e) {
      console.log(e, parsed);
    }
  }

  send(object: unknown) {
    super.send(JSON.stringify(object));
  }
}
