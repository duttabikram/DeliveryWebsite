const express = require("express");
const auth = require("../middleware/auth");
const Order = require("../models/order");
const { connectMongo } = require("../db/mongo");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

router.get(
  "/my-restaurant",
  auth(["RESTAURANT"]),
  async (req, res) => {
    const restaurant = await Restaurant.findOne({
      ownerUserId: req.user.userId,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "No restaurant found" });
    }

    res.json(restaurant);
  }
);

router.post(
  "/create",
  auth(["RESTAURANT"]),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.create({
        name: req.body.name,
        address: req.body.address,
        ownerUserId: req.user.userId, // 🔐 from token
        imageUrl: req.body.imageUrl,
        location:{lat: Number(req.body.location.lat), lng: Number(req.body.location.lng)},
      });

      res.json(restaurant);
    } catch (err) {
      res.status(500).json({ error: "Restaurant creation failed" });
    }
  }
);


router.get(
  "/:restaurantId/orders",
  auth(["RESTAURANT"]),
  async (req, res) => {
    const { restaurantId } = req.params;

    // ✅ Find restaurant
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // ✅ Check ownership
    if (restaurant.ownerUserId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✅ Fetch orders
    const orders = await Order.find({ restaurantId })
      .sort({ createdAt: -1 });

    res.json(orders);
  }
);

router.get("/:restaurantId/food", async (req, res) => {
  const foods = await Food.find({
    restaurantId: req.params.restaurantId,
  });

  res.json(foods);
});



router.post(
  "/:restaurantId/food",
  auth(["RESTAURANT"]),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.restaurantId);

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      // ✅ ownership check (THIS is the key fix)
      if (restaurant.ownerUserId.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const food = await Food.create({
        restaurantId: restaurant._id,
        name: req.body.name,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        available: true,
      });

      res.json(food);
    } catch (err) {
      res.status(500).json({ error: "Failed to add food" });
    }
  }
);


router.patch(
  "/:id/status",
  auth(["RESTAURANT"]),
  async (req, res) => {
try{
    const { id } = req.params;
    const { isActive } = req.body;

    const restaurant = await Restaurant.findOne({
       _id: id,
      ownerUserId: req.user.userId,
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    
    // ✅ ownership check (KEY FIX)
    if (restaurant.ownerUserId.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    restaurant.isActive = isActive;
    await restaurant.save();
    
    res.json(restaurant);
  }catch (err) {
      res.status(500).json({ error: "Failed to update Restaurant Status" });
    }
  }
);


module.exports = router;
