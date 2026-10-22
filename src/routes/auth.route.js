import express from "express";
import * as authControllers from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// sign up route
router.post("/signup", authControllers.signup);

// login route
router.post("/login", authControllers.login);

//logout route
router.get("/logout", authControllers.logout);

// update profile
router.post("/updateProfile", protectRoute, authControllers.updateProfile);

// check if the user is authenticated
router.get("/check", protectRoute, (req, res) =>
  res.status(200).json(req.user),
);

export default router;
