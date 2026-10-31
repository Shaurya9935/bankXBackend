import express from "express";
import customerController from "./customer.controller.js";
import authMiddleware from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/me/accounts", authMiddleware.verifyToken, customerController.getMyAccounts);

export default router;