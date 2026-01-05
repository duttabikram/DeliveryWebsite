const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

async function connectRedis() {
  await client.connect();
  console.log("Redis connected");
}

function updateLocation(orderId, data) {
  return client.set(`order:${orderId}:location`, JSON.stringify(data));
}

module.exports = { connectRedis, updateLocation };
