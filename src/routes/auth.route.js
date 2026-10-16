import express from "express";
import * as authControllers from "../controllers/auth.controller.js";

const router = express.Router();

// sign up route
router.post("/signup", authControllers.signup);

// login route
router.post("/login", authControllers.signup);

// logout route
router.post("/logout", authControllers.signup);

export default router;
