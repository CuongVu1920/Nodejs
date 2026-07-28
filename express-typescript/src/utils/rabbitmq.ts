import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from "amqp-connection-manager";
import { rabbitConfig } from "../configs/rabbit.config";
import { ConfirmChannel, Replies } from "amqplib";

type RabbitMqClientType = {
  getInstance: () => RabbitMqClientType;
  connection: AmqpConnectionManager | null;
  channels: Map<string, ChannelWrapper>;
  getOrCreateChannel: (
    name: string,
    setup: (channel: ConfirmChannel) => Promise<Replies.AssertQueue>,
  ) => ChannelWrapper | undefined;
};

export const rabbitmqClient: RabbitMqClientType = {
  connection: null,
  channels: new Map(),
  getInstance() {
    if (this.connection) {
      return this;
    }

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

  getOrCreateChannel(name, setup) {
    if (this.channels.has(name)) {
      return this.channels.get(name);
    }

    const channelWrapper = this.connection?.createChannel({
      name,
      setup,
    });

    if (channelWrapper) {
      this.channels.set(name, channelWrapper);
    }

    return channelWrapper;
  },
};
