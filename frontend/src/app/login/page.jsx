"use client";

import { useState } from "react";
import { Store, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-800">

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">

        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 p-8">

          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-200">
                <Store className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Butt & Malik
            </h1>
            <p className="text-slate-500 text-sm font-medium">Traders Management System</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center justify-center gap-2 text-red-600 text-sm font-medium animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@buttmalik.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-blue-500 checked:bg-blue-500 transition-all" />
                  <CheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={10} strokeWidth={4} />
                </div>
                <span className="text-slate-500 group-hover:text-slate-700 transition-colors font-medium">Remember me</span>
              </label>
              <button type="button" className="text-blue-600 hover:text-blue-700 font-bold hover:underline decoration-2 underline-offset-2 transition-all">
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-transform duration-300 group-hover:scale-105"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-wide">Authenticating...</span>
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secure Access</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Demo Credentials */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="flex justify-center gap-6 text-sm text-slate-600 font-mono bg-white py-2 px-4 rounded-lg border border-slate-200 inline-block shadow-sm">
              <span>admin@buttmalik.com</span>
              <span className="text-slate-300">|</span>
              <span>admin123</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs font-medium text-slate-400 mt-6">
          © {new Date().getFullYear()} Butt & Malik Traders. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;