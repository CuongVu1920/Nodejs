import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const EX = "headers_exchange";

const notifycationConsumer = {
  async setup() {
    // 1. Lấy instance RabbitMQ client
    const rabittmq = rabbitmqClient.getInstance();

    // 2. Tạo/lấy channel
    rabittmq.getOrCreateChannel(
      "NOTIFICATION_CHANNEL_CONSUMER",
      async (channel: ConfirmChannel) => {
        // 3. Khai báo exchange
        await channel.assertExchange(EX, "headers", {
          durable: true,
        });

        // 4. Tạo queue riêng cho service email
        const queue = await channel.assertQueue("", {
          exclusive: true,
        });

        // 5. Bind queue vào exchange
        await channel.bindQueue(queue.queue, EX, "", {
          "x-match": "all", // all: tất cả header phải khớp, any: chỉ cần 1 header khớp
          department: "marketing",
          location: "hanoi",
        });

        // 6. Consume message từ queue => Đăng ký lắng nghe message từ email_queue.
        channel.consume(queue.queue, (msg) => {
          if (msg) {
            const message = msg.content.toString();
            console.log(`[Notifycation] nhận thông báo - Message: ${message}`);
            channel.ack(msg);
          }
        });
      },
    );
  },
};

notifycationConsumer.setup().catch((error) => {
  console.error("Error in notifycation consumer setup:", error);
});
