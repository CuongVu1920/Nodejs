import dotenv from "dotenv";
dotenv.config();
// import cron from "node-cron";
import { emailQueue } from "../queues/index";
import { JOB_NAME } from "../constants/queue.constant";

// cron.schedule("*/5 * * * * *", () => {
//   // Chạy công việc hàng ngày vào lúc 5s một lần
//   emailQueue.add(JOB_NAME.EMAIL.WELCOME, {
//     subject: "Daily Email",
//     message:
//       "Hello, this is your daily email. vào lúc " +
//       new Date().toLocaleTimeString(),
//     to: "customer@example.com",
//   });

//   console.log(
//     `Công việc hàng ngày ${JOB_NAME.EMAIL.WELCOME} đã được thêm vào hàng đợi lúc ${new Date().toLocaleTimeString()}`,
//   );
// });

emailQueue.upsertJobScheduler(
  "email_welcome_scheduler",
  {
    pattern: "09 00 * * *", // Chạy công việc hàng ngày vào lúc 9:00 hàng ngày
  },
  {
    name: JOB_NAME.EMAIL.WELCOME,
    data: {
      subject: "Daily Email",
      message:
        "Hello, this is your daily email. vào lúc " +
        new Date().toLocaleTimeString(),
      to: "customer@example.com",
    },
  },
);
