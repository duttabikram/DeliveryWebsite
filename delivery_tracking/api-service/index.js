const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Order = require("./models/order");
const { connectMongo } = require("./db/mongo");
const Food = require("./models/Food");
const Restaurant = require("./models/Restaurant");
const auth = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

/* ----------HTTP and WebSocket Server---------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ INJECT IO IN EVERY REQ
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", require("./routes/auth"));
app.use("/payment", require("./routes/payment"));
app.use("/order", require("./routes/order"));
app.use("/restaurant", require("./routes/restaurant"));
app.use("/location", require("./routes/location"));
require("./socket")(io);

/* ---------- REST API ---------- */

// 📍 Customer browsing restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find({isActive: true,});
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

app.patch(
  "/food/:foodId",
  auth(["RESTAURANT"]),
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.foodId);

      if (!food) {
        return res.status(404).json({ error: "Food not found" });
      }

      // 🔐 fetch restaurant that owns this food
      const restaurant = await Restaurant.findById(food.restaurantId);

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      // ✅ ownership check (KEY FIX)
      if (restaurant.ownerUserId.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // toggle availability
      food.available = req.body.available;
      await food.save();

      res.json(food);
    } catch (err) {
      res.status(500).json({ error: "Failed to update food" });
    }
  }
);

/* ---------- Start Server ---------- */
async function startServer() {
  const PORT = process.env.PORT || 5000;
  await connectMongo();

  server.listen(PORT, () => {
    console.log(`🚀 API Service running on port ${PORT}`);
  });
}

startServer();
