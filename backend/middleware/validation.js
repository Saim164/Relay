const { z } = require("zod");
const createError = require("../utils/createError.js");
const { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE } = require("../config/attachments.js");

const REQUIRED_MESSAGE = "All fields are required";
const USERNAME_LENGTH_MESSAGE = "Username must be between 3 and 20 characters";
const SEARCH_MESSAGE = "Enter a username to search";
const LIMIT_MESSAGE = "limit must be an integer from 1 to 50";

const requiredString = () => z.string({ error: REQUIRED_MESSAGE });

const registerSchema = z.object({
    username: requiredString()
        .trim()
        .min(3, USERNAME_LENGTH_MESSAGE)
        .max(20, USERNAME_LENGTH_MESSAGE),
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
        .min(1, REQUIRED_MESSAGE)
        .email("Enter a valid email address"),
    password: requiredString().min(1, REQUIRED_MESSAGE),
});

const searchUsersSchema = z.object({
    username: z.string({ error: SEARCH_MESSAGE })
        .trim()
        .min(1, SEARCH_MESSAGE)
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

const listMessagesSchema = z.object({
    before: z.coerce.date({ error: "before must be a valid date" }).optional(),
    limit: z.coerce.number({ error: LIMIT_MESSAGE })
        .int(LIMIT_MESSAGE)
        .min(1, LIMIT_MESSAGE)
        .max(50, LIMIT_MESSAGE)
        .default(30),
});

const signAttachmentSchema = z.object({
    name: requiredString()
        .trim()
        .min(1, "File name is required")
        .max(200, "File name must be 200 characters or fewer"),
    type: z.enum(ALLOWED_ATTACHMENT_TYPES, { error: "This file type is not allowed" }),
    size: z.number({ error: "File size is required" })
        .int("File size must be a whole number")
        .positive("File is empty")
        .max(MAX_ATTACHMENT_SIZE, "File must be 10 MB or smaller"),
});

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
    signAttachmentSchema,
    validateBody,
    validateQuery,
};
