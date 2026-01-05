const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
let collection;

async function connectMongo() {
  await client.connect();
  const db = client.db("delivery");
  collection = db.collection("routes");
  console.log("MongoDB connected");
}

function saveRoute(data) {
  return collection.insertOne(data);
}

module.exports = { connectMongo, saveRoute };
