import type { ConnectionOptions } from "bullmq";

const getRedisConfig = (): ConnectionOptions => {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port || "6379", 10),
        username: url.username || undefined,
        password: url.password || undefined,
        tls:
          url.protocol === "rediss:"
            ? { rejectUnauthorized: false }
            : undefined,
      };
    } catch (e) {
      console.warn("Invalid REDIS_URL, falling back to individual env vars");
    }
  }

  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  };
};

export const connection: ConnectionOptions = getRedisConfig();
