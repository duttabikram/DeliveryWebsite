const startConsumer = require("./kafka/consumer");
const { connectMongo } = require("./db/mongo");
const { connectRedis } = require("./cache/redis");

async function boot() {
  await connectMongo();
  await connectRedis();

  // 🔁 Retry Kafka connection forever
  while (true) {
    try {
      await startConsumer();
      break; // exit loop once consumer starts
    } catch (err) {
      console.log("⏳ Kafka not ready for consumer, retrying in 5s...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

boot();
