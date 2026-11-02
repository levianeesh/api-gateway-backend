const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mockApiRoutes = require("./routes/mockApi");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const keyRoutes = require("./routes/Keys");
const webhookRoutes = require("./routes/webhooks");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/v1", mockApiRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/analytics", analyticsRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/api-keys", keyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
