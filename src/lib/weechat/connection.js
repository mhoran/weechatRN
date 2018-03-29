import { WeeChatProtocol } from "./parser";

const protocol = new WeeChatProtocol();

export default class WeechatConnection {
  constructor(host, password = "") {
    this.host = host;
    this.password = password;
    this.websocket = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(this.host);

      this.websocket.onopen = () => resolve(this);
      this.websocket.onmessage = this.onmessage;
      this.websocket.onerror = reject;
    });
  }

  onmessage(event) {
    console.log("Recieved data:", event.data);
    console.log("Parsed data:", protocol.parse(event.data));
  }

  send(data) {
    console.log("Sending data:", data);
    this.websocket.send(data);
  }
}
