const { getUserFromToken } = require("../services/authService.js");
const createError = require("../utils/createError.js");

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const headerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
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
