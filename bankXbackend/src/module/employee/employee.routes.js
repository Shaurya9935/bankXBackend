import express from "express";
import employeeController from "./employee.controller.js";
import authMiddleware from "../auth/auth.middleware.js";

const router = express.Router();

// Protect all employee routes with JWT verification
router.use(authMiddleware.verifyToken);

router.post("/", employeeController.createEmployee);
router.get("/", employeeController.getAllEmployees);
router.get("/:employeeId", employeeController.getEmployeeById);
router.patch("/:employeeId", employeeController.updateEmployee);
router.put("/:employeeId", employeeController.updateEmployee);
router.delete("/:employeeId", employeeController.deleteEmployee);

export default router;

