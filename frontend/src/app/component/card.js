"use client";
import { motion } from "framer-motion";
import { Package, Truck, Users, DollarSign } from "lucide-react";

// Icon mapping for different cards
const iconMap = {
  "Total Stock Items": Package,
  Suppliers: Truck,
  Customers: Users,
  "Total Profit": DollarSign,
};

const Card = ({ title, value, color }) => {
  const Icon = iconMap[title] || Package;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-between"
    >
      {/* Top colored bar */}
      <div className={`absolute top-0 left-0 w-full h-2 rounded-t-2xl ${color}`} />

      {/* Content */}
      <div className="pt-4 flex justify-between items-center">
        <div>
          <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`${color} bg-opacity-20 p-3 rounded-xl flex items-center justify-center`}>
          <Icon className={`${color.replace("bg-", "text-")} w-6 h-6`} />
        </div>
      </div>
    </motion.div>
  );
};

export default Card;