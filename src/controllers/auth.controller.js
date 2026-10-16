import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // hash the password
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      pasword: hash,
      fullName,
    });

    const token = jwt.sign({ id: user._id }, config.jwtSecret);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function login(req, res) {
  try {
    const { username, email, password } = req.body;
    const user = await userModel.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    // verify password
    const isPasswordValid = await bcrypt.compare(user.password, password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // generating token
    const newToken = jwt.sign({ id: user._id }, config.jwtSecret);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: newToken,
      user,
    });
  } catch (error) {
    console.log(error.message);
  }
}
