import type { AppDispatch } from '../../store';
import Buffer from '../../usecase/buffers/ui/Buffer';
import WeechatApiConnection from './api/connection';
import type WeechatConnection from './connection';
import type { ConnectionError } from './connection';
import WeechatRelayConnection from './relay_connection';

interface ProtocolBridge {
  onSuccess: () => void;
  ping: () => void;
  input: (
    bufferId: string | undefined,
    bufferName: string | undefined,
    message: string
  ) => void;
  fetchBufferInfo: (bufferId: string) => void;
  fetchBufferLines: (bufferId: string, numLines: number) => void;
}

class ApiProtocolBridge implements ProtocolBridge {
  constructor(private connection: WeechatApiConnection) {}

  onSuccess = () => {
    this.connection.send({ request: 'GET /api/hotlist' });
    this.connection.send({ request: 'GET /api/buffers?colors=weechat' });
    this.connection.send({ request: 'GET /api/scripts' });
    this.connection.send({
      request: 'POST /api/sync',
      body: { colors: 'weechat' }
    });
  };

  ping = () => this.connection.send({ request: 'POST /api/ping' });

  input = (
    bufferId: string | undefined,
    bufferName: string | undefined,
    message: string
  ) =>
    this.connection?.send({
      request: 'POST /api/input',
      body: {
        ...(bufferId
          ? { buffer_id: Number(bufferId) }
          : { buffer_name: bufferName }),
        command: message
      }
    });

  fetchBufferInfo = (bufferId: string) => {
    this.connection.send({
      request: `GET /api/buffers/${bufferId}?colors=weechat`
    });
    this.connection.send({
      request: `GET /api/buffers/${bufferId}/nicks?colors=weechat`
    });
  };

  fetchBufferLines = (bufferId: string, numLines: number) => {
    this.connection.send({
      request: `GET /api/buffers/${bufferId}/lines?lines=-${numLines}&colors=weechat`
    });
  };
}

class WeechatProtocolBridge implements ProtocolBridge {
  constructor(private connection: WeechatConnection) {}

  onSuccess = () => {
    this.connection.send('(hotlist) hdata hotlist:gui_hotlist(*)');
    this.connection.send(
      '(buffers) hdata buffer:gui_buffers(*) id,local_variables,notify,number,full_name,short_name,title,hidden,type'
    );
    this.connection.send('(scripts) hdata python_script:scripts(*) name');
    this.connection.send('sync');
  };

  ping = () => this.connection.send('ping');

  input = (
    bufferId: string | undefined,
    bufferName: string | undefined,
    message: string
  ) =>
    this.connection.send(
      `(input) input ${(bufferId && `0x${bufferId}`) || bufferName} ${message}`
    );

  fetchBufferInfo = (bufferId: string) => {
    this.connection.send(
      `(last_read_lines) hdata buffer:0x${bufferId}/own_lines/last_read_line/data id,buffer`
    );
    this.connection.send(`(nicklist) nicklist 0x${bufferId}`);
  };

  fetchBufferLines = (bufferId: string, numLines: number) => {
    this.connection.send(
      `(lines) hdata buffer:0x${bufferId}/own_lines/last_line(-${numLines})/data`
    );
  };
}

export default class RelayClient {
  private connection?: WeechatConnection;
  private protocolBridge?: ProtocolBridge;

  constructor(
    private dispatch: AppDispatch,
    private onConnectionSuccess: () => void,
    private onConnectionError: (
      reconnect: boolean,
      connectionError: ConnectionError | null
    ) => void
  ) {}

  onSuccess = (): void => {
    this.onConnectionSuccess();
    this.protocolBridge?.onSuccess();
  };

  connect = (
    hostname: string,
    path: string | null,
    password: string,
    ssl: boolean,
    protocol: 'weechat' | 'api'
  ): void => {
    const WeechatConnection =
      protocol === 'api' ? WeechatApiConnection : WeechatRelayConnection;
    this.connection = new WeechatConnection(
      this.dispatch,
      hostname,
      path,
      password,
      ssl,
      this.onSuccess,
      this.onConnectionError
    );

    this.protocolBridge =
      protocol === 'api'
        ? new ApiProtocolBridge(this.connection as WeechatApiConnection)
        : new WeechatProtocolBridge(this.connection);
    this.connection.connect();
  };

  reconnect = (): void => {
    this.connection?.connect();
  };

  disconnect = (): void => {
    this.connection?.disconnect();
  };

  isConnected = (): boolean => this.connection?.isConnected() ?? false;

  isDisconnected = (): boolean => this.connection?.isDisconnected() ?? false;

  ping = (): void => this.protocolBridge?.ping();

  sendMessageToBuffer = (
    {
      bufferId,
      bufferName
    }: {
      bufferId?: string;
      bufferName?: string;
    },
    message: string
  ): void => {
    this.protocolBridge?.input(bufferId, bufferName, message);
  };

  fetchBufferInfo = (bufferId: string): void => {
    if (!this.protocolBridge) return;

    this.protocolBridge.fetchBufferInfo(bufferId);
    this.fetchBufferLines(bufferId);
  };

  fetchBufferLines = (
    bufferId: string,
    numLines = Buffer.DEFAULT_LINE_INCREMENT
  ): void => {
    if (!this.protocolBridge) return;

    this.protocolBridge.fetchBufferLines(bufferId, numLines);
  };

  clearHotlistForBuffer = (currentBufferId: string): void => {
    if (!this.protocolBridge) return;

    this.protocolBridge.input(
      currentBufferId,
      undefined,
      '/buffer set hotlist -1'
    );
    this.protocolBridge.input(
      currentBufferId,
      undefined,
      '/input set_unread_current_buffer'
    );
  };
}
