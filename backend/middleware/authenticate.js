const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository.js");
const createError = require("../utils/createError.js");

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const headerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;
    const token = headerToken || req.cookies?.token;

    if (!token) {
        throw createError("Authentication required", 401);
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw createError("Invalid or expired token", 401);
    }

    const user = await userRepository.findPublicById(payload.id);
    if (!user) {
        throw createError("Authentication required", 401);
    }

    req.user = user;
    return next();
};

module.exports = authenticate;
