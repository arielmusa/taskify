import { io } from "../server.js";

export const attachIO = (req, res, next) => {
  req.io = io;
  next();
};
