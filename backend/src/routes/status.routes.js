import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeTenantAccess } from "../middleware/tenant.middleware.js";
import { authorizeProjectAccess } from "../middleware/project.middleware.js";
import * as statusController from "../controllers/status.controller.js";

const router = Router({ mergeParams: true });

// Apply authentication middleware to all routes
router.use(authenticateToken);
/* router.use(authorizeTenantAccess);
router.use(authorizeProjectAccess); */

// GET /api/tenants/:tenantId/projects/:projectId/statuses
router.get("/", statusController.index);
// POST /api/tenants/:tenantId/projects/:projectId/statuses
router.post("/", statusController.store);

export default router;
