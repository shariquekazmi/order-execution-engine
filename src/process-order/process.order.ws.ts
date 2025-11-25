import { FastifyInstance } from "fastify";
import { redisClient } from "../services/redis.client";

export default async function orderWebSocketRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/orders/:orderId/stream",
    { websocket: true },
    (connection: any, req: any) => {
      const orderId = req.params.orderId;
      const channel = `order_updates:${orderId}`;

      const subscriber = redisClient.duplicate();
      subscriber.subscribe(channel);

      const ws = connection.socket as any;

      ws.on("message", (msg: any) => {
        console.log("Client sent:", msg.toString());
      });

      subscriber.on("message", (_c, message) => {
        ws.send(message);
      });

      ws.on("close", () => {
        subscriber.unsubscribe(channel);
        subscriber.quit();
      });
    }
  );
}
