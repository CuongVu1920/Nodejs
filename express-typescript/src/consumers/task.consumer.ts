import { rabbitmqClient } from "../utils/rabbitmq";
const rabittmq = rabbitmqClient.getInstance();

const taskConsumber = async () => {
  await rabittmq.connection; // đảm bảo rằng kết nối đã được thiết lập trước khi tiếp tục
  await rabittmq.channel?.assertQueue("task-queue-okela", { durable: true });
  rabittmq.channel?.consume("task-queue-okela", (msg) => {
    if (msg) {
      console.log("Received message from RabbitMQ:", msg.content.toString());
      rabittmq.channel?.ack(msg); // ack để xác nhận rằng message đã được xử lý thành công và có thể xóa khỏi queue
    }
  });
};

taskConsumber().catch((error) => {
  console.error("Error in task consumer:", error);
});
