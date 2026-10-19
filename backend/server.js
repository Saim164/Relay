require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes.js");
const conversationRoutes = require("./routes/conversationRoutes.js");
const { apiLimiter } = require("./middleware/rateLimiters.js");
const errorHandler = require("./middleware/errorHandler.js");
const createError = require("./utils/createError.js");
const { initSocket } = require("./socket.js");

if (!process.env.MONGO_URL || !process.env.JWT_SECRET) {
  throw new Error("MONGO_URL and JWT_SECRET must be set");
}

const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Relay API is running" });
});

app.use("/api", apiLimiter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/conversations", conversationRoutes);

app.use((req, res, next) => {
  next(createError("Route not found", 404));
});

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const server = http.createServer(app);
    initSocket(server, allowedOrigins);

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

start();
