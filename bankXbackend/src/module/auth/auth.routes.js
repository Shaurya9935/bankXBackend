import express from "express";
import authController from "./auth.controller.js";
import authMiddleware from "./auth.middleware.js";

const router = express.Router();

router.post("/register", authMiddleware.validateRegister, authController.register);
router.post("/login", authMiddleware.validateLogin, authController.login);

export default router;