import { ConfirmChannel, ConsumeMessage } from "amqplib";
import { rabbitmqClient } from "../utils/rabbitmq";

const taskConsumber = {
  // method xử lý công việc
  onOrderCreated: async (
    msg: ConsumeMessage | null,
    channel: ConfirmChannel,
  ) => {
    if (!msg) {
      return;
    }

    try {
      const content = JSON.parse(msg.content.toString());
      console.log("Đang xử lý message:", content.value);
      channel.ack(msg);
    } catch (error) {
      console.error("Lỗi khi xử lý message:", error);
      channel.nack(msg, false, false);
    }
  },
  // onOrderCancelled: async (
  //   msg: ConsumeMessage | null,
  //   channel: ConfirmChannel,
  // ) => {
  //   // logic
  // },
  async setup() {
    const rabittmq = rabbitmqClient.getInstance();
    rabittmq.getOrCreateChannel(
      "TASK_CONSUMER_CHANNEL",
      async (channel: ConfirmChannel) => {
        await channel.prefetch(1);
        await channel.assertQueue("task-queue-okela", { durable: true });
        await channel.consume("task-queue-okela", async (msg) => {
          await this.onOrderCreated(msg, channel);
        });

        // await channel.assertQueue("task-queue-2", { durable: true });
        // await channel.consume("task-queue-2", async (msg) => {
        //   await this.onOrderCancelled(msg, channel);
        // });
      },
    );
  },
};

taskConsumber.setup().catch((error) => {
  console.error("Error in task consumer setup:", error);
});

/**
 * // ack - nghĩa là xác nhận rằng message đã được xử lý thành công và có thể xóa khỏi queue,
 * nếu không ack thì message sẽ vẫn còn trong queue và sẽ được gửi lại cho consumer khác hoặc consumer hiện tại khi nó sẵn sàng nhận message tiếp theo
 *
 * // nack - nghĩa là xác nhận rằng message đã được xử lý nhưng không thành công và có thể xóa khỏi queue,
 * nếu không nack thì message sẽ vẫn còn trong queue và sẽ được gửi lại cho consumer khác hoặc consumer hiện tại khi nó sẵn sàng nhận message tiếp theo
 *  - nack - true: gửi lại message cho queue
 *  - nack - false: xóa message khỏi queue
 *
 * // exclusive queue - nghĩa là queue chỉ có thể được sử dụng bởi 1 connection duy nhất, nếu connection đó bị đóng thì queue sẽ bị xóa
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
