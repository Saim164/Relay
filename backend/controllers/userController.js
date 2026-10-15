const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const registerSchema = z.object({
    username: z.string().trim().min(3, "Username must be between 3 and 20 characters").max(20, "Username must be between 3 and 20 characters"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().min(1, "All fields are required").email("Enter a valid email address"),
    password: z.string().min(1, "All fields are required"),
});

const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
});

const register = async (req, res) => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            const body = req.body && typeof req.body === "object" ? req.body : {};
            const missingFields = ["username", "email", "password"].some((field) => !Object.hasOwn(body, field));
            const message = missingFields ? "All fields are required" : validation.error.issues[0].message;
            return res.status(400).json({ message });
        }

        const { username, email, password } = validation.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            email,
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
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.issues[0].message });
        }

        const { email, password } = validation.data;
        const user = await User.findOne({ email });

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

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3 * 24 * 60 * 60 * 1000,
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
