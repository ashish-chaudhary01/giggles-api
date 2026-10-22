import express from "express";
import { searchUser } from "../controllers/user.controller";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/search", protectRoute, searchUser);

export default router;
