const errorHandler = (error, req, res, next) => {
    if (error.code === 11000) {
        return res.status(409).json({ message: "Username or email is already in use" });
    }

    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
        console.error(error);
    }

    return res.status(statusCode).json({
        message: statusCode >= 500 ? "Something went wrong" : error.message,
    });
};

module.exports = errorHandler;
