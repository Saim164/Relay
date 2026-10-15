const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute.js");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

if (!process.env.MONGO_URL || !process.env.JWT_SECRET) {
  throw new Error("MONGO_URL and JWT_SECRET must be set");
}

app.use(helmet());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

start();
