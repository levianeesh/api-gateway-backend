const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Webhook = require("../models/Webhook");
const router = express.Router();

// Middleware to check dashboard login (same as we used in keys.js)
const verifyDashboardToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Fetch all active webhooks for the dashboard
router.get("/", verifyDashboardToken, async (req, res) => {
  try {
    const webhooks = await Webhook.find({
      userId: req.user.userId,
      isActive: true,
    });
    res.status(200).json(webhooks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch webhooks" });
  }
});

// Register a new webhook URL
router.post("/register", verifyDashboardToken, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Webhook URL is required" });
    }

    // Generate a secure signing secret for this specific webhook
    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    const newWebhook = new Webhook({
      userId: req.user.userId,
      url: url,
      secret: secret,
    });

    await newWebhook.save();

    res.status(201).json({
      message: "Webhook registered successfully",
      webhookId: newWebhook._id,
      secret: secret, // The developer saves this to verify our signatures later
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register webhook" });
  }
});

module.exports = router;
