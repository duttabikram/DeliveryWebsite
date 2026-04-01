const express = require("express");
const auth = require("../middleware/auth");
const redis = require("../utils/redis");
const Order = require("../models/order");

const router = express.Router();

router.post("/", auth(["DELIVERY"]), async (req, res) => {
  const payload = req.body;

  try {
    const order = await Order.findOne({ orderId: payload.orderId });

    if (!order || order.status !== "PICKED") {
      return res.status(400).json({ error: "Tracking not enabled yet" });
    }

    // 🧠 SAFE PARSE helper
    const safeParse = (data) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        return null;
      }
    };

    // 🚫 Skip small movement
    const prevRaw = await redis.get(`order:${payload.orderId}:lastSent`);
    const prevData = safeParse(prevRaw);

    if (prevData) {
      const distanceMoved =
        Math.abs(prevData.lat - payload.lat) +
        Math.abs(prevData.lng - payload.lng);

      if (distanceMoved < 0.0001) {
        return res.json({ status: "Skipped" });
      }
    }

    // 🧠 Get precomputed route data
    const routeRaw = await redis.get(`order:${payload.orderId}:route`);
    const routeData = safeParse(routeRaw) || {};

    const enrichedData = {
      orderId: payload.orderId,
      lat: payload.lat,
      lng: payload.lng,
      eta: routeData.eta || "Calculating...",
      distance: routeData.distance || 0,
      polyline: routeData.polyline || null,
      timestamp: payload.timestamp,
    };

    // 💾 Save location (ALWAYS stringify)
    await redis.set(
      `order:${payload.orderId}:location`,
      JSON.stringify(enrichedData)
    );

    // 💾 Save last position
    await redis.set(
      `order:${payload.orderId}:lastSent`,
      JSON.stringify(payload)
    );

    // 🚀 Emit (with safety check)
    if (req.io) {
      req.io.to(payload.orderId).emit("locationUpdate", enrichedData);
    } else {
      console.log("⚠️ req.io not found");
    }

    res.json({ status: "Location updated" });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;