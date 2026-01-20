const mongoose = require("mongoose");
const Order = require("../models/order");
const Food = require("../models/Food");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/delivery");

  await Order.deleteMany({});
  await Food.deleteMany({});
  await Restaurant.deleteMany({});
  await User.deleteMany({});

  console.log("✅ Database reset complete");
  process.exit();
})();
