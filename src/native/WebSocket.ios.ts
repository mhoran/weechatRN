import { requireOptionalNativeModule } from 'expo';
import type { URLSessionWebSocketModule } from './URLSessionWebSocket';
import { Connection, Sockets } from './URLSessionWebSocket';
import type { WebSocketCompat } from './WebSocket';

const native = requireOptionalNativeModule<URLSessionWebSocketModule>(
  'URLSessionWebSocket'
);
let sockets: Sockets | undefined;

export function createWebSocket(
  url: string,
  protocols?: string[]
): WebSocketCompat {
  if (!native)
    throw new Error('URLSessionWebSocket native module is unavailable');
  sockets ??= new Sockets(native);
  return new Connection(sockets, url, protocols);
}
