const User = require("../models/userModel.js");

const findByEmail = (email) => User.findOne({ email });

const findPublicById = (id) => User.findById(id).select("-password");

const searchByUsername = (username, excludedUserId) => {
    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return User.find({
        username: { $regex: escapedUsername, $options: "i" },
        _id: { $ne: excludedUserId },
    })
        .select("_id username")
        .sort({ username: 1 })
        .limit(20);
};

const create = (userData) => User.create(userData);

module.exports = { findByEmail, findPublicById, searchByUsername, create };
