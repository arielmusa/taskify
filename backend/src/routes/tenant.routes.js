import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import * as TenantController from "../controllers/tenant.controller.js";

const router = Router();

// All routes below require authentication
router.use(authenticateToken);

router.get("/", TenantController.index);
router.get("/:tenantId", TenantController.show);
router.post("/", TenantController.store);

export default router;
