// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import connectDB from "./config/database.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log("MONGO_URI from env:", process.env.MONGO_URI);
connectDB();


app.use(
  cors({
    origin: [
      "http://localhost:5173",         // Vite dev
      "http://localhost:4173",         // Vite preview (npm run preview)
      "https://thaparkart.tiiny.site", // your Tiiny Host frontend
      // later you can add Netlify / other domains here
      // e.g. "https://thaparkart.netlify.app"
    ],
    credentials: true,
  })
);


app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

/* =======================
   OTP SERVICE (GENERIC SMTP)
   ======================= */

const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

// sanity check for env
if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_PORT ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) {
  console.error("❌ SMTP configuration missing in .env");
}

// create transporter using generic SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // usually false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// send OTP
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.endsWith("@thapar.edu")) {
      return res
        .status(400)
        .json({ message: "Valid @thapar.edu email required." });
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      return res
        .status(500)
        .json({ message: "Email service not configured on server." });
    }

    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email.toLowerCase(), { code, expiresAt });

    const mailOptions = {
      from:
        process.env.SMTP_FROM || `"ThaparKart" <no-reply@thaparkart.local>`,
      to: email,
      subject: "Your ThaparKart OTP",
      text: `Your ThaparKart OTP is: ${code}. It is valid for 5 minutes.`,
      html: `<p>Your ThaparKart OTP is: <b>${code}</b></p><p>It is valid for 5 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.messageId);

    return res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again." });
  }
});

// verify OTP
app.post("/api/auth/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP are required." });
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record) {
      return res.status(400).json({
        message: "No OTP found for this email. Please request a new one.",
      });
    }

    const { code, expiresAt } = record;

    if (Date.now() > expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (otp !== code) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    otpStore.delete(email.toLowerCase());

    return res.json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    return res
      .status(500)
      .json({ message: "Failed to verify OTP. Please try again." });
  }
});

/* =======================
   EXISTING ROUTES
   ======================= */

import userRoutes from "./routes/user/userRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";
import listingRoutes from "./routes/listing/listingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/order/orderRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "ThaparKart backend running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
