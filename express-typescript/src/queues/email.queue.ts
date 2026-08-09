import { Queue } from "bullmq";
import { bullmqClient } from "../utils/bullmq";
import { QUEUE_NAME } from "../constants/queue.constant";

const bullmq = bullmqClient.getInstance();

export const emailQueue = new Queue(QUEUE_NAME.EMAIL, {
  connection: bullmq.queue!,
});
