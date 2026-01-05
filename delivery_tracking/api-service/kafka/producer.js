const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "delivery-api",
  brokers: [process.env.KAFKA_BROKER], // kafka:9092
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log("✅ Kafka Producer connected");
}

async function sendLocation(data) {
  await producer.send({
    topic: "delivery-location",
    messages: [{ value: JSON.stringify(data) }],
  });
}

module.exports = {
  connectProducer,
  sendLocation,
};
