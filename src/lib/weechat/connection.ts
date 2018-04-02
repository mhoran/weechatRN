import { WeeChatProtocol } from "./parser";
import { transformToReduxAction } from "./action_transformer";

const protocol = new WeeChatProtocol();

export default class WeechatConnection {
  dispatch: any;
  host: string;
  password: string;
  compressed: boolean;
  websocket: WebSocket;

  constructor(dispatch) {
    this.dispatch = dispatch;
    this.websocket = null;
  }

  connect(host, password = "", onSuccess, onError) {
    this.host = host;
    this.password = password;

    this.websocket = new WebSocket(this.host);

    this.websocket.onopen = () => this.onopen(onSuccess);
    this.websocket.onmessage = event => this.onmessage(event);
    this.websocket.onerror = onError;
  }

  onopen(callback) {
    this.send(
      `init password=${this.password},compression=${
        this.compressed ? "zlib" : "off"
      }\n`
    );
    this.send("(version) info version");
    callback(this);
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
