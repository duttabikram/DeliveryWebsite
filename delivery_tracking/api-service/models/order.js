const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  restaurantId: String,
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
    },
  ],
  status: {
    type: String,
    enum: ["PLACED", "ACCEPTED", "PREPARING", "PICKED", "DELIVERED"],
    default: "PLACED",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
