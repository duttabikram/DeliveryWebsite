module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("joinOrder", (orderId) => {
      socket.join(orderId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
