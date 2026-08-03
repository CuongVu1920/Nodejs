import { ConfirmChannel } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";
const rabittmq = rabbitmqClient.getInstance();

const channelWrapper = rabittmq.getOrCreateChannel(
  "TASK_CONSUMER_CHANNEL",
  (channel: ConfirmChannel) => {
    channel.prefetch(1);
    return channel.assertQueue("task-queue-okela", { durable: true });
  },
);

let count = 0;
const taskConsumber = async () => {
  channelWrapper?.consume("task-queue-okela", (msg) => {
    if (msg) {
      const { value } = JSON.parse(msg.content.toString());
      console.log("Đang xử lý message:", value);
      setTimeout(() => {
        if (value !== "admin@gmail.com") {
          channelWrapper?.ack(msg);
          console.log("Đã xử lý xong message và ack:", value);
        } else {
          if (count < 1) {
            channelWrapper?.nack(msg, false, true);
            console.log(
              "Đã xử lý xong message nhưng không thành công và nack:",
              value,
            );
          } else {
            channelWrapper?.nack(msg, false, false);
            console.log(
              "Đã xử lý xong message nhưng không thành công và nack, message sẽ bị loại bỏ:",
              value,
            );
          }
          count++;
        }
      }, 2000);
    }
  });
};

channelWrapper?.on("connect", () => {
  console.log("Connected to RabbitMQ channelWrapper: ", channelWrapper.name);
});

channelWrapper?.on("error", (err) => {
  console.error("Error in RabbitMQ channel:", err);
});

taskConsumber().catch((error) => {
  console.error("Error in task consumer:", error);
});

/**
 * // ack - nghĩa là xác nhận rằng message đã được xử lý thành công và có thể xóa khỏi queue,
 * nếu không ack thì message sẽ vẫn còn trong queue và sẽ được gửi lại cho consumer khác hoặc consumer hiện tại khi nó sẵn sàng nhận message tiếp theo
 *
 * // nack - nghĩa là xác nhận rằng message đã được xử lý nhưng không thành công và có thể xóa khỏi queue,
 * nếu không nack thì message sẽ vẫn còn trong queue và sẽ được gửi lại cho consumer khác hoặc consumer hiện tại khi nó sẵn sàng nhận message tiếp theo
 *
 * // Consumber prefetch - nghĩa là số lượng message mà consumer có thể nhận và xử lý cùng một lúc,
 * nếu prefetch = 1 thì consumer sẽ chỉ nhận 1 message tại một thời điểm, nếu prefetch = 5 thì consumer sẽ nhận tối đa 5 message cùng một lúc
 * channelWrapper?.prefetch(1);
 *
 * // Consumber cancel - nghĩa là khi consumer bị hủy bỏ, nó sẽ không nhận thêm message từ queue nữa, nhưng các message đã nhận trước đó vẫn sẽ được xử lý và ack
 * channelWrapper?.cancel("task-queue-okela");
 *
 * // Consumber close - nghĩa là khi consumer bị đóng, nó sẽ không nhận thêm message từ queue nữa, nhưng các message đã nhận trước đó vẫn sẽ được xử lý và ack
 * channelWrapper?.close();
 */
