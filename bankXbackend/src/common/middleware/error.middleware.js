const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
        code: err.code || (statusCode >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR"),
        errors: err.errors || null
    });
};

export default errorHandler;

