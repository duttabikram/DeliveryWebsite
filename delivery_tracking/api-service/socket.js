const redis = require("./utils/redis");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("🟢 Frontend connected:", socket.id);

    let interval = null;
    let currentOrderId = null;
    let lastSent = null;

    socket.on("subscribeOrder", async (orderId) => {
      console.log("📩 subscribeOrder:", orderId);

      // 🧹 CLEAN UP previous subscription
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      if (currentOrderId) {
        socket.leave(currentOrderId);
      }

      currentOrderId = orderId;
      socket.join(orderId);
      lastSent = null;

      const sendLatest = async () => {
        const raw = await redis.get(`order:${orderId}:location`);
        if (!raw) return;

        const data = typeof raw === "string" ? JSON.parse(raw) : raw;

        if (JSON.stringify(data) !== JSON.stringify(lastSent)) {
          lastSent = data;
          socket.emit("locationUpdate", data);
        }
      };

      await sendLatest();

      interval = setInterval(sendLatest, 2000);
    });

    socket.on("unsubscribeOrder", () => {
  console.log("🧹 unsubscribeOrder");

  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  if (currentOrderId) {
    socket.leave(currentOrderId);
    currentOrderId = null;
  }
});

    socket.on("disconnect", () => {
      console.log("🔴 Frontend disconnected:", socket.id);
      if (interval) clearInterval(interval);
    });
  });
};