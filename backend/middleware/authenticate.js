const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository.js");

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const headerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;
    const token = headerToken || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await userRepository.findPublicById(payload.id);
    if (!user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    req.user = user;
    return next();
};

module.exports = authenticate;
