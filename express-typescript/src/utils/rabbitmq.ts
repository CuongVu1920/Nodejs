import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from "amqp-connection-manager";
import { rabbitConfig } from "../configs/rabbit.config";
import { ConfirmChannel, Replies } from "amqplib";

type RabbitMqClientType = {
  getInstance: () => RabbitMqClientType;
  connection: AmqpConnectionManager | null;
  createChannel: (
    name: string,
    setup: (channel: ConfirmChannel) => Promise<Replies.AssertQueue>,
  ) => ChannelWrapper | undefined;
};

export const rabbitmqClient: RabbitMqClientType = {
  connection: null,
  getInstance() {
    const url = `amqp://${rabbitConfig.username}:${rabbitConfig.password}@${rabbitConfig.host}:${rabbitConfig.port}/`;
    this.connection = amqp.connect([url]);
    this.connection.on("connect", () => {
      console.log("Connected to RabbitMQ");
    });

    this.connection.on("disconnect", (params) => {
      console.error("Disconnected from RabbitMQ", params.err.stack);
    });

    return this;
  },

  createChannel(name, setup) {
    return this.connection?.createChannel({
      name,
      setup,
    });
  },
};
