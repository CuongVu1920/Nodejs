import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const EX = "news_fanout_exchange";

const news2Consumer = {
  async setup() {
    // 1. Lấy instance RabbitMQ client
    const rabittmq = rabbitmqClient.getInstance();

    // 2. Tạo/lấy channel
    rabittmq.getOrCreateChannel(
      "NEWS2_CHANNEL_CONSUMER",
      async (channel: ConfirmChannel) => {
        // 3. Khai báo exchange
        await channel.assertExchange(EX, "fanout", {
          durable: false,
        });

        // 4. Tạo queue riêng cho service email
        const queue = await channel.assertQueue("", {
          exclusive: true,
        });

        // 5. Bind queue vào exchange
        await channel.bindQueue(queue.queue, EX, "");

        // 6. Consume message từ queue => Đăng ký lắng nghe message từ email_queue.
        channel.consume(queue.queue, (msg) => {
          if (msg) {
            const message = msg.content.toString();
            console.log(`[News2] nhận tin tức - Message: ${message}`);
            channel.ack(msg);
          }
        });
      },
    );
  },
};

news2Consumer.setup().catch((error) => {
  console.error("Error in news2 consumer setup:", error);
});
