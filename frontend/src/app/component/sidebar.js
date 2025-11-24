"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Truck, 
  TrendingUp, 
  Users, 
  Store, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";

const Sidebar = () => {
  const path = usePathname();
  
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-indigo-600" },
    { name: "Stock", path: "/stock", icon: Package, gradient: "from-purple-500 to-pink-600" },
    { name: "Categories", path: "/categories", icon: FolderTree, gradient: "from-amber-500 to-orange-600" },
    { name: "Suppliers", path: "/suppliers", icon: Truck, gradient: "from-emerald-500 to-teal-600" },
    { name: "Customers", path: "/customer", icon: Users, gradient: "from-blue-500 to-cyan-600" },
    { name: "Profit & Loss", path: "/profit-loss", icon: TrendingUp, gradient: "from-green-500 to-emerald-600" },

    // ⭐ Added new sidebar item here
    {name: "Month-Wise Report", path: "/month-wise-report", icon: Sparkles, gradient: "from-yellow-500 to-red-600" },
    { name: "Month-End Transfer", path: "/stock-transfer", icon: Sparkles, gradient: "from-pink-500 to-rose-600" },

  ];

  return (
    <div className="w-72 h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Logo/Brand Section */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg">
            <Store className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Butt & Malik
            </h2>
            <p className="text-xs text-slate-400 font-medium">Traders</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mt-4"></div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2 relative">
        <ul className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = path === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`group relative block rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r " + item.gradient + " shadow-lg scale-105" 
                      : "hover:bg-white/5 hover:scale-105"
                  }`}
                >
                  <div className="flex items-center gap-3 py-3.5 px-4">
                    
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-white/20 shadow-md" 
                        : "bg-slate-800/50 group-hover:bg-slate-700/70"
                    }`}>
                      <Icon size={20} className={isActive ? "text-white" : "text-slate-300 group-hover:text-white"} />
                    </div>
                    
                    <span className={`flex-1 font-semibold transition-all duration-300 ${
                      isActive 
                        ? "text-white" 
                        : "text-slate-300 group-hover:text-white"
                    }`}>
                      {item.name}
                    </span>

                    <ChevronRight 
                      size={18} 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? "text-white opacity-100 translate-x-0" 
                          : "text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      }`} 
                    />
                  </div>

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="relative p-6 pt-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-4"></div>
        <p className="text-center text-xs text-slate-500 mt-4">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;