import express from "express";
import * as messageControllers from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();
router.use(protectRoute);

router.get("/chatUsers", messageControllers.getChatUsers);
router.get("/:id", messageControllers.getMessagesByUserId);
router.post("/send/:receiverId", messageControllers.sendMessage);

export default router;
