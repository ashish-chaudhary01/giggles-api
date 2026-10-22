import express from "express";
import * as messageControllers from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// router.get("/search",protectRoute,searchUser);
router.get("/chatUsers", protectRoute, messageControllers.getChatUsers);
router.get("/:id", protectRoute, messageControllers.getMessagesByUserId);
router.post("/send/:receiverId", protectRoute, messageControllers.sendMessage);

export default router;
