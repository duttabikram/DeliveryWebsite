const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  location: {lat: Number, lng: Number},
  imageUrl: String,
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
