import { WeeChatProtocol } from "./parser";
import { transformToReduxAction } from "./action_transformer";

const protocol = new WeeChatProtocol();

export default class WeechatConnection {
  dispatch: any;
  host: string;
  password: string;
  websocket: WebSocket;

  constructor(dispatch, host, password = "") {
    this.dispatch = dispatch;
    this.host = host;
    this.password = password;
    this.websocket = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(this.host);

      this.websocket.onopen = () => resolve(this);
      this.websocket.onmessage = event => this.onmessage(event);
      this.websocket.onerror = reject;
    });
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
