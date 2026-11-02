const express = require("express");
const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");
const router = express.Router();

// Middleware to check if the user is logged into the dashboard
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

const jwt = require("jsonwebtoken"); // Need jwt for the middleware above

// Get the current active API key prefix
router.get('/', verifyDashboardToken, async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({ userId: req.user.userId, isActive: true });
    if (!apiKey) {
      return res.status(200).json({ hasKey: false });
    }
    res.status(200).json({ hasKey: true, prefix: apiKey.prefix });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch API key status" });
  }
});

// Generate a new API Key
router.post("/generate", verifyDashboardToken, async (req, res) => {
  try {
    // 1. Generate a raw 32-byte secure string
    const rawString = crypto.randomBytes(32).toString("hex");
    const rawKey = `dev_key_${rawString}`; // The key the user will copy

    // 2. Hash the key for storage (using sha256)
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    // 3. Extract the prefix for the dashboard display
    const prefix = rawKey.substring(0, 16);

    // 4. Save to database
    const newApiKey = new ApiKey({
      userId: req.user.userId,
      keyHash: keyHash,
      prefix: prefix,
    });
    await newApiKey.save();

    // 5. Return the raw key to the user EXACTLY ONCE
    res.status(201).json({
      message: "Key generated. Save this now, you will not see it again.",
      rawKey: rawKey,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate key" });
  }
});

module.exports = router;
