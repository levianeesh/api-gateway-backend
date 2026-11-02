const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema(
  {
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
    },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true }, // in milliseconds
  },
  { timestamps: true },
);

module.exports = mongoose.model("RequestLog", requestLogSchema);
