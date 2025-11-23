import { randomUUID } from "node:crypto";
import { ProcessOrderDto } from "./process.order.dto";

export class OrderService {
  async processOrder(orderDto: ProcessOrderDto) {
    try {
      // Basic validation for correct DTO
      if (!orderDto.baseToken) throw new Error("baseToken is required");
      if (!orderDto.quoteToken) throw new Error("quoteToken is required");

      if (!orderDto.amount || orderDto.amount <= 0) {
        throw new Error("amount must be greater than 0");
      }

      if (!["buy", "sell"].includes(orderDto.side)) {
        throw new Error("side must be 'buy' or 'sell'");
      }

      // Generating Random OrderId
      const orderId = randomUUID();

      // 3. (future step) Save to Redis as "queued"
      // 4. (future step) Push to BullMQ queue

      return {
        orderId,
        status: "order_received",
        message: "Order has been accepted and will be processed.",
      };
    } catch (err) {
      throw new Error("Invalid order data: " + (err as Error).message);
    }
  }
}
