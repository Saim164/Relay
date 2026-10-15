const validateRequest = (schema, requiredFields = []) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const hasMissingFields = requiredFields.some((field) => typeof body[field] !== "string");
        const message = hasMissingFields ? "All fields are required" : result.error.issues[0].message;
        return res.status(400).json({ message });
    }

    req.validatedBody = result.data;
    return next();
};

module.exports = validateRequest;
