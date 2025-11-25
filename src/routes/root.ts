import { FastifyPluginAsync } from "fastify";
import processOrderRoutes from "../process-order/process.order.route";
import orderWebSocketRoutes from "../process-order/process.order.ws";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    return { root: true };
  });

  fastify.register(processOrderRoutes); // Route will autoload in this root file
  fastify.register(orderWebSocketRoutes);
};

export default root;
