import { HttpError } from "../dto/base.dto.js";

export const validate = (rules) => (req, res, next) => {
  const details = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body[field];
    if (rule.required && (value === undefined || value === null || String(value).trim() === "")) {
      details.push({ field, message: `${field} is required` });
      continue;
    }
    if (value !== undefined && value !== null && rule.validate && !rule.validate(value)) {
      details.push({ field, message: rule.message || `${field} is invalid` });
    }
  }
  if (details.length) {
    next(new HttpError(400, "Validation failed", "VALIDATION_ERROR", details));
    return;
  }
  next();
};

export const positiveAmount = (value) => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0;