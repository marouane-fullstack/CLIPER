//BullMQ consumer

import { Queue, RedisOptions } from "bullmq";

function parseRedisOptionsFromUrl(redisUrl: string): RedisOptions {
  const url = new URL(redisUrl);
  const isTls = url.protocol === "rediss:";

  const username = url.username ? decodeURIComponent(url.username) : undefined;
  const password = url.password ? decodeURIComponent(url.password) : undefined;

  const port = url.port ? Number(url.port) : 6379;

  const options: RedisOptions = {
    host: url.hostname,
    port,
    username,
    password,
  };

  if (isTls) {
    options.tls = {};
  }

  return options;
}

function buildRedisConnection(): RedisOptions | null {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return parseRedisOptionsFromUrl(redisUrl);
  }

  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT;

  if (!redisHost) return null;

  // Tolerate misconfiguration: some people paste the full redis/rediss URL into REDIS_HOST.
  if (redisHost.startsWith("redis://") || redisHost.startsWith("rediss://")) {
    return parseRedisOptionsFromUrl(redisHost);
  }

  if (!redisPort) return null;

  const options: RedisOptions = {
    host: redisHost,
    port: Number(redisPort),
    password: process.env.REDIS_PASSWORD,
  };

  // Optional TLS (for Upstash you typically want this on)
  if (process.env.REDIS_TLS === "true") {
    options.tls = {};
  }

  return options;
}

const connection: RedisOptions | null = buildRedisConnection();

export const videoProcessingQueue: Queue | null = connection
  ? new Queue("video-processing", { connection })
  : null;