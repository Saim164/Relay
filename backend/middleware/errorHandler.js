// Every error response has the same shape: { message }.
const errorHandler = (error, req, res, next) => {
    // MongoDB duplicate key, e.g. registering a username or email that is taken.
    if (error.code === 11000) {
        return res.status(409).json({ message: "Username or email is already in use" });
    }

    // createError sets statusCode; Express's JSON parser sets it too (e.g. 400 for invalid JSON).
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
        console.error(error);
    }

    return res.status(statusCode).json({
        message: statusCode >= 500 ? "Something went wrong" : error.message,
    });
};

module.exports = errorHandler;
