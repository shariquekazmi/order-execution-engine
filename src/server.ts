import "reflect-metadata"; // required for TypeORM
import Fastify from "fastify";
import app from "./app";
import dotenv from "dotenv";
import { AppDataSource } from "./database/datasource";

dotenv.config();

async function start() {
  const server = Fastify({
    logger: true,
  });

  // Validate env variables
  const PORT = Number(process.env.PORT);
  const HOST = process.env.HOST;

  if (isNaN(PORT) || !HOST) {
    throw new Error("Missing or invalid environment variables: PORT or HOST");
  }

  // 1️⃣ Initialize PostgreSQL (TypeORM)
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      server.log.info("📦 TypeORM connected to PostgreSQL");
    }
  } catch (err) {
    server.log.error(err, "Error connecting TypeORM:");
    process.exit(1);
  }

  // 2️⃣ Register your Fastify app plugin
  server.register(app);

  // 3️⃣ Start Fastify server
  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err, "Error starting Fastify server:");
    process.exit(1);
  }
}

start();
