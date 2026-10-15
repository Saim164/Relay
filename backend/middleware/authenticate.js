const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const headerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;
    const token = headerToken || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authenticate;
