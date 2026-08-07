import dotenv from "dotenv";
dotenv.config();

// import "./task.consumer";
// import "./log.consumer";
// import "./email.consumer";
// import "./inventory.consumer";
// import "./news1.consumer";
// import "./news2.consumer";
// import "./log-topic.consumer";
// import "./notifycation.consumer";
// import "./work.consumer";

import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "my-worker",
  async (job) => {
    throw new Error("Lỗi khi xử lý job " + job.id);
    console.log("Đang xử lý job:", job.id);
    console.log(
      "Đã gửi email với subject:",
      job.data.subject,
      job.data.message,
    );
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.name} đã hoàn thành`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.name} thất bại với lỗi: ${err.message}`);
});
