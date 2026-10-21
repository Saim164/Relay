const rateLimit = require("express-rate-limit");

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

const createLimiter = (limit) => rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
});

const apiLimiter = createLimiter(100);
const authLimiter = createLimiter(10);

module.exports = { apiLimiter, authLimiter };
