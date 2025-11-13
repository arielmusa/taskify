import { pool } from "../config/db.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Get all projects for a specific tenant.
 *
 * @route GET /api/tenants/:tenantId/projects
 * @access Private
 */

export const index = async (req, res, next) => {
  const userId = req.user.id;
  const { tenantId } = req.params;
  try {
    // Fetch projects associated with the tenant
    const [rows] = await pool.execute(
      `SELECT id, name, description, created_at, updated_at
         FROM projects
         WHERE tenant_id = ?`,
      [tenantId]
    );

    if (rows.length === 0) {
      throw new AppError(404, "No projects found for this tenant");
    }

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project details by ID for a specific tenant.
 *
 * @route GET /api/tenants/:tenantId/projects/:projectId
 * @access Private
 */

export const show = async (req, res, next) => {
  const { tenantId, projectId } = req.params;
  const userId = req.user.id;

  try {
    // Fetch project details
    const [rows] = await pool.execute(
      `SELECT id, name, description, created_at, updated_at
         FROM projects
         WHERE id = ? AND tenant_id = ?`,
      [projectId, tenantId]
    );

    if (rows.length === 0) {
      return next(new AppError(404, "Project not found"));
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project for a specific tenant.
 * Seeds default task statuses upon creation.
 * @route POST /api/tenants/:tenantId/projects
 * @access Private
 */

export const store = async (req, res, next) => {
  const { tenantId } = req.params;
  const { name, description } = req.body;

  try {
    if (!name || name.trim() === "") {
      return next(new AppError(400, "Project name is required"));
    }

    // Create new project
    const [projectResult] = await pool.execute(
      `INSERT INTO projects (name, description, tenant_id) VALUES (?, ?, ?)`,
      [name, description, tenantId]
    );

    const projectId = projectResult.insertId;

    const defaultStatuses = [
      { name: "To Do", color: "#FF0000", position: 1 },
      { name: "In Progress", color: "#00FF00", position: 2 },
      { name: "Done", color: "#0000FF", position: 3 },
    ];

    for (const status of defaultStatuses) {
      await pool.execute(
        `INSERT INTO task_statuses (project_id, name, color, position) VALUES (?, ?, ?, ?)`,
        [projectId, status.name, status.color, status.position]
      );
    }

    res.status(201).json({ id: projectId, name, description });
  } catch (error) {
    next(error);
  }
};
