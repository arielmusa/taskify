import { pool } from "../config/db.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Get all tenants for the authenticated user.
 * @route GET /api/tenants
 * @access Private
 */
export const index = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Fetch tenants associated with the user
    const [rows] = await pool.execute(
      `SELECT t.id, t.name, t.created_at, t.updated_at
                 FROM tenants t
                 JOIN user_tenants ut ON t.id = ut.tenant_id
                 WHERE ut.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant details by ID for the authenticated user.
 * @route GET /api/tenants/:tenantId
 * @access Private
 */
export const show = async (req, res, next) => {
  const { tenantId } = req.params;
  const userId = req.user.id;

  try {
    // Fetch tenant details if associated with the user
    const [rows] = await pool.execute(
      `SELECT t.id, t.name, t.created_at, t.updated_at
             FROM tenants t
             JOIN user_tenants ut ON t.id = ut.tenant_id
             WHERE t.id = ? AND ut.user_id = ?`,
      [tenantId, userId]
    );

    if (rows.length === 0) {
      return next(new AppError(404, "Tenant not found"));
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new tenant and associate it with the authenticated user.
 * @route POST /api/tenants
 * @access Private
 */
export const store = async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    // Create new tenant
    const [result] = await pool.execute(
      `INSERT INTO tenants (name) VALUES (?)`,
      [name]
    );

    const tenantId = result.insertId;

    // Assign admin role to the user for the new tenant
    const [roleRows] = await pool.execute(
      `SELECT id FROM roles WHERE title = ?`,
      ["admin"]
    );

    if (roleRows.length === 0) {
      throw new AppError(500, "Admin role not found");
    }

    const adminRoleId = roleRows[0].id;

    await pool.execute(
      `INSERT INTO user_tenants (user_id, tenant_id, role_id)
     VALUES (?, ?, ?)`,
      [userId, tenantId, adminRoleId]
    );

    // Fetch and return the newly created tenant
    const [rows] = await pool.execute(
      `SELECT id, name, created_at FROM tenants WHERE id = ?`,
      [tenantId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};
