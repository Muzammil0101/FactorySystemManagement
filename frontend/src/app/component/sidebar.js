"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const path = usePathname();
  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Stock", path: "/stock" },
    { name: "Categories", path: "/categories" },
    { name: "Suppliers", path: "/suppliers" },
    { name: "Profit & Loss", path: "/profit-loss" },
    { name: "Customers", path: "/customers" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">Butt & Malik Traders</h2>
      <ul className="space-y-3">
        {menu.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`block py-2 px-3 rounded ${
                path === item.path ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;