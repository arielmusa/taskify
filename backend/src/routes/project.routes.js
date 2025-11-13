import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeTenantAccess } from "../middleware/tenant.middleware.js";
import { authorizeProjectAccess } from "../middleware/project.middleware.js";
import * as ProjectController from "../controllers/project.controller.js";
import statusRoutes from "./status.routes.js";

const router = Router({ mergeParams: true });

// All routes below require authentication
router.use(authenticateToken);
router.use(authorizeTenantAccess);

router.get("/", ProjectController.index);
router.get("/:projectId", authorizeProjectAccess, ProjectController.show);
router.post("/", ProjectController.store);

// Nested routes
router.use("/:projectId/statuses", authorizeProjectAccess, statusRoutes);

export default router;
