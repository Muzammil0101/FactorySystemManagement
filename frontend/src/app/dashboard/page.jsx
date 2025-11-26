"use client";
import { useState, useEffect } from "react";
import { 
  Package, 
  Users, 
  Truck, 
  Folder, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";

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
      title: "Total Stock", 
      subtitle: "Current Inventory",
      value: `${currentStock.toFixed(2)}`, 
      unit: "kg",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "+2.5%",
      trendUp: true
    },
    { 
      title: "Suppliers", 
      subtitle: "Active Partners",
      value: totalSuppliers.toString(), 
      unit: "",
      icon: Truck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      trend: "Active",
      trendUp: true
    },
    { 
      title: "Customers", 
      subtitle: "Registered Clients",
      value: totalCustomers.toString(), 
      unit: "",
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-100",
      trend: "Growing",
      trendUp: true
    },
    { 
      title: "Categories", 
      subtitle: "Product Types",
      value: totalCategories.toString(), 
      unit: "",
      icon: Folder,
      color: "text-purple-600",
      bg: "bg-purple-100",
      trend: "Stable",
      trendUp: true
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

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#f43f5e"];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 text-white">
                <BarChart3 size={24} />
              </span>
              Dashboard Overview
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">
              Welcome back! Here's your business at a glance.
            </p>
          </div>
          <div className="flex gap-2 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
             <span className="text-slate-400">Last Updated:</span>
             <span className="text-indigo-600">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                <item.icon size={24} />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${item.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {item.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.trend}
              </span>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.title}</p>
              <h3 className="text-2xl font-extrabold text-slate-800 flex items-end gap-1">
                {item.value}
                <span className="text-sm font-medium text-slate-400 mb-1">{item.unit}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 relative z-10">
        
        {/* LINE CHART - Stock Movement */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Stock Movement</h3>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Inflow
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span> Outflow
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="stockIn" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIn)" 
                  name="Stock In (kg)"
                />
                <Area 
                  type="monotone" 
                  dataKey="stockOut" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOut)" 
                  name="Stock Out (kg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART - Category Distribution */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <PieIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Stock Distribution</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center relative">
            {categoryData.length > 0 ? (
              <div className="w-full h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => `${Number(value).toFixed(2)} kg`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-800">{categoryData.length}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Categories</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                <Folder size={48} className="mb-2 opacity-50" />
                <p>No category data</p>
              </div>
            )}
            
            {/* Legend */}
            <div className="w-full mt-6 grid grid-cols-2 gap-2">
              {categoryData.slice(0, 6).map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADDITIONAL INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Top Suppliers */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Truck size={16} className="text-emerald-600" /> Top Suppliers
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline flex items-center">View All <ArrowUpRight size={12} /></button>
          </div>
          <div className="space-y-3">
            {suppliers.slice(0, 5).map((supplier, idx) => {
              const supplierTotal = stockIn
                .filter(item => item.supplier === supplier.name)
                .reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
              
              return (
                <div key={supplier.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      #{idx + 1}
                    </div>
                    <span className="font-bold text-slate-700">{supplier.name}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">{supplierTotal.toFixed(0)} kg</span>
                </div>
              );
            })}
            {suppliers.length === 0 && <p className="text-center text-slate-400 py-4 italic text-sm">No suppliers yet</p>}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-orange-600" /> Top Customers
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline flex items-center">View All <ArrowUpRight size={12} /></button>
          </div>
          <div className="space-y-3">
            {customers.slice(0, 5).map((customer, idx) => {
              const customerTotal = stockOut
                .filter(item => item.customer === customer.name)
                .reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
              
              return (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 text-orange-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      #{idx + 1}
                    </div>
                    <span className="font-bold text-slate-700">{customer.name}</span>
                  </div>
                  <span className="text-xs font-bold text-orange-600">{customerTotal.toFixed(0)} kg</span>
                </div>
              );
            })}
            {customers.length === 0 && <p className="text-center text-slate-400 py-4 italic text-sm">No customers yet</p>}
          </div>
        </div>

        {/* Quick Stats / Overview */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl shadow-slate-900/20 p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
            <Activity size={20} className="text-indigo-400" /> Performance
          </h3>
          
          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 font-medium">Total Inflow</span>
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{summary.totalIn.toFixed(2)} <span className="text-sm text-white/60">kg</span></p>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 font-medium">Total Outflow</span>
                <TrendingDown size={14} className="text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-rose-400">{summary.totalOut.toFixed(2)} <span className="text-sm text-white/60">kg</span></p>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Stock Utilization</span>
                <span>{((summary.totalOut / (summary.totalIn || 1)) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(((summary.totalOut / (summary.totalIn || 1)) * 100), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}