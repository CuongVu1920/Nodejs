import { ConfirmChannel, ConsumeMessage } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const EX = "logs_redirect_exchange";

const logConsumber = {
  onErrorLog(msg: ConsumeMessage | null, channel: ConfirmChannel) {
    if (msg) {
      const log = JSON.parse(msg.content.toString());
      console.log(
        `[Nhận log từ RabbitMQ] - Severity: ${log.severity}, Message: ${log.message}`,
      );
      channel.ack(msg);
    }
  },
  onAllLog(msg: ConsumeMessage | null, channel: ConfirmChannel) {
    if (msg) {
      const log = JSON.parse(msg.content.toString());
      console.log(
        `[Nhận tất cả log từ RabbitMQ] - Severity: ${log.severity}, Message: ${log.message}`,
      );
      channel.ack(msg);
    }
  },

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

        // binding error log
        await channel.bindQueue(queue.queue, EX, "info");
        channel.consume(queue.queue, (msg) => {
          this.onErrorLog(msg, channel);
        });

        // binding all
        const queueAllLog = await channel.assertQueue("", { exclusive: true });

        ["error", "warning", "info"].forEach((type: string) => {
          channel.bindQueue(queueAllLog.queue, EX, type);
        });
        channel.consume(queueAllLog.queue, (msg) => {
          this.onAllLog(msg, channel);
        });
      },
    );
  },
};

logConsumber.setup().catch((error) => {
  console.error("Error in log consumer setup:", error);
});

// bindQueue: nghĩa là kết nối queue với exchange, và exchange sẽ dựa vào routing key để quyết định gửi message đến queue nào.
