// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { 
//   LayoutDashboard, 
//   Package, 
//   FolderTree, 
//   Truck, 
//   TrendingUp, 
//   Users, 
//   Store, 
//   ChevronRight, 
//   Sparkles 
// } from "lucide-react";

// const Sidebar = () => {
//   const path = usePathname();
  
//   const menu = [
//     { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-indigo-600" },
//     { name: "Stock", path: "/stock", icon: Package, gradient: "from-purple-500 to-pink-600" },
//     { name: "Categories", path: "/categories", icon: FolderTree, gradient: "from-amber-500 to-orange-600" },
//     { name: "Suppliers", path: "/suppliers", icon: Truck, gradient: "from-emerald-500 to-teal-600" },
//     { name: "Customers", path: "/customer", icon: Users, gradient: "from-blue-500 to-cyan-600" },
//     { name: "Profit & Loss", path: "/profit-loss", icon: TrendingUp, gradient: "from-green-500 to-emerald-600" },

//     // ⭐ Added new sidebar item here
//     {name: "Month-Wise Report", path: "/month-wise-report", icon: Sparkles, gradient: "from-yellow-500 to-red-600" },
//     { name: "Month-End Transfer", path: "/stock-transfer", icon: Sparkles, gradient: "from-pink-500 to-rose-600" },

//   ];

//   return (
//     <div className="w-72 h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl relative overflow-hidden">
//       {/* Decorative Background Elements */}
//       <div className="absolute top-0 left-0 w-full h-full opacity-10">
//         <div className="absolute top-20 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
//       </div>

//       {/* Logo/Brand Section */}
//       <div className="relative p-6 pb-4">
//         <div className="flex items-center gap-3 mb-2">
//           <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg">
//             <Store className="text-white" size={28} />
//           </div>
//           <div>
//             <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
//               Butt & Malik
//             </h2>
//             <p className="text-xs text-slate-400 font-medium">Traders</p>
//           </div>
//         </div>
//         <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mt-4"></div>
//       </div>

//       {/* Navigation Menu */}
//       <nav className="flex-1 px-4 py-2 relative">
//         <ul className="space-y-2">
//           {menu.map((item) => {
//             const Icon = item.icon;
//             const isActive = path === item.path;
            
//             return (
//               <li key={item.path}>
//                 <Link
//                   href={item.path}
//                   className={`group relative block rounded-2xl transition-all duration-300 ${
//                     isActive 
//                       ? "bg-gradient-to-r " + item.gradient + " shadow-lg scale-105" 
//                       : "hover:bg-white/5 hover:scale-105"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3 py-3.5 px-4">
                    
//                     <div className={`p-2 rounded-xl transition-all duration-300 ${
//                       isActive 
//                         ? "bg-white/20 shadow-md" 
//                         : "bg-slate-800/50 group-hover:bg-slate-700/70"
//                     }`}>
//                       <Icon size={20} className={isActive ? "text-white" : "text-slate-300 group-hover:text-white"} />
//                     </div>
                    
//                     <span className={`flex-1 font-semibold transition-all duration-300 ${
//                       isActive 
//                         ? "text-white" 
//                         : "text-slate-300 group-hover:text-white"
//                     }`}>
//                       {item.name}
//                     </span>

//                     <ChevronRight 
//                       size={18} 
//                       className={`transition-all duration-300 ${
//                         isActive 
//                           ? "text-white opacity-100 translate-x-0" 
//                           : "text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
//                       }`} 
//                     />
//                   </div>

//                   {isActive && (
//                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
//                   )}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       {/* Footer Section */}
//       <div className="relative p-6 pt-4">
//         <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-4"></div>
//         <p className="text-center text-xs text-slate-500 mt-4">Version 1.0.0</p>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

"use client";
import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Truck, 
  TrendingUp, 
  Users, 
  Store, 
  ChevronRight, 
  FileText,
  Repeat
} from "lucide-react";

// Standard navigation compatible with both Next.js and standard React environments
const Sidebar = () => {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // safe check for window to avoid build errors during SSR or preview
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);
  
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, color: "text-blue-400", glow: "shadow-blue-500/50" },
    { name: "Stock", path: "/stock", icon: Package, color: "text-purple-400", glow: "shadow-purple-500/50" },
    { name: "Categories", path: "/categories", icon: FolderTree, color: "text-amber-400", glow: "shadow-amber-500/50" },
    { name: "Suppliers", path: "/suppliers", icon: Truck, color: "text-emerald-400", glow: "shadow-emerald-500/50" },
    { name: "Customers", path: "/customer", icon: Users, color: "text-cyan-400", glow: "shadow-cyan-500/50" },
    { name: "Profit & Loss", path: "/profit-loss", icon: TrendingUp, color: "text-green-400", glow: "shadow-green-500/50" },
    { name: "Month-Wise Report", path: "/month-wise-report", icon: FileText, color: "text-yellow-400", glow: "shadow-yellow-500/50" },
    { name: "Month-End Transfer", path: "/stock-transfer", icon: Repeat, color: "text-rose-400", glow: "shadow-rose-500/50" },
  ];

  return (
    <aside className="w-72 h-screen flex flex-col relative overflow-hidden transition-all duration-300 bg-slate-900">
      {/* Glassy Background Layer */}
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-0"></div>
      
      {/* Ambient Glows for Depth */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 z-0 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Brand Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md shadow-xl group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-inner border border-white/10">
                <Store className="text-white" size={24} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide leading-tight">Butt & Malik</h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Traders</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
          <ul className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              // Check if path starts with item.path to handle sub-routes if needed
              const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
              
              return (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden cursor-pointer ${
                      isActive 
                        ? "bg-white/10 border border-white/10 shadow-lg backdrop-blur-md" 
                        : "hover:bg-white/5 border border-transparent hover:border-white/5"
                    }`}
                  >
                    {/* Active Gradient Border Line */}
                    {isActive && (
                      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-transparent via-${item.color.replace('text-', '')} to-transparent opacity-80`}></div>
                    )}

                    {/* Icon Container */}
                    <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                      isActive ? "bg-white/10 text-white shadow-inner" : "text-slate-400 group-hover:text-white bg-transparent group-hover:bg-white/5"
                    }`}>
                       <Icon size={20} className={`${isActive ? item.color : "currentColor"} transition-colors duration-300`} />
                    </div>

                    {/* Label */}
                    <span className={`font-medium text-sm tracking-wide transition-colors duration-300 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"
                    }`}>
                      {item.name}
                    </span>

                    {/* Active Glowing Dot */}
                    {isActive && (
                        <div className={`absolute right-4 w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')} shadow-[0_0_8px] ${item.glow}`}></div>
                    )}
                    
                    {/* Hover Arrow */}
                    {!isActive && (
                        <ChevronRight size={14} className="absolute right-4 text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User / Footer Section */}
        {/* <div className="p-4 mt-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/5 backdrop-blur-md hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 p-[2px] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-shadow">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                            BM
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">Admin User</p>
                        <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">admin@buttmalik.com</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center px-2 mt-3 text-[10px] text-slate-600 font-mono">
                <span>v1.0.0</span>
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Active
                </span>
            </div>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;