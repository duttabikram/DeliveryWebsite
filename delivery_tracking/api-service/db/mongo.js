const mongoose = require("mongoose");

async function connectMongo() {
  const uri = "mongodb+srv://duttabikram53_db_user:vyxDWdXrs2QPgqX6@cluster12.ufw6rmj.mongodb.net/?appName=Cluster12";

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
}

module.exports = { connectMongo };
