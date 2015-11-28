export default class WeechatConnection {
    constructor(host: string, password: string = '') {
        this.host = host;
        this.password = password;
        this.websocket = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.websocket = new WebSocket(this.host);

            this.websocket.onopen = () => resolve(this);
            this.websocket.onmessage = (msg) => console.log(msg);
            this.websocket.onerror = reject;
        });
    }

    onmessage(message) {
        console.log('Recieved data:', message);
    }

    send(data) {
        console.log('Sending data:', data);
        this.websocket.send(data);
    }
}