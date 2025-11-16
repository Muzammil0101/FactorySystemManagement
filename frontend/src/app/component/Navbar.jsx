"use client";

import { LogOut, Bell, Search, Menu, Sparkles } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("auth");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("loginTime");
    
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="sticky top-0 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl relative overflow-hidden z-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-0 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-20 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      {/* Main Navbar Content */}
      <div className="relative px-4 py-2.5 flex justify-between items-center">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 transition-all duration-300 hover:scale-105 border border-slate-700/50">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Dashboard
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Overview & Analytics</p>
          </div>
        </div>

        {/* Center - Search bar */}
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border transition-all duration-300 ${
          isSearchFocused ? 'border-blue-500/50 bg-slate-700/70 scale-105 shadow-lg shadow-blue-500/20' : 'border-slate-700/50'
        }`}>
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-64 font-medium"
          />
        </div>

        {/* Right section */}
        <div className="flex gap-3 items-center">
          {/* Notification bell */}
          <button className="relative p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 transition-all duration-300 hover:scale-105 border border-slate-700/50 group">
            <Bell className="w-5 h-5 text-slate-300 group-hover:text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-[10px] flex items-center justify-center text-white font-bold shadow-lg">
              3
            </span>
          </button>

          {/* User info */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg text-sm">
              A
            </div>
            <div>
              <span className="block font-semibold text-slate-200 text-sm leading-tight">Admin</span>
              <span className="block text-[10px] text-slate-400 leading-tight">Administrator</span>
            </div>
          </div>

          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="group relative px-4 py-2 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 border border-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 transition-transform duration-300 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </span>
          </button>
        </div>
      </div>

      {/* Bottom gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
    </div>
  );
};

export default Navbar;