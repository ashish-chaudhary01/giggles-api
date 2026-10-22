import express from "express";
import http from "http";
import { Server } from "socket.io";
import config from "../config/config.js";

const app = express();

// http server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", config.frontendUrl],
    credentials: true,
  },
});

// used to store online users
const userSocketMap = {}; // {userId : socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  // get the user id from the query parameter sended from the frontend
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // send event to all connected users/clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // on user disconnect
  socket.on("disconnect", () => {
    // remove user from the online user object
    delete userSocketMap[userId];
    // send the event to all connected user again
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
