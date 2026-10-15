const authService = require("../services/authService.js");
const userService = require("../services/userService.js");

const register = async (req, res) => {
    await authService.register(req.validatedBody);
    return res.status(201).json({ message: "User registered successfully" });
};

const login = async (req, res) => {
    const { token, user } = await authService.login(req.validatedBody);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful", token, user });
};

const getCurrentUser = (req, res) => {
    return res.status(200).json({ user: userService.toPublicUser(req.user) });
};

const searchUsers = async (req, res) => {
    const users = await userService.searchUsers(req.validatedQuery.username, req.user._id);
    return res.status(200).json({ users });
};

module.exports = { register, login, getCurrentUser, searchUsers };
