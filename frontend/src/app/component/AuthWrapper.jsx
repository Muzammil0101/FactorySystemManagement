"use client";

import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

export default function AuthWrapper({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Safe window check for Preview Environment to avoid Next.js build errors
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      setCurrentPath(path);
      
      const isLoginPage = path === "/login";
      const auth = localStorage.getItem("auth") === "true";
      setLoggedIn(auth);

      if (!auth && !isLoginPage) {
        window.location.href = "/login";
      }
      if (auth && isLoginPage) {
        window.location.href = "/dashboard";
      }
    }
  }, []);

  const isLoginPage = currentPath === "/login";

  // Show login page without sidebar/navbar layout
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  // Prevent flashing of protected content before auth check
  if (!loggedIn && !isLoginPage) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Responsive Sidebar: Controlled by isSidebarOpen state */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Navbar: Contains the Menu Toggle button */}
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}