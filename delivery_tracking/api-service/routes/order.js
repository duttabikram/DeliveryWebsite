const express = require("express");
const auth = require("../middleware/auth");
const Order = require("../models/order");
const { connectMongo } = require("../db/mongo");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

router.post("/create", auth(["CUSTOMER"]), async (req, res) => {
  try {
    if (req.body.paymentMode === "ONLINE" && !req.body.paymentId) {
    return res.status(400).json({ error: "Payment not completed" });
  }
    const restaurant = await Restaurant.findById(
      req.body.restaurantId
    );

    if (!restaurant || !restaurant.isActive) {
      return res.status(400).json({
        error: "Restaurant is currently unavailable",
      });
    }

    const order = await Order.create({
      orderId: "ORD" + Date.now(),
      userId: req.user.userId,              // ✅ from token
      restaurantId: req.body.restaurantId,
      items: req.body.items,
      deliveryLocation: {lat: Number(req.body.deliveryLocation.lat), lng: Number(req.body.deliveryLocation.lng)},
    paymentMode: req.body.paymentMode,
    isPaid: req.body.paymentMode === "ONLINE",
    paymentId: req.body.paymentId,
      status: "PLACED",
    });

    res.json(order);
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});


router.get(
  "/my-orders",
  auth(["CUSTOMER"]),
  async (req, res) => {

    try{// ✅ Fetch orders
    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
    }catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
  }
);


router.get(
  "/:orderId",
  auth(["CUSTOMER", "RESTAURANT", "DELIVERY"]),
  async (req, res) => {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    }).populate("restaurantId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 👤 CUSTOMER → only own order
    if (
      req.user.role === "CUSTOMER" &&
      order.userId.toString() !== req.user.userId
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


router.patch(
  "/:orderId/status",
  auth(["CUSTOMER", "RESTAURANT", "DELIVERY"]),
  async (req, res) => {
    try {
      const order = await Order.findOne({
        orderId: req.params.orderId,
      });
       // 🚫 Block ALL updates if not found
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
       // 🚫 Block ALL updates if cancelled
       if (order.status === "CANCELLED") {
      return res
      .status(400)
      .json({ error: "Cancelled order cannot be updated" });
       }
      
      // 🚫 Block ALL updates if delivered
      if (order.status === "DELIVERED") {
       return res
      .status(400)
      .json({ error: "Order already delivered" });
      }
      // 🏪 CUSTOMER authorization
      if ( req.user.role === "CUSTOMER"){
            if(order.userId.toString() !== req.user.userId){
      return res.status(403).json({ error: "Unauthorized" });
    }
     if (req.body.status !== "CANCELLED") {
      return res.status(400).json({ error: "Invalid action" });
    }

    // 🚫 Only allow cancel if PLACED
    if (order.status !== "PLACED") {
      return res.status(400).json({
        error: "Order cannot be cancelled at this stage",
      });
    }
    order.status = req.body.status;
      order.refund = {
        status: "INITIATED",
        amount: order.totalAmount,
        refundedAt: null,
      };

      await order.save();
      processRefund(order).catch(console.error);

      return res.json({
        message: "Order cancelled. Refund initiated.",
        order,
      });
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
            if (
      req.body.status === "ACCEPTED" &&
      order.paymentMode === "ONLINE" &&
      !order.isPaid
    ) {
      return res.status(400).json({ error: "Order not paid" });
    }
        // restaurant allowed statuses
        if (!["ACCEPTED", "CANCELLED", "PREPARING"].includes(req.body.status)) {
          return res
            .status(400)
            .json({ error: "Invalid status change" });
        }
        order.status = req.body.status;
      await order.save();

      res.json(order);
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
          if (
          req.body.status === "PICKED" &&
         !["PREPARING"].includes(order.status)
         ) {
         return res.status(400).json({
         error: "Order not ready for pickup",
         });
         }
        order.status = req.body.status;
      await order.save();
       res.json(order);
         }
    } catch (err) {
      res.status(500).json({ error: "Failed to update order" });
    }
  }
);

async function processRefund(order) {
  try {
    // 🔁 Razorpay refund logic will go here later
    // await razorpay.payments.refund(order.payment.paymentId)

    order.refund.status = "SUCCESS";
    order.refund.refundedAt = new Date();

    await order.save();
  } catch (err) {
    order.refund.status = "FAILED";
    await order.save();
  }
}

module.exports = router;

