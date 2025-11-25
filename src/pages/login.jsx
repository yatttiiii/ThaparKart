// src/pages/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import image1 from "../assets/image-1.png";
import BackButton from "../assets/icons/BackButton.svg";

import "../styles/Login.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// emails that should have admin access
const ADMIN_EMAILS = [
  "ksingh2_be23@thapar.edu",
  "ybhansali_be23@thapar.edu",
];

export const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.endsWith("@thapar.edu")) {
      alert("Please use your @thapar.edu email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // so the httpOnly cookie gets set
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // make sure we don't accidentally keep some old admin flag
        localStorage.setItem("isAdmin", "false");
        alert(data.message || "Login failed. Please try again.");
        return;
      }

      // -------- DETERMINE IF USER IS ADMIN --------
      let isAdmin = false;

      // 1) If backend sends isAdmin, respect that first
      if (typeof data.isAdmin === "boolean") {
        isAdmin = data.isAdmin;
      } else if (data.user && typeof data.user.isAdmin === "boolean") {
        isAdmin = data.user.isAdmin;
      } else {
        // 2) Fallback: check against hard-coded admin emails
        const lower = email.toLowerCase();
        isAdmin = ADMIN_EMAILS.includes(lower);
      }

      // store in localStorage so AdminPage can read it
      try {
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      } catch (err) {
        console.error("Could not write isAdmin to localStorage:", err);
      }

      alert("Login successful.");
      navigate("/landing-login");
    } catch (err) {
      console.error("Error during login:", err);
      alert("Could not connect to server. Please try again.");
      try {
        localStorage.setItem("isAdmin", "false");
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image with dimmer */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${image1})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Back button + ThaparKart logo */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/landing")}
          className="cursor-pointer transition-transform hover:scale-[1.10]"
        >
          {/* Only arrow, white via invert */}
          <img src={BackButton} alt="Back" className="w-6 h-6 invert" />
        </button>

        {/* Logo */}
        <p className="font-subheading font-bold text-[40px] md:text-[56px] lg:text-[60px] leading-none">
          <span className="text-[#ca0303]">Thapar</span>
          <span className="text-white">Kart</span>
        </p>
      </div>

      {/* Centered login card */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[780px] bg-[#141414cc] rounded-[40px] md:rounded-[50px] px-6 py-8 md:px-12 md:py-10 text-white">
          {/* Login Title */}
          <h1 className="font-subheading font-bold text-[40px] md:text-[55px] text-center tracking-[1px] mb-8">
            Login
          </h1>

          {/* Inputs */}
          <div className="space-y-5 md:space-y-6">
            <input
              type="email"
              placeholder="Enter your @thapar.edu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] rounded-[30px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[50px] rounded-[30px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
            />

            {/* Forgot + Remember */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm md:text-base">
              <button
                type="button"
                className="text-white/80 hover:text-white transition-colors"
              >
                Forgot password?
              </button>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#e73b3b]"
                />
                <span className="leading-none">Remember me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="mt-4 w-full h-10 flex justify-center items-center bg-[#e73b3b] rounded-[50px] shadow-button-shadow cursor-pointer hover:bg-[#c90202] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="text-base font-medium">
                {loading ? "Logging in..." : "Login"}
              </span>
            </button>
          </div>

          {/* New here */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="mt-6 mx-auto block text-center text-sm md:text-base text-white/80 hover:text-white transition-colors"
          >
            New here? Get started.
          </button>
        </div>
      </div>

      {/* Copyright */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs md:text-sm text-center">
        © 2025 ThaparKart | Campus Marketplace
      </p>
    </div>
  );
};

export default Login;
