"use client";
import { useState, useEffect } from "react";
import { Package, TrendingUp, TrendingDown, Plus, Calendar, FileText, User, CheckCircle, AlertCircle, X, Edit2, Trash2, DollarSign } from "lucide-react";

const API_URL = "http://localhost:4000/api"; // Adjusted to relative path for standard Next.js setups, change back to full URL if needed

export default function StockPage() {
  const [stockIn, setStockIn] = useState([]);
  const [stockOut, setStockOut] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, currentStock: 0 });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState(null);

  const [formIn, setFormIn] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    weight: "",
    rate: "",
    amount: "",
    supplier: "",
  });

  const [formOut, setFormOut] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    weight: "",
    rate: "", // Sale Rate
    purchase_rate: "", // Purchased Rate
    amount: "",
    customer: "",
  });

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStockIn(),
        fetchStockOut(),
        fetchSuppliers(),
        fetchCustomers(),
        fetchCategories(),
        fetchSummary()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStockIn = async () => {
    try {
      const res = await fetch(`${API_URL}/stock/stock-in`);
      if (!res.ok) throw new Error('Failed to fetch stock in');
      const data = await res.json();
      setStockIn(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching stock in:", error);
      setStockIn([]);
    }
  };

  const fetchStockOut = async () => {
    try {
      const res = await fetch(`${API_URL}/stock/stock-out`);
      if (!res.ok) throw new Error('Failed to fetch stock out');
      const data = await res.json();
      setStockOut(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching stock out:", error);
      setStockOut([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/suppliers`);
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSuppliers([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/customers`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/stock/summary`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary({ totalIn: 0, totalOut: 0, currentStock: 0 });
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (e, type) => {
    const { name, value } = e.target;
    const form = type === "in" ? { ...formIn } : { ...formOut };
    form[name] = value;

    if (type === "in") {
      if (name === "weight" || name === "rate") {
        const weight = name === "weight" ? value : form.weight;
        const rate = name === "rate" ? value : form.rate;
        form.amount = weight && rate ? (weight * rate).toFixed(2) : "";
      }
      setFormIn(form);
    }  else {
      // Logic for Stock Out
      // IMPORTANT: Amount here is calculated using SALE RATE for the Customer Ledger
      if (name === "weight" || name === "rate") { 
        const weight = name === "weight" ? value : form.weight;
        const sRate = name === "rate" ? value : form.rate; // Sale Rate
        
        form.amount = weight && sRate ? (weight * sRate).toFixed(2) : "";
      }
      setFormOut(form);
    }
  };

  const handleEdit = (item, type) => {
    setEditingId(item.id);
    setEditType(type);
    if (type === "in") {
      setFormIn({
        date: item.date,
        description: item.description,
        weight: item.weight,
        rate: item.rate,
        amount: item.amount,
        supplier: item.supplier,
      });
    } else {
      setFormOut({
        date: item.date,
        description: item.description,
        weight: item.weight,
        rate: item.rate, 
        purchase_rate: item.purchase_rate || "",
        amount: item.amount,
        customer: item.customer,
      });
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    setLoading(true);
    try {
      const endpoint = type === "in" ? "stock-in" : "stock-out";
      const res = await fetch(`${API_URL}/stock/${endpoint}/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.error || "Error deleting record", "error");
        return;
      }

      showNotification(data.message || "Record deleted successfully", "success");
      await fetchAllData();
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error deleting record", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (type) => {
    const form = type === "in" ? formIn : formOut;

    // Validation
    if (!form.date || !form.description || !form.weight || !form.rate) {
      showNotification("Please fill all required fields!", "error");
      return;
    }
    if (type === "in" && !form.supplier) {
      showNotification("Please select a supplier!", "error");
      return;
    }
    if (type === "out" && !form.customer) {
      showNotification("Please select a customer!", "error");
      return;
    }

    setLoading(true);
    try {
      const endpoint = type === "in" ? "stock-in" : "stock-out";
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/stock/${endpoint}/${editingId}` : `${API_URL}/stock/${endpoint}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.error || "Error saving data", "error");
        return;
      }

      showNotification(data.message, "success");

      // Refresh data
      await fetchAllData();

      // Reset form and editing state
      setEditingId(null);
      setEditType(null);
      if (type === "in") {
        setFormIn({ 
          date: new Date().toISOString().split('T')[0], 
          description: "", 
          weight: "", 
          rate: "", 
          amount: "", 
          supplier: "" 
        });
      } else {
        setFormOut({ 
          date: new Date().toISOString().split('T')[0], 
          description: "", 
          weight: "", 
          rate: "", 
          purchase_rate: "",
          amount: "", 
          customer: "" 
        });
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error saving data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditType(null);
    setFormIn({ 
      date: new Date().toISOString().split('T')[0], 
      description: "", 
      weight: "", 
      rate: "", 
      amount: "", 
      supplier: "" 
    });
    setFormOut({ 
      date: new Date().toISOString().split('T')[0], 
      description: "", 
      weight: "", 
      rate: "", 
      purchase_rate: "",
      amount: "", 
      customer: "" 
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-10">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          notification.type === "success" 
            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
            : "bg-gradient-to-r from-red-500 to-rose-500"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle className="text-white" size={24} />
          ) : (
            <AlertCircle className="text-white" size={24} />
          )}
          <p className="text-white font-medium">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-all ml-2"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-3xl shadow-lg">
            <Package className="text-white" size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-800">Stock Management</h1>
        <p className="text-slate-600 mt-2">Track your inventory in real-time</p>
        <p className="text-sm text-slate-500 mt-1">Description = Category Name (auto-creates in Category page)</p>
      </div>

      {/* Current Stock Display */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 mb-8 text-center border border-white/50">
        <h2 className="text-lg font-medium text-slate-600 mb-3">Current Stock Level</h2>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Package className="text-purple-600" size={32} />
          <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {summary.currentStock.toFixed(2)} kg
          </p>
        </div>
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            <div className="text-left">
              <p className="text-xs text-slate-500">Stock In</p>
              <p className="text-lg font-bold text-green-700">{summary.totalIn.toFixed(2)} kg</p>
            </div>
          </div>
          <div className="h-12 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-600" size={20} />
            <div className="text-left">
              <p className="text-xs text-slate-500">Stock Out</p>
              <p className="text-lg font-bold text-red-700">{summary.totalOut.toFixed(2)} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Forms */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Stock In Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border border-white/50">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{editingId && editType === "in" ? "Edit Stock In" : "Stock In"}</h3>
                <p className="text-green-100 text-sm">{editingId && editType === "in" ? "Update inventory record" : "Add inventory from supplier"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
                Date *
              </label>
              <input 
                type="date" 
                name="date" 
                value={formIn.date} 
                onChange={(e) => handleChange(e, "in")} 
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-green-600" />
                Category Name (Description) *
              </label>
              <input 
                type="text" 
                name="description" 
                value={formIn.description} 
                onChange={(e) => handleChange(e, "in")} 
                placeholder="e.g., Rice, Wheat, Sugar..." 
                list="category-list"
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <datalist id="category-list">
                {Array.isArray(categories) && categories.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500 mt-1">💡 This will auto-create category if new</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-green-600" />
                Supplier *
              </label>
              <input 
                type="text" 
                name="supplier" 
                value={formIn.supplier} 
                onChange={(e) => handleChange(e, "in")} 
                placeholder="Select or type supplier name" 
                list="supplier-list" 
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <datalist id="supplier-list">
                {Array.isArray(suppliers) && suppliers.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Weight (kg) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="weight" 
                  value={formIn.weight} 
                  onChange={(e) => handleChange(e, "in")} 
                  placeholder="0.00" 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Rate *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="rate" 
                  value={formIn.rate} 
                  onChange={(e) => handleChange(e, "in")} 
                  placeholder="0.00" 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Amount (PKR)</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={formIn.amount} 
                  readOnly 
                  placeholder="0.00" 
                  className="w-full border border-slate-300 p-3 rounded-xl bg-slate-50 text-slate-600 font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleAdd("in")} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} /> {loading ? "Processing..." : editingId && editType === "in" ? "Update Stock In" : "Add Stock In"}
              </button>
              {editingId && editType === "in" && (
                <button 
                  onClick={handleCancel}
                  className="flex-1 bg-slate-400 hover:bg-slate-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stock Out Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border border-white/50">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingDown className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{editingId && editType === "out" ? "Edit Stock Out" : "Stock Out"}</h3>
                <p className="text-red-100 text-sm">{editingId && editType === "out" ? "Update inventory record" : "Sell inventory to customer"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-red-600" />
                Date *
              </label>
              <input 
                type="date" 
                name="date" 
                value={formOut.date} 
                onChange={(e) => handleChange(e, "out")} 
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-red-600" />
                Category Name (Description) *
              </label>
              <input 
                type="text" 
                name="description" 
                value={formOut.description} 
                onChange={(e) => handleChange(e, "out")} 
                placeholder="e.g., Rice, Wheat, Sugar..." 
                list="category-list-out"
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              <datalist id="category-list-out">
                {Array.isArray(categories) && categories.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              <p className="text-xs text-slate-500 mt-1">💡 This will auto-create category if new</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-red-600" />
                Customer *
              </label>
              <input 
                type="text" 
                name="customer" 
                value={formOut.customer} 
                onChange={(e) => handleChange(e, "out")} 
                placeholder="Select or type customer name" 
                list="customer-list" 
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              <datalist id="customer-list">
                {Array.isArray(customers) && customers.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            {/* Split Rates Grid */}
            <div className="grid grid-cols-2 gap-3">
               <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 text-green-700">Sale Rate *</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    step="0.01" 
                    name="rate" 
                    value={formOut.rate} 
                    onChange={(e) => handleChange(e, "out")} 
                    placeholder="Sold At" 
                    className="w-full pl-8 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-green-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 text-blue-700">Purchased Rate</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    step="0.01" 
                    name="purchase_rate" 
                    value={formOut.purchase_rate} 
                    onChange={(e) => handleChange(e, "out")} 
                    placeholder="Cost Price" 
                    className="w-full pl-8 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-blue-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Weight (kg) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="weight" 
                  value={formOut.weight} 
                  onChange={(e) => handleChange(e, "out")} 
                  placeholder="0.00" 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Total Amount (PKR)</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={formOut.amount} 
                  readOnly 
                  placeholder="0.00" 
                  className="w-full border border-slate-300 p-3 rounded-xl bg-slate-50 text-slate-600 font-semibold"
                />
                <p className="text-[10px] text-gray-500 mt-1">Calculated via Sale Rate for Customer Ledger</p>
              </div>
            </div>

            {/* Stock Warning */}
            {formOut.weight && parseFloat(formOut.weight) > summary.currentStock && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="text-red-800 font-medium">Insufficient Stock</p>
                  <p className="text-red-600">Available: {summary.currentStock.toFixed(2)} kg</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => handleAdd("out")} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} /> {loading ? "Processing..." : editingId && editType === "out" ? "Update Stock Out" : "Add Stock Out"}
              </button>
              {editingId && editType === "out" && (
                <button 
                  onClick={handleCancel}
                  className="flex-1 bg-slate-400 hover:bg-slate-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Summary */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Recent Stock In */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Recent Stock In
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Array.isArray(stockIn) && stockIn.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-800">{item.description}</p>
                    <p className="text-xs text-slate-600">{item.supplier} • {item.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(item, "in")}
                      className="p-2 hover:bg-green-200 rounded-lg transition-all text-green-700"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, "in")}
                      className="p-2 hover:bg-red-200 rounded-lg transition-all text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-white/60 p-2 rounded-lg">
                    <p className="text-xs text-slate-600">Weight</p>
                    <p className="font-semibold text-green-700">{item.weight} kg</p>
                  </div>
                  <div className="bg-white/60 p-2 rounded-lg">
                    <p className="text-xs text-slate-600">Rate</p>
                    <p className="font-semibold text-green-700">₨{parseFloat(item.rate).toFixed(2)}</p>
                  </div>
                  <div className="bg-white/60 p-2 rounded-lg">
                    <p className="text-xs text-slate-600">Amount</p>
                    <p className="font-semibold text-green-700">₨{parseFloat(item.amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!Array.isArray(stockIn) || stockIn.length === 0) && (
              <p className="text-center text-slate-400 py-4">No transactions yet</p>
            )}
          </div>
        </div>

        {/* Recent Stock Out */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingDown className="text-red-600" size={20} />
            Recent Stock Out
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Array.isArray(stockOut) && stockOut.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="p-4 bg-red-50 rounded-xl border border-red-100 hover:border-red-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-800">{item.description}</p>
                    <p className="text-xs text-slate-600">{item.customer} • {item.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(item, "out")}
                      className="p-2 hover:bg-red-200 rounded-lg transition-all text-red-700"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, "out")}
                      className="p-2 hover:bg-red-200 rounded-lg transition-all text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {/* UPDATED: Shows Purchase Rate and calculates Total based on Purchase Rate 
                   Calculation: Weight * Purchase Rate = Total Cost Amount
                */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-white/60 p-2 rounded-lg">
                    <p className="text-xs text-slate-600">Weight</p>
                    <p className="font-semibold text-red-700">{item.weight} kg</p>
                  </div>
                  <div className="bg-white/60 p-2 rounded-lg">
                    <p className="text-xs text-slate-600">Pur. Rate</p>
                    <p className="font-semibold text-blue-700">
                      {item.purchase_rate ? `₨${parseFloat(item.purchase_rate).toFixed(2)}` : '-'}
                    </p>
                  </div>
                  <div className="bg-white/60 p-2 rounded-lg">
                    <p className="text-xs text-slate-600">Pur. Amount</p>
                    <p className="font-semibold text-red-700">
                      ₨{(parseFloat(item.weight) * parseFloat(item.purchase_rate || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!Array.isArray(stockOut) || stockOut.length === 0) && (
              <p className="text-center text-slate-400 py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}