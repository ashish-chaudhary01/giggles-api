import express from "express";
import * as messageControllers from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();
router.use(protectRoute);

router.get("/chatUsers", messageControllers.getChatUsers);
router.get("/:id", messageControllers.getMessagesByUserId);
router.post("/:receiverId", messageControllers.sendMessage);
router.delete("/:receiverId", messageControllers.deleteMessages);

export default router;
