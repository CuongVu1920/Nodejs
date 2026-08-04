import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const EX = "order_exchange";

const emailConsumer = {
  async setup() {
    // 1. Lấy instance RabbitMQ client
    const rabittmq = rabbitmqClient.getInstance();

    // 2. Tạo/lấy channel
    rabittmq.getOrCreateChannel(
      "EMAIL_CHANNEL_CONSUMER",
      async (channel: ConfirmChannel) => {
        // 3. Khai báo exchange
        await channel.assertExchange(EX, "direct", {
          durable: true,
        });

        // 4. Tạo queue riêng cho service email
        const queue = await channel.assertQueue("email_queue", {
          exclusive: true,
        });

        // 5. Bind queue vào exchange
        await channel.bindQueue(queue.queue, EX, "order.created");

        // 6. Consume message từ queue => Đăng ký lắng nghe message từ email_queue.
        channel.consume(queue.queue, (msg) => {
          if (msg) {
            const order = JSON.parse(msg.content.toString());
            console.log(
              `[Email] gửi email xác nhận đơn hàng - Order ID: ${order.id}, Customer: ${order.customerName}`,
            );
            channel.ack(msg);
          }
        });
      },
    );
  },
};

emailConsumer.setup().catch((error) => {
  console.error("Error in email consumer setup:", error);
});
