import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeTenantAccess } from "../middleware/tenant.middleware.js";
import { authorizeProjectAccess } from "../middleware/project.middleware.js";
import * as ProjectController from "../controllers/project.controller.js";

const router = Router({ mergeParams: true });

// All routes below require authentication
router.use(authenticateToken);
router.use(authorizeTenantAccess);

router.get("/", ProjectController.index);
router.get("/:projectId", authorizeProjectAccess, ProjectController.show);
router.post("/", ProjectController.store);

export default router;
