import express from "express";
import cors from "cors";
import "dotenv/config";
import { AppError, errorHandler } from "./middleware/error.middleware.js";
import { testConnection } from "./config/db.js";
import { attachIO } from "./middleware/socket.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(attachIO);
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);

// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(404, "Resource not found"));
});

// Error handling middleware
app.use(errorHandler);

export default app;
