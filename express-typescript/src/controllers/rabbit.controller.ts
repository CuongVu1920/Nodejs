import { Request, Response } from "express";
import { emailQueue } from "../queues/index";
import { JOB_NAME } from "../constants/queue.constant";

export const RabbitController = {
  testRabbitMQ: async (req: Request, res: Response) => {
    // await emailQueue.add(JOB_NAME.EMAIL.WELCOME, {
    //   subject: "Welcome to RabbitMQ",
    //   message:
    //     "Congratulations! You have successfully sent a message to RabbitMQ.",
    //   to: "cuongvudev@gmail.com",
    // });

    const userId = 2;
    const jobId = `${JOB_NAME.EMAIL.FORGOT_PASSWORD}_${userId}`;
    await emailQueue.add(
      JOB_NAME.EMAIL.FORGOT_PASSWORD,
      {
        subject: "Forgot Password - RabbitMQ",
        message:
          "You have requested to reset your password. Please follow the instructions to reset your password.",
        to: "cuongvudev@gmail.com",
      },
      {
        jobId: jobId, // Set the job ID to ensure uniqueness
      },
    );

    res.json({ message: "RabbitMQ test endpoint" });
  },
};
