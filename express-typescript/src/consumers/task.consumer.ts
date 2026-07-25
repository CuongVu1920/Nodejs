import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";
const rabittmq = rabbitmqClient.getInstance();

const channelWrapper = rabittmq.createChannel(
  "Task-Channel",
  (channel: ConfirmChannel) => {
    return channel.assertQueue("task-queue-okela", { durable: true });
  },
);

const taskConsumber = async () => {
  channelWrapper?.consume("task-queue-okela", (msg) => {
    if (msg) {
      console.log("Received message from RabbitMQ:", msg.content.toString());
      channelWrapper?.ack(msg); // ack để xác nhận rằng message đã được xử lý thành công và có thể xóa khỏi queue
    }
  });
};

taskConsumber().catch((error) => {
  console.error("Error in task consumer:", error);
});
