import { HttpError } from "../dto/base.dto.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    next(new HttpError(401, "Authentication is required", "AUTHENTICATION_REQUIRED"));
    return;
  }
  try {
    req.auth = verifyToken(header.slice(7));
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    next(new HttpError(403, "You do not have permission to perform this action", "FORBIDDEN"));
    return;
  }
  next();
};