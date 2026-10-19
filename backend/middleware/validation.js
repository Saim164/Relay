const { z } = require("zod");

const registerSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username must be between 3 and 20 characters")
        .max(20, "Username must be between 3 and 20 characters"),
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Enter a valid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().min(1, "All fields are required").email("Enter a valid email address"),
    password: z.string().min(1, "All fields are required"),
});

const searchUsersSchema = z.object({
    username: z.string()
        .trim()
        .min(1, "Enter a username to search")
        .max(20, "Search must be 20 characters or fewer"),
});

const conversationSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "userId must be a 24-character MongoDB ObjectId"),
});

const messageSchema = z.object({
    text: z.string()
        .trim()
        .min(1, "Message text cannot be empty")
        .max(2000, "Message text must be 2000 characters or fewer"),
});

module.exports = { registerSchema, loginSchema, searchUsersSchema, conversationSchema, messageSchema };
