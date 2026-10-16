import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - user is not logged in" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await userModel.findById(decoded.id).select("-password");

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protected route" + error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
