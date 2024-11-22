import type { AppDispatch } from '../../store';
import Buffer from '../../usecase/buffers/ui/Buffer';
import type { ConnectionError } from './connection';
import WeechatConnection from './connection';

export default class RelayClient {
  private connection?: WeechatConnection;

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
    if (!this.connection) return;

    this.connection.send('(hotlist) hdata hotlist:gui_hotlist(*)');
    this.connection.send(
      '(buffers) hdata buffer:gui_buffers(*) id,local_variables,notify,number,full_name,short_name,title,hidden,type'
    );
    this.connection.send('(scripts) hdata python_script:scripts(*) name');
    this.connection.send('sync');
  };

  connect = (hostname: string, password: string, ssl: boolean): void => {
    this.connection = new WeechatConnection(
      this.dispatch,
      hostname,
      password,
      ssl,
      this.onSuccess,
      this.onConnectionError
    );
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

  ping = (): void => this.connection?.send('ping');

  sendMessageToBuffer = (bufferIdOrFullName: string, message: string): void => {
    this.connection?.send(`(input) input ${bufferIdOrFullName} ${message}`);
  };

  fetchBufferInfo = (
    bufferId: string,
    numLines = Buffer.DEFAULT_LINE_INCREMENT
  ): void => {
    if (!this.connection) return;

    this.connection.send(
      `(last_read_lines) hdata buffer:0x${bufferId}/own_lines/last_read_line/data buffer`
    );
    this.connection.send(
      `(lines) hdata buffer:0x${bufferId}/own_lines/last_line(-${numLines})/data`
    );
    this.connection.send(`(nicklist) nicklist 0x${bufferId}`);
  };

  clearHotlistForBuffer = (currentBufferId: string | null): void => {
    if (!currentBufferId) return;

    this.sendMessageToBuffer(`0x${currentBufferId}`, '/buffer set hotlist -1');
    this.sendMessageToBuffer(
      `0x${currentBufferId}`,
      '/input set_unread_current_buffer'
    );
  };
}
