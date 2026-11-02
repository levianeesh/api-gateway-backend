const express = require("express");
const jwt = require("jsonwebtoken");
const ApiKey = require("../models/ApiKey");
const RequestLog = require("../models/RequestLog");
const router = express.Router();

const verifyDashboardToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    req.user = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

router.get("/logs", verifyDashboardToken, async (req, res) => {
  try {
    // 1. Find the user's active API Key
    const activeKey = await ApiKey.findOne({
      userId: req.user.userId,
      isActive: true,
    });
    if (!activeKey) return res.status(200).json([]);

    // 2. Fetch the last 20 requests for this key, newest first
    const logs = await RequestLog.find({ apiKeyId: activeKey._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // 3. Reverse the array so the chart displays left-to-right (oldest to newest)
    res.status(200).json(logs.reverse());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
