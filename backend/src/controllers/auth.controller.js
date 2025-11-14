import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { AppError } from "../middleware/error.middleware.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Register a new user.
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }
    // Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      throw new AppError(409, "User already exists");
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in database
    const [result] = await pool.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    const user = {
      id: result.insertId,
      email,
    };

    //Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });

    // Respond with success
    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user.
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }

    // Retrieve user from database
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      throw new AppError(401, "Invalid email or password");
    }

    const user = users[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }
    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });

    // Respond with token
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile.
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req, res, next) => {
  const userId = req.user.id;
  try {
    // Retrieve user profile from database
    const [users] = await pool.query(
      "SELECT id, email FROM users WHERE id = ?",
      [userId]
    );

    const user = users[0];

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Respond with user profile
    res.status(200).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
