import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // user joins private room
    socket.on("joinRoom", (userId) => {
      socket.join(userId);

      console.log("Joined room:", userId);
    });

    // receive message
    socket.on("sendMessage", (data) => {
      /*
        data:
        {
          receiverId,
          message
        }
        */

      io.to(data.receiverId).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export const getIO = () => io;
