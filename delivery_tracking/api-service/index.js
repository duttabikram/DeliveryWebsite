const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const redis = require("redis");
const { connectProducer, sendLocation } = require("./kafka/producer");
const Order = require("./models/order");
const { connectMongo } = require("./db/mongo");
const Food = require("./models/Food");
const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const Restaurant = require("./models/Restaurant");



const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
/* ---------- Redis ---------- */
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});


redisClient.connect().then(() => {
  console.log("✅ API connected to Redis");
});

/* ---------- REST API ---------- */
// app.post("/auth/signup", async (req, res) => {
//   const { name, email, password, role, restaurantId } = req.body;

//   const exists = await User.findOne({ email });
//   if (exists) return res.status(400).json({ error: "User exists" });

//   const passwordHash = await bcrypt.hash(password, 10);

//   const user = await User.create({
//     name,
//     email,
//     passwordHash,
//     role,
//     restaurantId: role === "RESTAURANT" ? restaurantId : null,
//   });

//   res.json({ message: "Signup successful" });
// });

// app.post("/auth/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) return res.status(400).json({ error: "Invalid credentials" });

//   const ok = await bcrypt.compare(password, user.passwordHash);
//   if (!ok) return res.status(400).json({ error: "Invalid credentials" });

//   const token = jwt.sign(
//     { userId: user._id, role: user.role, restaurantId: user.restaurantId },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );

//   res.json({
//   token,
//   user: {
//     id: user._id,
//     role: user.role,
//     restaurantId: user.restaurantId,
//     name: user.name,
//   },
// });

// });


app.post("/order", auth(["CUSTOMER"]), async (req, res) => {
  try {
    const order = await Order.create({
      orderId: "ORD" + Date.now(),
      userId: req.user.userId,              // ✅ from token
      restaurantId: req.body.restaurantId,
      items: req.body.items,
      status: "PLACED",
    });

    res.json(order);
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// 📍 Customer browsing restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

app.get(
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


app.post(
  "/restaurant",
  auth(["RESTAURANT"]),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.create({
        name: req.body.name,
        address: req.body.address,
        ownerUserId: req.user.userId, // 🔐 from token
      });

      res.json(restaurant);
    } catch (err) {
      res.status(500).json({ error: "Restaurant creation failed" });
    }
  }
);

app.get(
  "/restaurant/:restaurantId/orders",
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


app.patch(
  "/order/:orderId/status",
  auth(["RESTAURANT", "DELIVERY"]),
  async (req, res) => {
    try {
      const order = await Order.findOne({
        orderId: req.params.orderId,
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // 🏪 RESTAURANT authorization
      if (req.user.role === "RESTAURANT") {
        const restaurant = await Restaurant.findById(order.restaurantId);

        if (!restaurant) {
          return res
            .status(404)
            .json({ error: "Restaurant not found" });
        }

        if (
          restaurant.ownerUserId.toString() !== req.user.userId
        ) {
          return res
            .status(403)
            .json({ error: "Unauthorized" });
        }

        // restaurant allowed statuses
        if (!["ACCEPTED", "PREPARING"].includes(req.body.status)) {
          return res
            .status(400)
            .json({ error: "Invalid status change" });
        }
      }

      // 🚴 DELIVERY authorization
      if (req.user.role === "DELIVERY") {
        if (
          !["PICKED", "DELIVERED"].includes(req.body.status)
        ) {
          return res
            .status(400)
            .json({ error: "Invalid status change" });
        }
      }

      order.status = req.body.status;
      await order.save();

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to update order" });
    }
  }
);


app.get(
  "/order/:orderId",
  auth(["CUSTOMER", "RESTAURANT", "DELIVERY"]),
  async (req, res) => {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 👤 CUSTOMER → only own order
    if (
      req.user.role === "CUSTOMER" &&
      order.userId !== req.user.userId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 🍽️ RESTAURANT → only its restaurant orders
    if (req.user.role === "RESTAURANT") {
      const restaurant = await Restaurant.findOne({
        ownerUserId: req.user.userId,
      });

      if (
        !restaurant ||
        order.restaurantId.toString() !== restaurant._id.toString()
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    // 🚴 DELIVERY → allowed
    res.json(order);
  }
);


app.get("/restaurant/:restaurantId/food", async (req, res) => {
  const foods = await Food.find({
    restaurantId: req.params.restaurantId,
  });

  res.json(foods);
});

app.post(
  "/restaurant/:restaurantId/food",
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
        available: true,
      });

      res.json(food);
    } catch (err) {
      res.status(500).json({ error: "Failed to add food" });
    }
  }
);


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


app.post("/location",auth("DELIVERY"), async (req, res) => {
  const payload = req.body;

  // 🔐 Validate order status
  const order = await Order.findOne({ orderId: payload.orderId });

  if (!order || order.status !== "PICKED") {
    return res
      .status(400)
      .json({ error: "Tracking not enabled yet" });
  }

  await sendLocation(payload); // Kafka producer

  res.json({ status: "Location sent to Kafka" });
});

app.get("/order/:orderId/track", auth("CUSTOMER"), async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // 🔐 ownership check
  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const data = await redisClient.get(
    `order:${req.params.orderId}:location`
  );

  if (!data) {
    return res.status(404).json({ message: "No location yet" });
  }

  res.json(JSON.parse(data));
});



/* ---------- WebSocket ---------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🟢 Frontend connected");

 socket.on("subscribeOrder", async (orderId) => {
  socket.join(orderId);

  // send immediately
  let lastSent = null;

  const sendLatest = async () => {
    const data = await redisClient.get(`order:${orderId}:location`);
    if (!data) return;

    if (data !== lastSent) {
      lastSent = data;
      socket.emit("locationUpdate", JSON.parse(data));
    }
  };

  // send immediately
  await sendLatest();

  // 🔥 POLL Redis every 2 seconds
  const interval = setInterval(sendLatest, 2000);

  socket.on("disconnect", () => {
    clearInterval(interval);
  });
});
});

/* ---------- Start Server ---------- */
async function startServer() {
  const PORT = process.env.PORT || 5000;
  await connectMongo();
  while (true) {
    try {
      await connectProducer();
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  server.listen(PORT, () => {
    console.log(`🚀 API Service running on port ${PORT}`);
  });
}

startServer();
