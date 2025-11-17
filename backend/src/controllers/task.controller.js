import { pool } from "../config/db.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Get all tasks for a specific project.
 * @route GET /api/tenants/:tenantId/projects/:projectId/tasks
 * @access Private
 * */
export const index = async (req, res, next) => {
  const projectId = Number(req.params.projectId);

  try {
    // Fetch tasks associated with the project
    const [rows] = await pool.execute(
      `SELECT 
           t.id,
           t.title,
           t.description,
           t.status_id,
           ts.name AS status_name,
           ts.color AS status_color,
           ts.position AS status_position,
           t.project_id,
           t.created_at,
           t.updated_at
         FROM tasks t
         JOIN task_statuses ts ON t.status_id = ts.id
         WHERE t.project_id = ?
         ORDER BY ts.position ASC, t.created_at DESC`,
      [projectId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Get task details by ID for a specific project.
 * @route GET /api/tenants/:tenantId/projects/:projectId/tasks/:taskId
 * @access Private
 */
export const show = async (req, res, next) => {
  const { projectId, taskId } = req.params;

  try {
    // Fetch task details
    const [rows] = await pool.execute(
      `SELECT 
             t.id,
             t.title,
             t.description,
             t.status_id,
             ts.name AS status_name,
             ts.color AS status_color,
             ts.position AS status_position,
             t.project_id,
             t.created_at,
             t.updated_at
             FROM tasks t
             JOIN task_statuses ts ON t.status_id = ts.id
             WHERE t.id = ? AND t.project_id = ?`,
      [taskId, projectId]
    );

    if (rows.length === 0) {
      return next(new AppError(404, "Task not found"));
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task for a project
 * @route POST /api/tenants/:tenantId/projects/:projectId/tasks
 * @access Private
 */
export const store = async (req, res, next) => {
  const projectId = Number(req.params.projectId);
  const { title, description, status_id } = req.body;

  try {
    if (!title || title.trim() === "") {
      return next(new AppError(400, "Task title is required"));
    }

    let finalStatusId = status_id;

    // Validate status_id if provided, else assign default status
    if (status_id) {
      const [statusRows] = await pool.execute(
        `SELECT id FROM task_statuses WHERE id = ? AND project_id = ?`,
        [status_id, projectId]
      );

      if (statusRows.length === 0) {
        return next(new AppError(400, "Invalid status_id for this project"));
      }
    } else {
      const [defaultStatusRows] = await pool.execute(
        `SELECT id FROM task_statuses WHERE project_id = ? ORDER BY position ASC LIMIT 1`,
        [projectId]
      );

      if (defaultStatusRows.length === 0) {
        return next(new AppError(400, "No statuses defined for this project"));
      }
      finalStatusId = defaultStatusRows[0].id;
    }

    // Insert new task into the database
    const [result] = await pool.execute(
      `INSERT INTO tasks (project_id, title, description, status_id)
          VALUES (?, ?, ?, ?)`,
      [projectId, title, description ?? null, finalStatusId]
    );

    // Fetch the newly created task
    const [rows] = await pool.execute(
      `SELECT id, title, description, status_id, project_id, created_at, updated_at
         FROM tasks
         WHERE id = ?`,
      [result.insertId]
    );

    if (req.io) {
      req.io.to(`project_${projectId}`).emit("taskCreated", rows[0]);
    }

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task in a project
 * @route PUT /api/tenants/:tenantId/projects/:projectId/tasks/:taskId
 * @access Private
 */
export const update = async (req, res, next) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);
  const { title, description, status_id } = req.body;

  try {
    // Check if task exists and belongs to this project
    const [existing] = await pool.execute(
      `SELECT id FROM tasks WHERE id = ? AND project_id = ?`,
      [taskId, projectId]
    );

    if (existing.length === 0) {
      return next(new AppError(404, "Task not found"));
    }

    // validate status_id if provided
    if (status_id !== undefined) {
      const [statusRows] = await pool.execute(
        `SELECT id FROM task_statuses WHERE id = ? AND project_id = ?`,
        [status_id, projectId]
      );

      if (statusRows.length === 0) {
        return next(new AppError(400, "Invalid status_id for this project"));
      }
    }

    // Update the task
    const [result] = await pool.execute(
      `UPDATE tasks 
         SET title = COALESCE(?, title),
             description = COALESCE(?, description),
             status_id = COALESCE(?, status_id),
             updated_at = NOW()
         WHERE id = ? AND project_id = ?`,
      [title ?? null, description ?? null, status_id ?? null, taskId, projectId]
    );

    // Fetch the updated task
    const [rows] = await pool.execute(
      `SELECT id, title, description, status_id, project_id, created_at, updated_at
         FROM tasks
         WHERE id = ?`,
      [taskId]
    );

    if (req.io) {
      req.io.to(`project_${projectId}`).emit("taskUpdated", rows[0]);
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task from a project
 * @route DELETE /api/tenants/:tenantId/projects/:projectId/tasks/:taskId
 * @access Private
 */
export const destroy = async (req, res, next) => {
  const projectId = Number(req.params.projectId);
  const taskId = Number(req.params.taskId);

  try {
    // Delete the task
    const [result] = await pool.execute(
      `DELETE FROM tasks WHERE id = ? AND project_id = ?`,
      [taskId, projectId]
    );

    if (result.affectedRows === 0) {
      return next(new AppError(404, "Task not found"));
    }

    if (req.io) {
      req.io.to(`project_${projectId}`).emit("taskDeleted", { id: taskId });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
