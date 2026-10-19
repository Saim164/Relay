const { z } = require("zod");
const createError = require("../utils/createError.js");

// A missing or non-string field gets the same friendly message everywhere.
const requiredString = () => z.string({ error: "All fields are required" });

const registerSchema = z.object({
    username: requiredString()
        .trim()
        .min(3, "Username must be between 3 and 20 characters")
        .max(20, "Username must be between 3 and 20 characters"),
    email: requiredString()
        .trim()
        .toLowerCase()
        .email("Enter a valid email address"),
    password: requiredString()
        .min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
    email: requiredString()
        .trim()
        .toLowerCase()
        .min(1, "All fields are required")
        .email("Enter a valid email address"),
    password: requiredString().min(1, "All fields are required"),
});

const searchUsersSchema = z.object({
    username: z.string({ error: "Enter a username to search" })
        .trim()
        .min(1, "Enter a username to search")
        .max(20, "Search must be 20 characters or fewer"),
});

const startConversationSchema = z.object({
    userId: requiredString().regex(/^[0-9a-fA-F]{24}$/, "userId must be a 24-character MongoDB ObjectId"),
});

const sendMessageSchema = z.object({
    text: requiredString()
        .trim()
        .min(1, "Message text cannot be empty")
        .max(2000, "Message text must be 2000 characters or fewer"),
});

const limitError = "limit must be an integer from 1 to 50";
const listMessagesSchema = z.object({
    before: z.coerce.date({ error: "before must be a valid date" }).optional(),
    limit: z.coerce.number({ error: limitError })
        .int(limitError)
        .min(1, limitError)
        .max(50, limitError)
        .default(30),
});

// Validates req[source] and stores the cleaned data on req.validatedBody / req.validatedQuery.
// (Express 5 doesn't allow overwriting req.query, so we use separate properties.)
const validate = (schema, source, target) => (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
        return next(createError(result.error.issues[0].message, 400));
    }

    req[target] = result.data;
    return next();
};

const validateBody = (schema) => validate(schema, "body", "validatedBody");
const validateQuery = (schema) => validate(schema, "query", "validatedQuery");

module.exports = {
    registerSchema,
    loginSchema,
    searchUsersSchema,
    startConversationSchema,
    sendMessageSchema,
    listMessagesSchema,
    validateBody,
    validateQuery,
};
