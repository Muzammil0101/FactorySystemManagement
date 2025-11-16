"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

export default function AuthWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const auth = localStorage.getItem("auth") === "true";
    setLoggedIn(auth);

    if (!auth && !isLoginPage) router.push("/login");
    if (auth && isLoginPage) router.push("/dashboard");
  }, [pathname]);

  // Show login page without layout
  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-100">{children}</div>;
  }

  if (!loggedIn) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto animate-slideInRight">
          {children}
        </main>
      </div>
    </div>
  );
}