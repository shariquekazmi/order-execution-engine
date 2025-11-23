import Fastify from "fastify";
import app from "./app";
import dotenv from "dotenv";

const server = Fastify({
  logger: true,
});

server.register(app);
dotenv.config();

// reading from env
const PORT = Number(process.env.PORT);
const HOST = process.env.HOST;

if (isNaN(PORT) || !HOST) {
  throw new Error("Missing or invalid environment variables: PORT or HOST");
}

server
  .listen({ port: PORT, host: HOST })
  .then(() => console.log(`Server live on ${HOST}:${PORT}`))
  .catch((err) => {
    server.log.error(err);
    process.exit(1);
  });
