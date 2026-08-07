import IORedis from "ioredis";
import { redsisConfig } from "../configs/redis.config";

type MyRedisConfig = {
  host: string;
  port: number;
};

type BullMQClient = {
  queue: IORedis | null;
  worker: IORedis | null;
  getInstance: () => BullMQClient;
  config: MyRedisConfig;
};

export const bullmqClient: BullMQClient = {
  queue: null,
  worker: null,
  config: {
    host: redsisConfig.host || "127.0.0.1",
    port: Number(redsisConfig.port) || 6379,
  },
  getInstance() {
    if (!this.queue) {
      this.queue = new IORedis(this.config);
    }

    if (!this.worker) {
      this.worker = new IORedis({ ...this.config, maxRetriesPerRequest: null });
    }

    return this;
  },
};
