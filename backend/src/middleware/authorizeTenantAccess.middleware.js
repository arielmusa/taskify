import { pool } from "../config/db";
import { AppError } from "../middleware/error.middleware.js";

export const authorizeTenantAccess = async (req, res, next) => {
  const { tenantId } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user has access to the tenant and get their role
    const [rows] = await pool.execute(
      `SELECT ut.role_id, r.title AS role_name
           FROM user_tenants ut
           JOIN roles r ON ut.role_id = r.id
           WHERE ut.user_id = ? AND ut.tenant_id = ?
           LIMIT 1`,
      [userId, tenantId]
    );
    // If no access, return 404
    if (rows.length === 0) {
      return next(new AppError(404, "Tenant not found"));
    }

    // Attach tenant access info to the request object
    req.tenantAccess = {
      tenantId: Number(tenantId),
      roleId: rows[0].role_id,
      roleName: rows[0].role_name,
    };

    next();
  } catch (error) {
    next(error);
  }
};
