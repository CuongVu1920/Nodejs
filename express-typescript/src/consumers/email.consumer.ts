import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const EX = "order_exchange";

const emailConsumer = {
  async setup() {
    const rabittmq = rabbitmqClient.getInstance();
    rabittmq.getOrCreateChannel(
      "EMAIL_CHANNEL_CONSUMER",
      async (channel: ConfirmChannel) => {
        await channel.assertExchange(EX, "direct", {
          durable: true,
        });

        // Tạo queue tạm thời, xóa khi ngắt kết nối
        const queue = await channel.assertQueue("email_queue", {
          exclusive: true,
        });

        await channel.bindQueue(queue.queue, EX, "order.created");
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
