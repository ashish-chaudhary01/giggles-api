import { server, app } from "./src/lib/socket.js";
import config from "./src/config/config.js";
import connectDb from "./src/lib/db.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.routes.js";

// set dns for database
import dns from "dns";
dns.setServers(["0.0.0.0", "8.8.8.8"]);

// middlewares
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
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/message", messageRoutes);

server.listen(config.port, (req, res) => {
  console.log(`Server is running on port ${config.port}`);
  connectDb();
});
