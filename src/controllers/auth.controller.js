import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

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
      password: hash,
      fullName,
    });

    generateToken(user._id, res);

    return res.status(201).json({
      success: true,
      message: "User signed up successfully",
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
      $or: [{ username }, { email }],
    });

    // check if user exist or not
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // generating token
    generateToken(user._id, res);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.log(error.message);
  }
}

// TODO
// change password
// forgot password
