const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const verifyApiKey = require("../middleware/apiKeyAuth");
const requestLogger = require("../middleware/requestLogger");

const Webhook = require("../models/Webhook");
const dispatchWebhook = require("../utils/webhookDispatcher");

// 1. Configure the Rate Limiter (Max 5 requests per minute for testing)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per window
  message: { error: "Too many requests. Please try again in a minute." },
});

// 2. Apply middlewares in the correct order
router.use(apiLimiter); // Check rate limit first
router.use(verifyApiKey); // Verify their identity second
router.use(requestLogger); // Start the stopwatch third

// 3. The actual route
router.post("/process-payment", async (req, res) => {
  // 1. Create the payment success data
  const transactionId = `txn_${Math.floor(Math.random() * 1000000000)}`;
  const payload = {
    event: "payment.success",
    data: {
      transactionId: transactionId,
      amount: 5000,
      currency: "usd",
      status: "succeeded",
    },
  };

  // 2. Immediately respond to the API request (don't make the user wait for the webhook)
  res.status(200).json({
    success: true,
    transactionId: transactionId,
    message: "Payment processed successfully",
  });

  // 3. Background Process: Find the developer's webhooks and fire them
  try {
    // req.apiKey is attached by our apiKeyAuth middleware
    const activeWebhooks = await Webhook.find({
      userId: req.apiKey.userId,
      isActive: true,
    });

    activeWebhooks.forEach((webhook) => {
      // Fire and forget! This runs asynchronously in the background.
      dispatchWebhook(webhook.url, webhook.secret, payload);
    });
  } catch (err) {
    console.error("Error fetching webhooks:", err);
  }
});

module.exports = router;
