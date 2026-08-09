import { Worker } from "bullmq";
import { bullmqClient } from "../utils/bullmq";
import { JOB_NAME, QUEUE_NAME } from "../constants/queue.constant";

const bullMQ = bullmqClient.getInstance();

type dataSendEmail = {
  subject: string;
  message: string;
  to: string;
};

const handleSendEmailWelcome = async (data: dataSendEmail) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(
    `Đã gửi email với subject: ${data.subject} và message: ${data.message} đến ${data.to}`,
  );
};

const handleSendEmailForgotPassword = async (data: dataSendEmail) => {
  throw new Error("Lỗi khi gửi email quên mật khẩu");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(
    `Đã gửi email quên mật khẩu với subject: ${data.subject} và message: ${data.message} đến ${data.to}`,
  );
};

const emailWorker = new Worker(
  QUEUE_NAME.EMAIL,
  async (job) => {
    console.log(`Worker đang xử lý job ${job.name} với dữ liệu:`, job.data);
    switch (job.name) {
      case JOB_NAME.EMAIL.WELCOME: {
        await handleSendEmailWelcome(job.data);
        break;
      }
      case JOB_NAME.EMAIL.FORGOT_PASSWORD: {
        await handleSendEmailForgotPassword(job.data);
        break;
      }
      default:
        console.log(`Không có job nào để xử lý với tên: ${job.name}`);
    }
  },
  {
    connection: bullMQ.worker!,
    concurrency: 10, // Set the concurrency to 10 nghĩa là có thể xử lý 10 job cùng lúc, nếu có nhiều hơn 10 job thì sẽ được xếp hàng chờ.
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.name} đã hoàn thành`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.name} thất bại với lỗi: ${err.message}`);
});
