import express from "express";
import http from "http";
import { Server } from "socket.io";
import config from "../config/config.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";

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

// socket connection
io.on("connection", async (socket) => {
  // get the user id from the query parameter sended from the frontend
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // send event to all connected users/clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // now whenever the user comes online mark the every pending message status as delivered
  // and if the senders are online marks the status in real time with event
  try {
    const pendingMessages = await messageModel
      .find({ receiverId: userId, status: { $eq: "sent" } })
      .select("_id senderId");

    // now iterate to every message,update the status and send the event
    for (const message of pendingMessages) {
      const deliveredMessage = await messageModel.findOneAndUpdate(
        { _id: message._id, status: "sent" },
        { $set: { status: "delivered" } },
        { new: true },
      );

      const senderSocketId = getReceiverSocketId(
        deliveredMessage.senderId.toString(),
      );

      if (senderSocketId) {
        // means sender is online and emit the event
        io.to(senderSocketId).emit("messageStatusUpdated", {
          messageId: deliveredMessage._id.toString(),
          status: "delivered",
        });
      }
    }
  } catch (error) {
    console.log("Error in syncing messages", error);
  }

  // if receiver is in the chat and sees the new message mark the status seen
  // listen for message seen event from the receiver
  socket.on("markMessageSeen", async (data) => {
    const message = await messageModel.findByIdAndUpdate(
      { _id: data.messageId },
      {
        $set: { status: "seen" },
      },
    );

    const senderSocketId = getReceiverSocketId(message.senderId.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        messageId: message._id.toString(),
        status: "seen",
      });
    }
  });

  // on user disconnect
  // remove user from the online user object
  // and update its last seen
  socket.on("disconnect", async () => {
    // if (userSocketMap[userId] === socket.id) {
    //   const user = await userModel.findById(userId);
    //   user.lastSeenAt = new Date();
    //   await user.save();
    const userId = Object.keys(userSocketMap).find(
      (id) => userSocketMap[id] === socket.id,
    );

    if (userId) {
      const user = await userModel.findByIdAndUpdate(
        userId,
        {
          lastSeenAt: new Date(),
        },
        { new: true },
      );

      io.emit("userOffline", {
        userId: userId.toString(),
        lastSeenAt: user.lastSeenAt,
      });

      delete userSocketMap[userId];
    }

    // send the event to all connected user again
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
