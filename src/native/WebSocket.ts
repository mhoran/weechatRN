export type WebSocketCompat = Pick<
  WebSocket,
  'readyState' | 'close' | 'onopen' | 'onmessage' | 'onclose'
> & { send(data: string): void };

export function createWebSocket(
  url: string,
  protocols?: string[]
): WebSocketCompat {
  return new WebSocket(url, protocols);
}
