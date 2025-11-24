import { Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAME } from "./process.order.queue";
import dotenv from "dotenv";

dotenv.config();

function createWorkerConn() {
  return new IORedis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null,
  });
}

const redis = createWorkerConn();

const orderWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const orderId = job.data.orderId;
    console.log("Processing", job.data.orderId);
    // Redis order is processing
    await redis.hset(`active_order:${orderId}`, {
      status: "processing",
    });

    // fake delay represents DEX routing + execution -> will change once implementing routing logic
    await new Promise((r) => setTimeout(r, 1500));

    // generate mock final price
    const finalPrice = Math.random() * (10 - 5) + 5;

    // Redis order completed
    await redis.hset(`active_order:${orderId}`, {
      status: "completed",
      finalPrice: finalPrice.toFixed(4),
    });

    console.log("Completed", orderId);

    return {
      orderId,
      status: "completed",
      finalPrice,
    };
  },
  {
    connection: createWorkerConn(),
    concurrency: 10,
    limiter: { max: 100, duration: 60_000 },
  }
);

const queueEvents = new QueueEvents(QUEUE_NAME, {
  connection: createWorkerConn(),
});
