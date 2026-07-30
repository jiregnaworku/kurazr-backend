import "dotenv/config";

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

// Create HTTP server
const server = http.createServer(app);

// Socket.IO
// Socket.IO
export const io = new Server(server, {
  cors: {
    origin: ["https://kuraz-website.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket Events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user room
  socket.on("join", (userId) => {
    socket.join(userId);

    console.log(`User ${userId} joined room`);
  });

  // Receive and broadcast message
  socket.on("sendMessage", (message) => {
    // Send to receiver if available
    if (message.receiver) {
      io.to(message.receiver).emit("receiveMessage", message);
    }

    // Also send back to sender
    if (message.sender) {
      io.to(message.sender).emit("receiveMessage", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
