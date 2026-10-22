import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import cloudinary from "../lib/cloudinary.js";

export async function signup(req, res) {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Password must be at least 3 characters" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers, and underscores",
      });
    }

    const existingUser = await userModel.find({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      username,
      email,
      password: hash,
      fullName,
    });
    if (user) {
      generateToken(user._id, res);
      res.status(201).json({
        success: true,
        message: "User signed up successfully",
        user,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
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

export async function logout(req, res) {
  try {
    res
      .clearCookie("jwt")
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { fullName, username, profilePic, bio } = req.body;
    const userId = req.user._id;

    let updateData = {};

    if (fullName) {
      updateData.fullName = fullName;
    }
    if (bio) {
      updateData.bio = bio;
    }
    if (username) {
      // check if the username already exist
      const existingUser = await userModel.findOne({ username: username });

      if (existingUser) {
        return res.status(409).json({ message: "Username already exist!" });
      }

      updateData.username = username;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller");
    res.status(500).json({ error: "Internal server error" });
  }
}
