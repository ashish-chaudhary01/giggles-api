import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

// http server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

io.on("connection", (socket) => {
  console.log("user connected");
  console.log("id: ", socket.id);

  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", data);
  });
});

export { io, app, server };
