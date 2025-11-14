import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { testConnection } from "./config/db.js";

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    const room = `project_${projectId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
});

server.listen(PORT, async () => {
  await testConnection();
  console.log(`Server is running on port ${PORT}`);
});
