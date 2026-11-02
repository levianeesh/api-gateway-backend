const RequestLog = require("../models/RequestLog");

const requestLogger = (req, res, next) => {
  // Record the exact time the request arrived
  const start = Date.now();

  // Listen for the 'finish' event, which fires right after the response is sent back to the user
  res.on("finish", async () => {
    const duration = Date.now() - start;

    // Only log this if the developer successfully authenticated with an API key
    if (req.apiKey) {
      try {
        const log = new RequestLog({
          apiKeyId: req.apiKey._id,
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          responseTime: duration,
        });
        await log.save();
      } catch (err) {
        console.error("Failed to log request:", err);
      }
    }
  });

  // Pass control to the next middleware or route
  next();
};

module.exports = requestLogger;
