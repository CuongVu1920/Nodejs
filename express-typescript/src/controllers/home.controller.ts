import { Request, Response } from "express";
import { CreateOrder } from "../mail/create-order.mail";
import { MailData } from "../types/mail.type";
import { pubSubRedis } from "../utils/redis";
import { rabbitmqClient } from "../utils/rabbitmq";
import { ConfirmChannel } from "amqplib";
const rabittmq = rabbitmqClient.getInstance();

const pubSubClient = pubSubRedis.getInstance();

export const HomeController = {
  index: async (req: Request, res: Response) => {
    return res.render("home");
  },
  testMail: async (req: Request, res: Response) => {
    const data = {
      name: "John Doe Zin",
      orderId: "OD-12345",
    };

    const info = new CreateOrder<MailData>({
      info: {
        to: "vucuong10a12cmb1920@gmail.com",
        subject: "Order Confirmation",
      },
      options: {
        name: data.name,
        orderId: data.orderId,
      },
    });

    await info.send();

    res.json({
      message: "Email sent successfully",
    });
  },
  linkTracking: async (req: Request, res: Response) => {
    const url = req.query.url as string;
    const mailId = req.query.mailId as string;

    if (url) {
      console.log("user đã click vào link: ", mailId);

      return res.redirect(url as string);
    }

    return res.redirect("/");
  },
  testRedis: async (req: Request, res: Response) => {
    // const result = await redis.set("name", "Cuongvv");
    // const value = await redis.get("name");

    // const result = await redis.hSet("user:1", {
    //   name: "Cuongvv",
    //   email: "cuongvudev@gmail.com",
    // });
    // const value = await redis.hGetAll("user:1");

    await pubSubClient.pubClient?.publish(
      "new-order",
      "Hello from Redis Pub/Sub!",
    );

    res.json({
      message: "Redis test route",
    });
  },
  testMQ: async (req: Request, res: Response) => {
    // quy trình gửi message đến RabbitMQ

    // Producer - gửi message đến RabbitMQ

    // 1. assert queue (tạo queue nếu chưa tồn tại) - assertQueue(tên queue, { durable: true })
    // 2. send message đến queue - sendToQueue(tên queue, Buffer.from(message), { persistent: true })
    const channelWrapper = rabittmq.createChannel(
      "Task-Channel",
      (channel: ConfirmChannel) => {
        return channel.assertQueue("task-queue-okela", { durable: true });
      },
    );

    channelWrapper?.sendToQueue(
      "task-queue-okela",
      Buffer.from("Hello from RabbitMQ!"),
      { persistent: true },
    ); // persistent: true => message sẽ tồn tại ngay cả khi RabbitMQ server restart
    res.json({
      message: "MQ test route",
    });
  },
};
