import "@fastify/websocket";
import type { WebSocket } from "ws";

declare module "@fastify/websocket" {
  interface SocketStream {
    socket: WebSocket;
  }
}
