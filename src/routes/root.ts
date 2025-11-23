import { FastifyPluginAsync } from "fastify";

import processOrderRoutes from "../process-order/process.order.route";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    return { root: true };
  });

  fastify.register(processOrderRoutes); // Route will autoload in this root file
};

export default root;
