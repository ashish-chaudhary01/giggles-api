import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function generateToken(userId, res) {
  const token = jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // in ms(miliseconds)
    httpOnly: true,
    sameSite: config.nodeEnv === "production" ? "none" : "strict",
    secure: config.nodeEnv === "production",
  });
}
