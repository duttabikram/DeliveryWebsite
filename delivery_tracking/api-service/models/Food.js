const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema(
  {
    restaurantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
          required: true,
        },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: String,
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", FoodSchema);
