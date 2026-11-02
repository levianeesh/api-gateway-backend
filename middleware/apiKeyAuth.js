const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");

const verifyApiKey = async (req, res, next) => {
  // 1. Extract the key from the headers
  const rawKey = req.header("x-api-key");
  if (!rawKey) {
    return res.status(401).json({ error: "Missing API Key" });
  }

  try {
    // 2. Hash the incoming key to compare it with the database
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    // 3. Find the key in the database
    const apiKeyRecord = await ApiKey.findOne({
      keyHash: hashedKey,
      isActive: true,
    });

    if (!apiKeyRecord) {
      return res.status(403).json({ error: "Invalid or revoked API Key" });
    }

    // 4. Attach the key record to the request so we can log it later
    req.apiKey = apiKeyRecord;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error during key validation" });
  }
};

module.exports = verifyApiKey;
