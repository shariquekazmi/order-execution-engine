import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { OrderService } from "./process.order.service";
import { ProcessOrderDto } from "./process.order.dto";

const orderService = new OrderService();

async function createOrderRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.post(
    "/orders",
    async (
      request: FastifyRequest<{ Body: ProcessOrderDto }>,
      reply: FastifyReply
    ) => {
      const result = await orderService.processOrder(request.body);
      return reply.code(200).send(result);
    }
  );
}

export default createOrderRoutes;
