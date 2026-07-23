import amqp, { Channel, ChannelModel } from "amqplib";
import { rabbitConfig } from "../configs/rabbit.config";

type RabbitMqClientType = {
  connection: Promise<ChannelModel | void> | null;
  channel: Channel | null;
  getInstance: () => RabbitMqClientType;
};

export const rabbitmqClient: RabbitMqClientType = {
  connection: null,
  channel: null,
  getInstance() {
    const url = `amqp://${rabbitConfig.username}:${rabbitConfig.password}@${rabbitConfig.host}:${rabbitConfig.port}/`;

    if (!this.connection) {
      this.connection = amqp.connect(url).then(async (conn) => {
        if (conn) {
          this.channel = await conn.createChannel();
        }
        console.log("RabbitMQ connection established successfully.");
      });
    }

    return this;
  },
};
