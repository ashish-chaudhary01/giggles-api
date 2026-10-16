import express from "express";
import * as messageControllers from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send/:receiverId", messageControllers.sendMessage);

export default router;
