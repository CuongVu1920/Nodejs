import { Worker } from "bullmq";
import { bullmqClient } from "../utils/bullmq";
import { JOB_NAME, QUEUE_NAME } from "../constants/queue.constant";

const bullMQ = bullmqClient.getInstance();

type dataSendEmail = {
  subject: string;
  message: string;
  to: string;
};

const handleSendEmailWelcome = (data: dataSendEmail) => {
  console.log(
    `Đã gửi email với subject: ${data.subject} và message: ${data.message} đến ${data.to}`,
  );
};

const handleSendEmailForgotPassword = (data: dataSendEmail) => {
  console.log(
    `Đã gửi email quên mật khẩu với subject: ${data.subject} và message: ${data.message} đến ${data.to}`,
  );
};

const emailWorker = new Worker(
  QUEUE_NAME.EMAIL,
  async (job) => {
    console.log(
      `Worker đang xử lý job ${job.name} với dữ liệu:`,
      job.data,
      "và jobId: ",
      job.id,
    );
    switch (job.name) {
      case JOB_NAME.EMAIL.WELCOME: {
        handleSendEmailWelcome(job.data);
        break;
      }
      case JOB_NAME.EMAIL.FORGOT_PASSWORD: {
        handleSendEmailForgotPassword(job.data);
        break;
      }
      default:
        console.log(`Không có job nào để xử lý với tên: ${job.name}`);
    }
  },
  { connection: bullMQ.worker! },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.name} đã hoàn thành`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.name} thất bại với lỗi: ${err.message}`);
});
