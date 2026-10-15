const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    req.validatedQuery = result.data;
    return next();
};

module.exports = validateQuery;
