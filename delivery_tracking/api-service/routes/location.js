const express = require("express");
const auth = require("../middleware/auth");
const redis = require("../utils/redis");
const Order = require("../models/order");

const router = express.Router();

router.post(
  "/",
  auth(["DELIVERY"]),
  async (req, res) => {
  const payload = req.body;

    // 🔐 Validate order
  // 🔐 Validate order status
  const order = await Order.findOne({ orderId: payload.orderId });

  if (!order || order.status !== "PICKED") {
    return res
      .status(400)
      .json({ error: "Tracking not enabled yet" });
  }

  await redis.set(
      `order:${payload.orderId}:location`,
      JSON.stringify(payload)
    );

    res.json({ status: "Location updated" });
  }
);

module.exports = router;