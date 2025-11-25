import "reflect-metadata";
import { DataSource } from "typeorm";
import { OrderHistory } from "./entities/order-history.entity";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  synchronize: true, // auto create tables -> no migrations required
  logging: false,
  entities: [OrderHistory], // auto-loaded
});
