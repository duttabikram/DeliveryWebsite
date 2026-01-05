const mongoose = require("mongoose");

async function connectMongo() {
  const uri =
    process.env.MONGO_URI || "mongodb://mongo:27017/delivery";

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
}

module.exports = { connectMongo };
