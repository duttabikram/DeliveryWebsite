const express = require("express");
const razorpay = require("../config/razorpay");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create-order", auth(["CUSTOMER"]), async (req, res) => {
  const { amount } = req.body; // amount in rupees

  const options = {
    amount: amount * 100, // Razorpay uses paise
    currency: "INR",
    receipt: "rcpt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  res.json(order);
});

const crypto = require("crypto");

router.post("/verify", auth(["CUSTOMER"]), async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "TkXbRe3B004rbFiazIX68yxN")
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  }

  res.status(400).json({ success: false });
});


module.exports = router;
