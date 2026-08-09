import { Request, Response } from "express";
import { emailQueue } from "../queues/index";

export const RabbitController = {
  testRabbitMQ: async (req: Request, res: Response) => {
    await emailQueue.add("sendEmail", {
      subject: "gửi email xác nhận từ RabbitMQ",
      message: "This is a test email from RabbitMQ",
    });

    res.json({ message: "RabbitMQ test endpoint" });
  },
};
