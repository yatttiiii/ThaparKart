// backend/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_EXPIRES_IN = "7d"; // you can change later

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // basic checks
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!email.endsWith("@thapar.edu")) {
      return res
        .status(400)
        .json({ message: "Please use a valid @thapar.edu email." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    // no need to auto-login on register (for now)
    return res.status(201).json({
      message: "Registration successful. Please login.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in registerUser:", err);
    return res.status(500).json({ message: "Server error during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // sign JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "dev-secret-change-this",
      { expiresIn: JWT_EXPIRES_IN }
    );

    // send as httpOnly cookie + in body (for now)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set true when you use https
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Error in loginUser:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const logoutUser = (req, res) => {
  // clear token cookie
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully." });
};
