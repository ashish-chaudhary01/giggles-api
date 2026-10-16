import express from "express";
import morgan from "morgan";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import config from "./config/config.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import dns from "dns";
dns.setServers(["0.0.0.0", "8.8.8.8"]);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin:
      config.nodeEnv === "production"
        ? config.frontendUrl
        : "http://localhost:5173",
    credentials: true,
  }),
);

// health api
app.use("/api/health", (req, res) => {
  res.status(200).send({
    success: true,
    message: "giggles api is running",
  });
});

// routes
app.use("/api/auth", authRoutes);

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

export default server;
