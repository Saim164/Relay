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

const searchUsersSchema = z.object({
    username: z.string().trim().min(1, "Enter a username to search").max(20, "Search must be 20 characters or fewer"),
});

module.exports = { registerSchema, loginSchema, searchUsersSchema };
