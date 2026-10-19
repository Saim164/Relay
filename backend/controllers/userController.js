const authService = require("../services/authService.js");
const userService = require("../services/userService.js");

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const register = async (req, res) => {
    await authService.register(req.validatedBody);
    return res.status(201).json({ message: "User registered successfully" });
};

const login = async (req, res) => {
    const { token, user } = await authService.login(req.validatedBody);

    res.cookie("token", token, { ...authCookieOptions, maxAge: THREE_DAYS_MS });

    return res.status(200).json({ message: "Login successful", token, user });
};

const logout = (req, res) => {
    res.clearCookie("token", authCookieOptions);
    return res.status(200).json({ message: "Logged out successfully" });
};

const getCurrentUser = (req, res) => {
    return res.status(200).json({ user: userService.toPublicUser(req.user) });
};

const searchUsers = async (req, res) => {
    const users = await userService.searchUsers(req.validatedQuery.username, req.user._id);
    return res.status(200).json({ users });
};

module.exports = { register, login, logout, getCurrentUser, searchUsers };
