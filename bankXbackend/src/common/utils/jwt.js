import jwt from "jsonwebtoken";
import env from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET || "bankx_jwt_secret_key_default";
const JWT_EXPIRES_IN = "7d";

export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

export default {
    generateToken,
    verifyToken
};

