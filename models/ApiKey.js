const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    keyHash: { type: String, required: true }, // The scrambled key
    prefix: { type: String, required: true }, // The visible part (e.g., dev_key_1234)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ApiKey", apiKeySchema);
