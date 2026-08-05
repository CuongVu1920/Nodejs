import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const EX = "logs_topic_exchange";

const logTopicConsumer = {
  async setup() {
    // 1. Lấy instance RabbitMQ client
    const rabittmq = rabbitmqClient.getInstance();

    // 2. Tạo/lấy channel
    rabittmq.getOrCreateChannel(
      "LOGS_TOPIC_CHANNEL_CONSUMER",
      async (channel: ConfirmChannel) => {
        // 3. Khai báo exchange
        await channel.assertExchange(EX, "topic", {
          durable: true,
        });

        // 4. Tạo queue riêng cho service email
        const queue = await channel.assertQueue("", {
          exclusive: true,
        });

        // 5. Bind queue vào exchange
        const routingKey = "#.error"; // Nhận tất cả các log có severity là error
        await channel.bindQueue(queue.queue, EX, routingKey);

        // 6. Consume message từ queue => Đăng ký lắng nghe message từ email_queue.
        channel.consume(queue.queue, (msg) => {
          if (msg) {
            const message = msg.content.toString();
            console.log(`[LogTopic] nhận log - Message: ${message}`);
            channel.ack(msg);
          }
        });
      },
    );
  },
};

logTopicConsumer.setup().catch((error) => {
  console.error("Error in log topic consumer setup:", error);
});
