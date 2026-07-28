import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";
const rabittmq = rabbitmqClient.getInstance();

const channelWrapper = rabittmq.getOrCreateChannel(
  "Task-Channel",
  (channel: ConfirmChannel) => {
    return channel.assertQueue("Worker 1 channel", { durable: true });
  },
);

const taskConsumber = async () => {
  channelWrapper?.consume("task-queue-okela", (msg) => {
    // consume là hàm để nhận message từ queue, nó sẽ lắng nghe và xử lý các message được gửi đến queue
    if (msg) {
      console.log("Received message from RabbitMQ:", msg.content.toString());
      channelWrapper?.ack(msg); // ack để xác nhận rằng message đã được xử lý thành công và có thể xóa khỏi queue
    }
  });
};

channelWrapper?.on("connect", () => {
  console.log("Connected to RabbitMQ channelWrapper: ", channelWrapper.name);
});

// lắng nghe sự kiện connect của channelWrapper để biết khi nào kết nối đến RabbitMQ thành công or có thể lắng nghe sự kiện error để biết khi nào kết nối đến RabbitMQ thất bại

channelWrapper?.on("error", (err) => {
  console.error("Error in RabbitMQ channel:", err);
});

taskConsumber().catch((error) => {
  console.error("Error in task consumer:", error);
});
