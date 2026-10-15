const User = require("../models/userModel.js");

const findByEmail = (email) => User.findOne({ email });

const findPublicById = (id) => User.findById(id).select("-password");

const create = async (userData) => {
    const user = new User(userData);
    return user.save();
};

module.exports = { findByEmail, findPublicById, create };
