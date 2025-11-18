"use client";

import { useState } from "react";
import { Store, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  
const handleSubmit = async () => {
  setError("");
  setIsLoading(true);

  try {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, ip: window.location.hostname })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      setIsLoading(false);
      return;
    }

    // Success
    localStorage.setItem("auth", "true");
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("loginTime", new Date().toISOString());

    window.location.href = "/dashboard";

  } catch (error) {
    setError("Server error, try again");
  }

  setIsLoading(false);
};

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-20"></div>
        
        <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Store className="text-white" size={40} />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              Butt & Malik
            </h1>
            <p className="text-slate-400 text-sm font-medium">Traders Management System</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-center">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@buttmalik.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/70 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="group relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 transition-transform duration-300 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8"></div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400">
            Protected by advanced security measures
          </p>
          
          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400 text-center mb-2 font-semibold">Demo Credentials:</p>
            <p className="text-xs text-slate-300 text-center">Email: admin@buttmalik.com</p>
            <p className="text-xs text-slate-300 text-center">Password: admin123</p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2024 Butt & Malik Traders. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;