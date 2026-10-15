const rateLimit = require("express-rate-limit");

const createLimiter = (limit) => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
});

const apiLimiter = createLimiter(100);
const authLimiter = createLimiter(10);

module.exports = { apiLimiter, authLimiter };
