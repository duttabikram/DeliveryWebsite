const redis = require("./utils/redis");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    socket.on("subscribeOrder", (orderId) => {
      socket.join(orderId);
      console.log("📩 Joined:", orderId);
    });

    socket.on("unsubscribeOrder", (orderId) => {
      socket.leave(orderId);
      console.log("🧹 Left:", orderId);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};