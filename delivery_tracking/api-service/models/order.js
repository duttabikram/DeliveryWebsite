const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: String,
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
    },
  ],
  deliveryLocation:{
    lat: Number, lng: Number
  },
  status: {
    type: String,
    enum: ["PLACED", "ACCEPTED", "PREPARING", "PICKED", "DELIVERED", "CANCELLED"],
    default: "PLACED",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
   paymentMode: {
    type: String,
    enum: ["ONLINE", "COD"],
    required: true,
  },

  isPaid: {
    type: Boolean,
    default: false,
  },

  paymentId: String,

  refund: {
  status: {
    type: String,
    enum: ["NONE", "INITIATED", "SUCCESS", "FAILED"],
    default: "NONE",
  },
  amount: Number,
  refundedAt: Date,
},

});

module.exports = mongoose.model("Order", OrderSchema);
