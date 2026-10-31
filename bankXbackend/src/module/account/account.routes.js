import express from "express";
import accountController from "./account.controller.js";
import authMiddleware from "../auth/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post("/", accountController.createAccount);
router.get("/", accountController.getMyAccounts);
router.get("/:accountId", accountController.getMyAccount);

export default router;
