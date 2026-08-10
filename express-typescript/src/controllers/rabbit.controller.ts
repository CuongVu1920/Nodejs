import { Request, Response } from "express";
import { emailQueue } from "../queues/index";
import { JOB_DELAY, JOB_NAME } from "../constants/queue.constant";

export const RabbitController = {
  testBullMQ2: async (req: Request, res: Response) => {
    // await emailQueue.add(JOB_NAME.EMAIL.WELCOME, {
    //   subject: "Welcome to RabbitMQ",
    //   message:
    //     "Congratulations! You have successfully sent a message to RabbitMQ.",
    //   to: "cuongvudev@gmail.com",
    // });

    // const userId = 2;
    // const jobId = `${JOB_NAME.EMAIL.FORGOT_PASSWORD}_${userId}`;
    await emailQueue.add(
      JOB_NAME.EMAIL.FORGOT_PASSWORD,
      {
        subject: "Forgot Password - RabbitMQ",
        message:
          "You have requested to reset your password. Please follow the instructions to reset your password.",
        to: "cuongvudev@gmail.com",
      },
      {
        // jobId: jobId, // Set the job ID to ensure uniqueness
        removeOnComplete: true, // Automatically remove the job from the queue when completed
        removeOnFail: 2, // nghĩa là nếu job thất bại thì sẽ được giữ lại trong queue 2 lần trước khi bị xóa khỏi queue, để có thể retry lại job đó.
        attempts: 3, // Retry the job up to 3 times if it fails
        backoff: {
          type: "fixed", // Thử lại job với khoảng thời gian cố định giữa các lần thử lại
          delay: JOB_DELAY, // Delay the job for 5 seconds before retrying
        },
      },
    );

    res.json({ message: "RabbitMQ test endpoint" });
  },
};
