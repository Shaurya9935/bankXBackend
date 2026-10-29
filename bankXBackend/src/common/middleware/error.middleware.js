import { HttpError } from "../dto/base.dto.js";

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: "NOT_FOUND",
    details: []
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const knownError = error instanceof HttpError;
  const databaseUnavailable = ["ER_ACCESS_DENIED_ERROR", "ECONNREFUSED", "PROTOCOL_CONNECTION_LOST"].includes(error.code);
  const status = knownError ? error.status : error.code === "ER_DUP_ENTRY" ? 409 : databaseUnavailable ? 503 : 500;
  const message = knownError
    ? error.message
    : error.code === "ER_DUP_ENTRY"
      ? "A record with the same unique value already exists"
      : databaseUnavailable
        ? "Database connection is unavailable. Check the backend database configuration."
      : "Internal server error";

  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    message,
    code: knownError ? error.code : error.code === "ER_DUP_ENTRY" ? "DUPLICATE_VALUE" : databaseUnavailable ? "DATABASE_UNAVAILABLE" : "INTERNAL_ERROR",
    details: knownError ? error.details : []
  });
};