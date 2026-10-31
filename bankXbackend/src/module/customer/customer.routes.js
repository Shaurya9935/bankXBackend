import express from "express";
import customerController from "./customer.controller.js";
import authMiddleware from "../auth/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get("/me", customerController.getProfile);
router.patch("/me", customerController.updateProfile);
router.get("/me/accounts", customerController.getMyAccounts);

export default router;
