"use client";
import { useState, useEffect } from "react";
import { Package, Users, Truck, Folder, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stockIn, setStockIn] = useState([]);
  const [stockOut, setStockOut] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, currentStock: 0 });

  const API_BASE = "http://localhost:4000/api";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [customersRes, suppliersRes, categoriesRes, stockRes] = await Promise.all([
        fetch(`${API_BASE}/customers`),
        fetch(`${API_BASE}/suppliers`),
        fetch(`${API_BASE}/stock/categories`),
        fetch(`${API_BASE}/stock/summary`)
      ]);

      const [customersData, suppliersData, categoriesData, stockData] = await Promise.all([
        customersRes.json(),
        suppliersRes.json(),
        categoriesRes.json(),
        stockRes.json()
      ]);

      // Fetch purchases (stock in) and sales (stock out)
      const [purchasesRes, salesRes] = await Promise.all([
        fetch(`${API_BASE}/stock/stock-in`),
        fetch(`${API_BASE}/stock/stock-out`)
      ]);

      const [purchasesData, salesData] = await Promise.all([
        purchasesRes.json(),
        salesRes.json()
      ]);

      setStockIn(purchasesData || []);
      setStockOut(salesData || []);
      setCustomers(customersData || []);
      setSuppliers(suppliersData || []);
      setCategories(categoriesData || []);
      setSummary({
        totalIn: stockData.totalStockIn || 0,
        totalOut: stockData.totalStockOut || 0,
        currentStock: stockData.currentStock || 0
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const currentStock = summary.currentStock || 0;
  const totalSuppliers = suppliers.length;
  const totalCustomers = customers.length;
  const totalCategories = categories.length;

  // Cards data
  const stats = [
    { 
      title: "Current Stock", 
      value: `${currentStock.toFixed(2)} kg`, 
      icon: Package,
      gradient: "from-blue-500 to-indigo-600",
      change: "+12.5%",
      changeType: "up"
    },
    { 
      title: "Total Suppliers", 
      value: totalSuppliers.toString(), 
      icon: Truck,
      gradient: "from-green-500 to-emerald-600",
      change: `${totalSuppliers} active`,
      changeType: "up"
    },
    { 
      title: "Total Customers", 
      value: totalCustomers.toString(), 
      icon: Users,
      gradient: "from-yellow-500 to-orange-600",
      change: `${totalCustomers} active`,
      changeType: "up"
    },
    { 
      title: "Total Categories", 
      value: totalCategories.toString(), 
      icon: Folder,
      gradient: "from-purple-500 to-pink-600",
      change: `${totalCategories} types`,
      changeType: "up"
    },
  ];

  // Monthly stock trend data (last 6 months)
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const monthName = months[monthIndex];
      
      const monthStockIn = stockIn
        .filter(item => {
          const itemDate = new Date(item.date || item.purchase_date);
          return itemDate.getMonth() === monthIndex && itemDate.getFullYear() === year;
        })
        .reduce((sum, item) => sum + parseFloat(item.weight || item.quantity || 0), 0);
      
      const monthStockOut = stockOut
        .filter(item => {
          const itemDate = new Date(item.date || item.sale_date);
          return itemDate.getMonth() === monthIndex && itemDate.getFullYear() === year;
        })
        .reduce((sum, item) => sum + parseFloat(item.weight || item.quantity || 0), 0);

      data.push({
        month: monthName,
        stockIn: parseFloat(monthStockIn.toFixed(2)),
        stockOut: parseFloat(monthStockOut.toFixed(2))
      });
    }

    return data;
  };

  // Category distribution data
  const getCategoryData = () => {
    return categories
      .map(cat => ({
        name: cat.name,
        value: parseFloat(cat.current_stock || cat.currentStock || 0)
      }))
      .filter(item => item.value > 0);
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  const COLORS = ["#3B82F6", "#22C55E", "#EAB308", "#8B5CF6", "#EC4899", "#F97316"];

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-8 -m-3 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-8 -m-3">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-800 mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">
          Welcome back 👋 Here's what's happening with your inventory
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:bg-white/50"
          >
            <div className={`bg-gradient-to-r ${item.gradient} p-4`}>
              <div className="flex items-center justify-between">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                  <item.icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-white text-sm font-medium ${
                  item.changeType === 'up' ? 'bg-white/20' : 'bg-red-500/20'
                } px-2 py-1 rounded-lg`}>
                  {item.changeType === 'up' ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {item.change}
                </div>
              </div>
            </div>
            
            <div className="p-5">
              <p className="text-sm font-medium text-slate-600 mb-1">{item.title}</p>
              <p className="text-3xl font-bold text-slate-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* LINE CHART - Stock Movement */}
        <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Monthly Stock Movement
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Line
                type="monotone"
                dataKey="stockIn"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ r: 5, fill: '#22C55E' }}
                activeDot={{ r: 7 }}
                name="Stock In (kg)"
              />
              <Line
                type="monotone"
                dataKey="stockOut"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 5, fill: '#EF4444' }}
                activeDot={{ r: 7 }}
                name="Stock Out (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART - Category Distribution */}
        <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl">
              <Folder className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Stock by Category
            </h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(value) => `${Number(value).toFixed(2)} kg`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-slate-500">No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* ADDITIONAL INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Suppliers */}
        <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
              <Truck className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Top Suppliers</h3>
          </div>
          <div className="space-y-3">
            {suppliers.slice(0, 5).map((supplier, idx) => {
              const supplierTotal = stockIn
                .filter(item => item.supplier === supplier.name || item.supplier_name === supplier.name)
                .reduce((sum, item) => sum + parseFloat(item.weight || item.quantity || 0), 0);
              
              return (
                <div key={supplier.id} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-slate-800">{supplier.name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-700">{supplierTotal.toFixed(0)} kg</span>
                </div>
              );
            })}
            {suppliers.length === 0 && (
              <p className="text-center text-slate-500 py-4">No suppliers yet</p>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-xl">
              <Users className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Top Customers</h3>
          </div>
          <div className="space-y-3">
            {customers.slice(0, 5).map((customer, idx) => {
              const customerTotal = stockOut
                .filter(item => item.customer === customer.name || item.customer_name === customer.name)
                .reduce((sum, item) => sum + parseFloat(item.weight || item.quantity || 0), 0);
              
              return (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-slate-800">{customer.name}</span>
                  </div>
                  <span className="text-sm font-bold text-orange-700">{customerTotal.toFixed(0)} kg</span>
                </div>
              );
            })}
            {customers.length === 0 && (
              <p className="text-center text-slate-500 py-4">No customers yet</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
              <Package className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Quick Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-sm text-slate-600 mb-1">Total Categories</p>
              <p className="text-2xl font-bold text-blue-700">{totalCategories}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <p className="text-sm text-slate-600 mb-1">Total Stock In</p>
              <p className="text-2xl font-bold text-green-700">{summary.totalIn.toFixed(2)} kg</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
              <p className="text-sm text-slate-600 mb-1">Total Stock Out</p>
              <p className="text-2xl font-bold text-red-700">{summary.totalOut.toFixed(2)} kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}