import { pool } from "../config/db.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Get all statuses for a specific project.
 *
 * @route GET /api/tenants/:tenantId/projects/:projectId/statuses
 * @access: Private
 */

export const index = async (req, res, next) => {
  const { projectId } = req.params;
  try {
    // Fetch status associated with the project
    const [rows] = await pool.execute(
      `SELECT id, name, color, position, created_at, updated_at
         FROM task_statuses
         WHERE project_id = ?
         ORDER BY position ASC`,
      [projectId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new status for a project
 * @route POST /projects/:projectId/statuses
 * @access Private
 */

export const store = async (req, res, next) => {
  const { projectId } = req.params;
  const { name, color, position } = req.body;

  try {
    if (!name || name.trim() === "") {
      return next(new AppError(400, "Status name is required"));
    }

    // Insert new status into the database
    const [result] = await pool.execute(
      `INSERT INTO statuses (project_id, name, color, position)
          VALUES (?, ?, ?, ?)`,
      [projectId, name, color ?? null, position ?? 0]
    );

    // Fetch the newly created status
    const [rows] = await pool.execute(
      `SELECT id, name, color, position, created_at, updated_at
         FROM task_statuses
         WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};
