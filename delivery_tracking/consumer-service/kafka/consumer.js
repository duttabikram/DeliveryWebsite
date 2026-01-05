const { Kafka } = require("kafkajs");
const { saveRoute } = require("../db/mongo");
const { updateLocation } = require("../cache/redis");

const kafka = new Kafka({
  clientId: "delivery-consumer",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "delivery-group" });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "delivery-location" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("📥 Consumed:", data);

      await saveRoute(data);                    // MongoDB
      await updateLocation(data.orderId, data); // Redis
    },
  });

  console.log("✅ Kafka Consumer running");
}

module.exports = startConsumer;
