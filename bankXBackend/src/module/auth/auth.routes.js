import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import * as controller from "./auth.controller.js";

const router = Router();
const email = { required: true, validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "email must be valid" };
router.post("/register", validate({
  fullName: { required: true }, email, phone: { required: true }, password: { required: true, validate: (v) => String(v).length >= 8, message: "password must be at least 8 characters" }
}), controller.register);
router.post("/login", validate({ email, password: { required: true } }), controller.login);
router.get("/me", authenticate, controller.me);
export default router;