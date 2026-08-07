import { Request, Response } from "express";
import { CreateOrder } from "../mail/create-order.mail";
import { MailData } from "../types/mail.type";
import { pubSubRedis } from "../utils/redis";
import { rabbitmqClient } from "../utils/rabbitmq";
import { ConfirmChannel } from "amqplib";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const rabittmq = rabbitmqClient.getInstance();
const pubSubClient = pubSubRedis.getInstance();

const connection = new IORedis();
const myQueue = new Queue("my-worker", {
  connection,
});

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

    // producer direct exchange
    const logs = [
      {
        severity: "info",
        message: "This is an info log message",
      },
      {
        severity: "error",
        message: "This is an error log message",
      },
      {
        severity: "warning",
        message: "This is a warning log message",
      },
    ];

    const EX = "logs_redirect_exchange";
    const channelWrapper = rabittmq.getOrCreateChannel(
      "LOG_CHANNEL_PRODUCER",
      async (channel: ConfirmChannel) => {
        await channel.assertExchange(EX, "direct", {
          durable: true,
        });
      },
    );

    logs.forEach((log) => {
      channelWrapper?.publish(
        EX,
        log.severity, // routing key
        Buffer.from(JSON.stringify(log)),
        {
          persistent: true,
        },
      );
      console.log("Đã gửi log đến RabbitMQ: ", log.message);
    });

    res.json({
      message: "MQ test route",
    });
  },
  testMQOrder: async (req: Request, res: Response) => {
    // Tạo đơn hàng -> nhiều queue khác nhau sẽ nhận được thông tin đơn hàng này
    const EX = "order_exchange";
    const channelWrapper = rabittmq.getOrCreateChannel(
      "ORDER_CHANNEL_PRODUCER",
      async (channel: ConfirmChannel) => {
        await channel.assertExchange(EX, "direct", {
          durable: true,
        });
      },
    );

    const order = {
      id: "OD-12345",
      customerName: "John Doe",
      items: ["Laptop", "Mouse", "Keyboard"],
      total: 2000,
    };
    const routingKey = "order.created"; // routing key cho exchange fanout, có thể đặt bất kỳ giá trị nào, nhưng không quan trọng vì fanout sẽ gửi đến tất cả các queue đã bind với exchange này
    channelWrapper?.publish(
      EX,
      routingKey,
      Buffer.from(JSON.stringify(order)),
      {
        persistent: true,
      },
    );
    console.log("Đã gửi đơn hàng đến RabbitMQ: ", order);

    res.json({
      message: "MQ order test route",
    });
  },
  testMQFanout: async (req: Request, res: Response) => {
    // Fanout exchange sẽ gửi message đến tất cả các queue đã bind với exchange này, không quan tâm đến routing key
    const EX = "news_fanout_exchange";
    const msg = "giảm giá 50% cho tất cả các đơn hàng trong ngày hôm nay";

    const channelWrapper = rabittmq.getOrCreateChannel(
      "NEWS_FANOUT_CHANNEL_PRODUCER",
      async (channel: ConfirmChannel) => {
        await channel.assertExchange(EX, "fanout", {
          durable: false,
        });
      },
    );

    channelWrapper?.publish(EX, "", Buffer.from(msg), {
      persistent: true,
    });
    console.log("Đã gửi tin tức đến RabbitMQ: ", msg);

    res.json({
      message: "MQ fanout test route",
    });
  },
  testMQTopic: async (req: Request, res: Response) => {
    // Topic exchange sẽ gửi message đến các queue dựa trên pattern của routing key
    const logs = [
      {
        key: "asia.mobile.info",
        message: "This is an info log message from Asia Mobile",
      },
      {
        key: "asia.web.error",
        message: "This is an error log message from Asia Web",
      },
      {
        key: "asia.mobile.warning",
        message: "This is a warning log message from Asia Mobile",
      },
      {
        key: "europe.web.info",
        message: "This is an info log message from Europe Web",
      },
    ];

    const EX = "logs_topic_exchange";
    const channelWrapper = rabittmq.getOrCreateChannel(
      "LOG_TOPIC_CHANNEL_PRODUCER",
      async (channel: ConfirmChannel) => {
        await channel.assertExchange(EX, "topic", {
          durable: true,
        });
      },
    );

    logs.forEach((log) => {
      channelWrapper?.publish(
        EX,
        log.key, // routing key
        Buffer.from(JSON.stringify(log)),
        {
          persistent: true,
        },
      );
      console.log("Đã gửi log đến RabbitMQ: ", log.message);
    });

    res.json({
      message: "MQ topic test route",
    });
  },
  testMQHeaders: async (req: Request, res: Response) => {
    // Headers exchange sẽ gửi message đến các queue dựa trên header của message
    const EX = "headers_exchange";

    const channelWrapper = rabittmq.getOrCreateChannel(
      "NOTIFICATION_CHANNEL_PRODUCER",
      async (channel: ConfirmChannel) => {
        await channel.assertExchange(EX, "headers", {
          durable: true,
        });
      },
    );

    const msg =
      "[Thông báo]: Mong ban se luon biet on nhung dieu nho be den voi ban, biet on ngay ca nhung kho khan! Ban tot dep vi chinh la ban, va ban xung dang nhan duoc nhung dieu tot dep nhat. Chuc ban mot ngay tuyet voi!";

    console.log("Đã gửi thông báo đến RabbitMQ!");
    channelWrapper?.publish(EX, "", Buffer.from(msg), {
      persistent: true,
      headers: {
        department: "marketing",
        location: "hanoi",
      },
    });

    res.json({
      message: "MQ headers test route",
    });
  },
  testMQDlx: async (req: Request, res: Response) => {
    const RETRY_CHANGE = "retry_exchange";
    // DLX (Dead Letter Exchange) là một cơ chế trong RabbitMQ để xử lý các message không thể được xử lý thành công.
    // Khi một message bị từ chối (nack) hoặc hết hạn (TTL), nó sẽ được gửi đến một exchange đặc biệt gọi là Dead Letter Exchange (DLX).
    // DLX sẽ chuyển message này đến một queue đặc biệt gọi là Dead Letter Queue (DLQ) để lưu trữ và phân tích sau.

    const channelWrapper = rabittmq.getOrCreateChannel(
      "WORK_CHANNEL_PRODUCER",
      async (channel: ConfirmChannel) => {
        await channel.assertQueue("work_queue", {
          durable: true,
          deadLetterExchange: RETRY_CHANGE, // gửi về exchange retry
          deadLetterRoutingKey: "retry_key",
        });
      },
    );

    const msg = "Xử lý đơn hàng error: okela heheh";

    channelWrapper?.sendToQueue("work_queue", Buffer.from(msg), {
      persistent: true,
    });

    res.json({
      message: "MQ DLX test route",
    });
  },
  testBullMQ: async (req: Request, res: Response) => {
    myQueue.add("my-first-job", {
      subject: "Xác nhận đơn hàng",
      message:
        "Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.",
    });

    res.json({
      message: "BullMQ test route",
    });
  },
};

// channel.publish nghĩa là gửi message đến exchange, và exchange sẽ dựa vào routing key để quyết định gửi message đến queue nào.
