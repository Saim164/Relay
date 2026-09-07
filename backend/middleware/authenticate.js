const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const token = authorization.slice(7);

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
