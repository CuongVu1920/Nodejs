import { Worker } from "bullmq";
import { bullmqClient } from "../utils/bullmq";
import { QUEUE_NAME } from "../constants/queue.constant";

const bullMQ = bullmqClient.getInstance();

const emailWorker = new Worker(
  QUEUE_NAME.EMAIL,
  async (job) => {
    // throw new Error("Lỗi khi xử lý job " + job.id);
    console.log("Đang xử lý job:", job.id);
    console.log(`Job ${job.name} đang được xử lý với dữ liệu:`, job.data);
  },
  { connection: bullMQ.worker! },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.name} đã hoàn thành`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.name} thất bại với lỗi: ${err.message}`);
});
