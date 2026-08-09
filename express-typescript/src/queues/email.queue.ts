import { Queue } from "bullmq";
import { bullmqClient } from "../utils/bullmq";
import { QUEUE_NAME } from "../constants/queue.constant";

const bullmq = bullmqClient.getInstance();

export const emailQueue = new Queue(QUEUE_NAME.EMAIL, {
  connection: bullmq.queue!,
});

// emailQueue.setGlobalConcurrency(2); // nghĩa là chỉ có 2 job được xử lý cùng lúc, nếu có nhiều hơn 2 job thì sẽ được xếp hàng chờ.
