const axios = require("axios");
const crypto = require("crypto");

const dispatchWebhook = async (url, secret, payload) => {
  try {
    // 1. Convert the JSON payload to a string
    const payloadString = JSON.stringify(payload);

    // 2. Generate the HMAC signature using the developer's unique secret
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");

    // 3. Send the POST request to the developer's server
    await axios.post(url, payloadString, {
      headers: {
        "Content-Type": "application/json",
        "x-webhook-signature": signature, // The developer checks this header to verify it's you
      },
      timeout: 5000, // Don't let a slow developer server hang our system
    });

    console.log(`[SUCCESS] Webhook delivered to ${url}`);
  } catch (error) {
    console.error(`[FAILED] Webhook delivery to ${url}:`, error.message);
    // Note: In an enterprise app, this is where we would trigger the Exponential Backoff retry logic
  }
};

module.exports = dispatchWebhook;
