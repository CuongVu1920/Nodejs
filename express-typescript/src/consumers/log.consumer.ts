import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const EX = "logs_redirect_exchange";

const logConsumber = {
  async setup() {
    const rabittmq = rabbitmqClient.getInstance();
    rabittmq.getOrCreateChannel(
      "LOG_CHANNEL_CONSUMER",
      async (channel: ConfirmChannel) => {
        await channel.assertExchange(EX, "direct", {
          durable: true,
        });

        // Tạo queue tạm thời, xóa khi ngắt kết nối
        const queue = await channel.assertQueue("", { exclusive: true });

        // binding
        await channel.bindQueue(queue.queue, EX, "info");
        channel.consume(queue.queue, (msg) => {
          if (msg) {
            const log = JSON.parse(msg.content.toString());
            console.log(
              `Nhận log từ RabbitMQ - Severity: ${log.severity}, Message: ${log.message}`,
            );
            channel.ack(msg);
          }
        });
      },
    );
  },
};

logConsumber.setup().catch((error) => {
  console.error("Error in log consumer setup:", error);
});
