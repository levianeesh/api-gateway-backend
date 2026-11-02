const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: { type: String, required: true }, // The developer's server URL
    secret: { type: String, required: true }, // Used to sign the payload securely
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Webhook", webhookSchema);
