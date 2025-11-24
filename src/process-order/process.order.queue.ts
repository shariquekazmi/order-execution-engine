import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

export const QUEUE_NAME = "order-execution-queue";

dotenv.config();

function createRedisConnection() {
  return new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });
}

export const OrderQueue = new Queue(QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
