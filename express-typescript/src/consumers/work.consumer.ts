import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const MAIN_QUEUE = "work_queue";
const RETRY_QUEUE = "retry_hold_queue"; // queue tạm thời chờ 10s
const RETRY_CHANGE = "retry_exchange";

const workConsumer = {
  async setup() {
    // 1. Lấy instance RabbitMQ client
    const rabittmq = rabbitmqClient.getInstance();

    // 2. Tạo/lấy channel
    rabittmq.getOrCreateChannel(
      "WORK_QUEUE_CONSUMER",
      async (channel: ConfirmChannel) => {
        // 1. Cấu hình queue chờ
        await channel.assertExchange(RETRY_CHANGE, "direct", {
          durable: true,
        });

        await channel.assertQueue(RETRY_QUEUE, {
          durable: true,
          deadLetterExchange: "", // gửi về exchange mặc định
          deadLetterRoutingKey: MAIN_QUEUE, // gửi về queue chính
          messageTtl: 10000, // 10 giây
        });

        await channel.bindQueue(RETRY_QUEUE, RETRY_CHANGE, "retry_key");

        // 2. Cấu hình queue chính
        await channel.assertQueue(MAIN_QUEUE, {
          durable: true,
          deadLetterExchange: RETRY_CHANGE, // gửi về exchange retry
          deadLetterRoutingKey: "retry_key", // gửi về queue chờ
        });

        // 3. Consume message từ queue chính
        channel.consume(MAIN_QUEUE, (msg) => {
          if (!msg) return;

          const xDeath = msg.properties.headers?.["x-death"];
          const retryCount = (xDeath ? xDeath[0]?.count : 0) as number;

          console.log(
            `[Work Consumer] Nhận message từ queue chính: ${msg.content.toString()}, Retry Count: ${retryCount}`,
          );

          // giả lập lỗi
          try {
            if (msg.content.toString().includes("error")) {
              throw new Error("Tin nhắn lỗi, sẽ gửi đến queue chờ retry");
            }

            console.log(
              "[Work Consumer] Xử lý message thành công: ",
              msg.content.toString(),
            );
            channel.ack(msg);
          } catch {
            const MAX_RETRIES = 3;
            if (retryCount < MAX_RETRIES) {
              console.log(
                `[Work Consumer] Lỗi xảy ra, sẽ retry lần thứ ${retryCount + 1} sau 10 giây: ${msg.content.toString()}`,
              );
              channel.nack(msg, false, false); // Gửi message đến queue chờ retry
            } else {
              console.log(
                `[Work Consumer] Lỗi xảy ra, đã vượt quá số lần retry tối đa (${MAX_RETRIES}). Message sẽ được gửi đến Dead Letter Queue: ${msg.content.toString()}`,
              );
              channel.ack(msg); // Xác nhận message để loại bỏ khỏi queue chính
            }
          }
        });
      },
    );
  },
};

workConsumer.setup().catch((error) => {
  console.error("Error in work consumer setup:", error);
});
