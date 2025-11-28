import type { ConnectionOptions } from "bullmq";

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
};
