const { getUserFromToken } = require("../services/authService.js");
const createError = require("../utils/createError.js");

const BEARER_PREFIX = "Bearer ";

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const headerToken = authorization?.startsWith(BEARER_PREFIX)
        ? authorization.slice(BEARER_PREFIX.length)
        : null;
    const token = headerToken || req.cookies?.token;

    const user = await getUserFromToken(token);
    if (!user) {
        throw createError("Authentication required", 401);
    }

    req.user = user;
    return next();
};

module.exports = authenticate;
