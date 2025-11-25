import "reflect-metadata";
import { AppDataSource } from "../database/datasource";
import IORedis from "ioredis";
import { Worker, QueueEvents } from "bullmq";
import { QUEUE_NAME } from "./process.order.queue";
import { MockDexRouter } from "../services/mock.dexrouter";
import { OrderHistory } from "../database/entities/order-history.entity";

// ---------------- Redis ----------------
function createWorkerConn() {
  return new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });
}

const redis = createWorkerConn();
const publisher = createWorkerConn();
const eventConn = createWorkerConn();

// ---------------- Dex Router ----------------
const router = new MockDexRouter();

// ---------------- Utility: Publish + Redis Save ----------------
async function publishAndSet(orderId: string, data: Record<string, any>) {
  await redis.hset(`active_order:${orderId}`, data);

  await publisher.publish(
    `order_updates:${orderId}`,
    JSON.stringify({ orderId, ...data })
  );
}

// ---------------- Worker Startup ----------------
async function startWorker() {
  try {
    // 1️⃣ Initialize DB
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(OrderHistory);
    console.log("📦 Worker DB ready");

    // 2️⃣ Start BullMQ Worker
    new Worker(
      QUEUE_NAME,
      async (job) => {
        const { orderId, baseToken, quoteToken, amount, side } = job.data;

        try {
          console.log("🔥 Processing", orderId);

          // pending was set by API, now routing
          await publishAndSet(orderId, { status: "routing" });

          // Step 1: DEX Routing
          const bestQuote = await router.routeBest(
            baseToken,
            quoteToken,
            amount
          );

          await publishAndSet(orderId, {
            status: "building",
            chosenDex: bestQuote.dex,
            quotePrice: bestQuote.price.toFixed(4),
          });

          // Step 2: Simulate transaction building
          await publishAndSet(orderId, { status: "submitted" });

          const result = await router.executeSwap(bestQuote);

          // Step 3: Confirm execution
          await publishAndSet(orderId, {
            status: "confirmed",
            finalPrice: result.executedPrice.toFixed(4),
            txHash: result.txHash,
            dex: result.dex,
          });

          // Step 4: Save into DB
          await repo.save({
            orderId,
            baseToken,
            quoteToken,
            amount,
            side,
            chosenDex: bestQuote.dex,
            quotePrice: bestQuote.price,
            finalPrice: result.executedPrice,
            txHash: result.txHash,
            status: "confirmed",
          });

          console.log("✅ Completed", orderId);

          return {
            orderId,
            status: "confirmed",
            finalPrice: result.executedPrice,
            txHash: result.txHash,
            dex: result.dex,
          };
        } catch (err) {
          console.error("❌ Worker processing error", err);

          await publishAndSet(orderId, {
            status: "failed",
            errorMessage: String(err),
          });

          await repo.save({
            orderId,
            baseToken,
            quoteToken,
            amount,
            side,
            status: "failed",
            errorMessage: String(err),
          });

          throw err;
        }
      },
      {
        connection: createWorkerConn(),
        concurrency: 10,
        limiter: {
          max: 100,
          duration: 60_000, // 100 jobs per minute
        },
      }
    );

    // Queue event listener
    new QueueEvents(QUEUE_NAME, { connection: eventConn });

    console.log("🚀 Worker is running...");
  } catch (err) {
    console.error("❌ Worker failed to start:", err);
    process.exit(1);
  }
}

startWorker();
