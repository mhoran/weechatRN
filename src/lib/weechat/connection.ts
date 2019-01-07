import { WeeChatProtocol } from "./parser";
import { transformToReduxAction } from "./action_transformer";

const protocol = new WeeChatProtocol();

export default class WeechatConnection {
  dispatch: any;
  hostname: string;
  password: string;
  ssl: boolean;
  compressed: boolean;
  websocket: WebSocket;
  onSuccess: (conn: WeechatConnection) => any;
  onError: (event: Event) => any;
  connected: boolean;
  reconnect: boolean;

  constructor(dispatch) {
    this.dispatch = dispatch;
    this.websocket = null;
  }

  connect(
    host: string,
    password: string = "",
    ssl: boolean,
    onSuccess: (conn: WeechatConnection) => any,
    onError: (event: Event) => any
  ) {
    this.hostname = host;
    this.password = password;
    this.ssl = ssl;
    this.onSuccess = onSuccess;
    this.onError = onError;

    this.openSocket();
  }

  openSocket() {
    this.websocket = new WebSocket(
      `${this.ssl ? "wss" : "ws"}://${this.hostname}/weechat`
    );

    this.websocket.onopen = () => this.onopen();
    this.websocket.onmessage = event => this.onmessage(event);
    this.websocket.onerror = event => this.handleError(event);
    this.websocket.onclose = event => this.close(event);
  }

  onopen() {
    this.dispatch({
      type: "SET_CONNECTION_INFO",
      hostname: this.hostname,
      password: this.password,
      ssl: this.ssl
    });
    this.send(
      `init password=${this.password},compression=${
        this.compressed ? "zlib" : "off"
      }\n`
    );
    this.send("(version) info version");
    this.connected = true;
    this.onSuccess(this);
  }

  handleError(event) {
    this.reconnect = this.connected && true;
    this.onError(event);
  }

  close(event) {
    this.connected = false;
    this.send("quit");
    this.websocket.close();
    this.dispatch({
      type: "DISCONNECT"
    });

    if (this.reconnect) {
      this.reconnect = false;
      this.openSocket();
    }
  }

  onmessage(event) {
    const parsed = protocol.parse(event.data) as WeechatResponse<any>;

    console.log("Parsed data:", parsed);
    try {
      const action = transformToReduxAction(parsed);
      if (action) {
        this.dispatch(action);
      }
    } catch (e) {
      console.log(e, parsed);
    }
  }

  send(data) {
    console.log("Sending data:", data);
    this.websocket.send(data + "\n");
  }
}
