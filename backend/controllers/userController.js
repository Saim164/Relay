const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

const emailPattern = /^\S+@\S+\.\S+$/;

const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
});

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const normalizedUsername = typeof username === "string" ? username.trim() : "";
        const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";

        if (!normalizedUsername || !normalizedEmail || typeof password !== "string") {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
            return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
        }

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({ message: "Enter a valid email address" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
        });
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username or email is already in use" });
        }

        console.error("Registration error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "3d",
        });

        return res.status(200).json({
            message: "Login successful",
            token,
            user: toPublicUser(user),
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const getCurrentUser = async (req, res) => {
    return res.status(200).json({ user: toPublicUser(req.user) });
};

module.exports = { register, login, getCurrentUser };
