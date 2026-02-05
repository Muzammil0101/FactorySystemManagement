
"use client";
import { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  DollarSign,
  Search,
  ArrowRight,
  Box,
  AlertTriangle,
  Filter,
  AlignLeft
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function StockPage() {
  const [stockIn, setStockIn] = useState([]);
  const [stockOut, setStockOut] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  // Initialize summary
  const [summary, setSummary] = useState({
    totalIn: 0,
    totalOut: 0,
    totalInAmount: 0,
    totalOutAmount: 0,
    currentStock: 0
  });

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState(null);

  // Filter State
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  // New State for Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    id: null,
    type: null
  });

  const [formIn, setFormIn] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    details: "", // NEW: Notes/Description Field
    weight: "",
    rate: "",
    amount: "",
    supplier: "",
  });

  const [formOut, setFormOut] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    details: "", // NEW: Notes/Description Field
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

  // --- NEW: Calculate Summary Locally when stock lists change ---
  useEffect(() => {
    calculateLocalSummary();
  }, [stockIn, stockOut]);

  const calculateLocalSummary = () => {
    // 1. FILTERED LISTS (For Display In/Out ONLY)
    // We filter out transfers so they don't bloat the Inflow/Outflow stats cards
    const validIn = stockIn.filter(i => i.supplier !== 'Monthly Transfer');
    const validOut = stockOut.filter(i => i.customer !== 'Month End Transfer');

    const totalInDisplay = validIn.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);
    const totalOutDisplay = validOut.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);

    // Calculate total amounts
    const totalInAmountDisplay = validIn.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalOutAmountDisplay = validOut.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

    // 2. UNFILTERED LISTS (For Actual Current Stock)
    // We MUST include transfers here to get the correct physical stock on hand
    // (Total In including transfers - Total Out including transfers)
    const totalInAll = stockIn.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);
    const totalOutAll = stockOut.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);
    const currentStock = totalInAll - totalOutAll;

    setSummary({
      totalIn: totalInDisplay,
      totalOut: totalOutDisplay,
      totalInAmount: totalInAmountDisplay,
      totalOutAmount: totalOutAmountDisplay,
      currentStock: currentStock
    });
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStockIn(),
        fetchStockOut(),
        fetchSuppliers(),
        fetchCustomers(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- API Functions ---
  const fetchStockIn = async () => {
    try {
      const res = await fetch(`${API_URL}/stock/stock-in`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStockIn(Array.isArray(data) ? data : []);
    } catch (error) { setStockIn([]); }
  };

  const fetchStockOut = async () => {
    try {
      const res = await fetch(`${API_URL}/stock/stock-out`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStockOut(Array.isArray(data) ? data : []);
    } catch (error) { setStockOut([]); }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/suppliers`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) { setSuppliers([]); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/customers`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) { setCustomers([]); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) { setCategories([]); }
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
    } else {
      if (name === "weight" || name === "rate") {
        const weight = name === "weight" ? value : form.weight;
        const sRate = name === "rate" ? value : form.rate;
        form.amount = weight && sRate ? (weight * sRate).toFixed(2) : "";
      }
      setFormOut(form);
    }
  };

  // Helper to get selected category stock
  const getSelectedCategoryStock = () => {
    if (!formOut.description) return 0;

    // Normalize user input
    const searchDesc = formOut.description.toLowerCase().trim();

    // Calculate locally from full transaction lists (Includes Transfers!)
    const totalIn = stockIn
      .filter(item => item.description.toLowerCase().trim() === searchDesc)
      .reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

    const totalOut = stockOut
      .filter(item => item.description.toLowerCase().trim() === searchDesc)
      .reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

    return totalIn - totalOut;
  };

  const handleEdit = (item, type) => {
    setEditingId(item.id);
    setEditType(type);
    if (type === "in") {
      setFormIn({
        date: item.date,
        description: item.description,
        details: item.details || "", // NEW
        weight: item.weight,
        rate: item.rate,
        amount: item.amount,
        supplier: item.supplier,
      });
    } else {
      setFormOut({
        date: item.date,
        description: item.description,
        details: item.details || "", // NEW
        weight: item.weight,
        rate: item.rate,
        purchase_rate: item.purchase_rate || "",
        amount: item.amount,
        customer: item.customer,
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger Modal
  const initiateDelete = (id, type) => {
    setConfirmModal({ show: true, id, type });
  };

  // Actually Delete (Called from Modal)
  const executeDelete = async () => {
    const { id, type } = confirmModal;
    setLoading(true);
    setConfirmModal({ show: false, id: null, type: null }); // Close modal immediately

    try {
      const endpoint = type === "in" ? "stock-in" : "stock-out";
      const res = await fetch(`${API_URL}/stock/${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        showNotification(data.error || "Error", "error");
        return;
      }

      showNotification(data.message || "Deleted", "success");
      await fetchAllData();
    } catch (error) {
      showNotification("Error deleting", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (type) => {
    const form = type === "in" ? formIn : formOut;
    // NEW: Check for Details
    if (!form.date || !form.description || !form.weight || !form.rate || !form.details) {
      showNotification("Please fill all required fields, including Description!", "error");
      return;
    }
    if (type === "in" && !form.supplier) { showNotification("Please select a supplier!", "error"); return; }
    if (type === "out" && !form.customer) { showNotification("Please select a customer!", "error"); return; }

    // --- NEW: Category Specific Stock Check for Stock Out ---
    if (type === "out") {
      // Use local calculation (includes transfers)
      const available = getSelectedCategoryStock();

      // If editing, we need to add back the old weight to available logic loosely, 
      // but strictly speaking, the API handles the complex edit logic. 
      // This is a quick frontend guard.
      // If not editing, strict check.
      if (!editingId && parseFloat(formOut.weight) > available) {
        showNotification(`Insufficient stock for ${formOut.description}. Available: ${available.toFixed(2)} kg`, "error");
        return;
      }
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

      if (!res.ok) { showNotification(data.error || "Error", "error"); return; }
      showNotification(data.message, "success");
      await fetchAllData();

      setEditingId(null);
      setEditType(null);
      if (type === "in") {
        setFormIn({ date: new Date().toISOString().split('T')[0], description: "", details: "", weight: "", rate: "", amount: "", supplier: "" });
      } else {
        setFormOut({ date: new Date().toISOString().split('T')[0], description: "", details: "", weight: "", rate: "", purchase_rate: "", amount: "", customer: "" });
      }
    } catch (error) { showNotification("Error saving data", "error"); } finally { setLoading(false); }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditType(null);
    setFormIn({ date: new Date().toISOString().split('T')[0], description: "", details: "", weight: "", rate: "", amount: "", supplier: "" });
    setFormOut({ date: new Date().toISOString().split('T')[0], description: "", details: "", weight: "", rate: "", purchase_rate: "", amount: "", customer: "" });
  };

  // --- FILTERED DATA FOR LISTS ---
  const filteredStockIn = stockIn.filter(item =>
    item.date.startsWith(filterMonth)
    // Show transfers in Inflow list so user can see opening balances
  );

  const filteredStockOut = stockOut.filter(item =>
    item.date.startsWith(filterMonth) &&
    item.customer !== 'Month End Transfer' // Hide transfers from Outflow list as requested
  );

  // Helper for UI display logic
  const selectedCategoryStock = getSelectedCategoryStock();
  const isStockInsufficient = formOut.description && formOut.weight && (parseFloat(formOut.weight) > selectedCategoryStock);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${notification.type === "success"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
          {notification.type === "success" ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-rose-500" />}
          <p className="font-bold text-sm">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="hover:bg-slate-200/50 p-1 rounded-lg transition-colors ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Enter") executeDelete();
            if (e.key === "Escape") setConfirmModal({ ...confirmModal, show: false });
          }}
          ref={(el) => el && el.focus()}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, show: false })}></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative z-10 max-w-sm w-full border border-slate-100 animate-scale-in">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Confirm Deletion</h3>
            <p className="text-slate-500 text-center text-sm mb-6">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="flex-1 py-2.5 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2.5 rounded-xl text-white font-bold bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative z-10 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-200 text-white">
                <Box size={24} />
              </span>
              Stock Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Real-time inventory tracking & adjustments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/80 px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Filter size={16} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filter:</span>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-32"
              />
            </div>
            <div className="flex gap-2 text-xs font-mono text-slate-600 bg-white/80 px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <span>SYS: ONLINE</span>
              <span className="text-emerald-500 animate-pulse">●</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Current Stock Main Card */}
        <div className="md:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Available Inventory</p>
              <h2 className="text-4xl font-extrabold text-slate-800 mt-2 mb-1 tracking-tight">
                {summary.currentStock.toFixed(2)} <span className="text-lg text-slate-400 font-medium">kg</span>
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Package size={16} className="text-purple-600" />
              <span>Total Stock Holding</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Stock In Stat */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-5 flex items-center justify-between group hover:border-emerald-200 transition-all duration-300 shadow-lg shadow-slate-200/40">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Total Inflow</p>
              <p className="text-2xl font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                {summary.totalIn.toFixed(2)} <span className="text-sm text-slate-400">kg</span>
              </p>
              <div className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg w-fit">
                <span className="text-[10px] font-bold text-emerald-500">PKR</span>
                <span className="text-xs font-bold text-emerald-700">{summary.totalInAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <TrendingUp size={24} />
            </div>
          </div>

          {/* Stock Out Stat */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-5 flex items-center justify-between group hover:border-rose-200 transition-all duration-300 shadow-lg shadow-slate-200/40">
            <div>
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-2">Total Outflow</p>
              <p className="text-2xl font-bold text-slate-700 group-hover:text-rose-700 transition-colors">
                {summary.totalOut.toFixed(2)} <span className="text-sm text-slate-400">kg</span>
              </p>
              <div className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-lg w-fit">
                <span className="text-[10px] font-bold text-rose-500">PKR</span>
                <span className="text-xs font-bold text-rose-700">{summary.totalOutAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-8 mb-12">

        {/* --- STOCK IN FORM --- */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 relative h-full flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{editingId && editType === "in" ? "Edit Inflow" : "Stock In"}</h3>
                  <p className="text-xs text-slate-500 font-medium">Purchase inventory from supplier</p>
                </div>
              </div>
              {editingId && editType === "in" && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200 font-bold">EDITING MODE</span>}
            </div>
          </div>

          <div className="p-6 space-y-5 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={formIn.date}
                    onChange={(e) => handleChange(e, "in")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={formIn.supplier}
                  onChange={(e) => handleChange(e, "in")}
                  placeholder="Search supplier..."
                  list="supplier-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <datalist id="supplier-list">
                  {Array.isArray(suppliers) && suppliers.map(s => <option key={s.id} value={s.name} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Item Category (Rice, Wheat etc)</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input
                  type="text"
                  name="description"
                  value={formIn.description}
                  onChange={(e) => handleChange(e, "in")}
                  placeholder="e.g. Rice, Wheat (Auto-creates Category)"
                  list="category-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <datalist id="category-list">
                  {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
            </div>

            {/* NEW: DETAILS FIELD */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex gap-2">
                Description / Notes
                <span className="text-rose-500 text-[9px] bg-rose-50 px-1 rounded border border-rose-100">REQUIRED</span>
              </label>
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input
                  type="text"
                  name="details"
                  value={formIn.details}
                  onChange={(e) => handleChange(e, "in")}
                  placeholder="Vehicle No, Type, Quality Details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Weight (kg)</label>
                <input
                  type="number" step="0.01" name="weight" value={formIn.weight} onChange={(e) => handleChange(e, "in")}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none text-right font-mono font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rate</label>
                <input
                  type="number" step="0.01" name="rate" value={formIn.rate} onChange={(e) => handleChange(e, "in")}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none text-right font-mono font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 block">Total</label>
                <input
                  type="number" name="amount" value={formIn.amount} readOnly
                  placeholder="0.00"
                  className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 text-sm text-emerald-700 outline-none text-right font-mono font-bold cursor-default"
                />
              </div>
            </div>

            {/* Spacer and Button Group pushed to bottom */}
            <div className="mt-auto flex gap-3 pt-4">
              <button
                onClick={() => handleAdd("in")}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Plus size={18} /> {editingId && editType === "in" ? "Update Record" : "Add to Stock"}</>}
              </button>
              {editingId && editType === "in" && (
                <button onClick={handleCancel} className="px-5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
              )}
            </div>
          </div>
        </div>

        {/* --- STOCK OUT FORM --- */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 relative h-full flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500"></div>

          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shadow-sm">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{editingId && editType === "out" ? "Edit Outflow" : "Stock Out"}</h3>
                  <p className="text-xs text-slate-500 font-medium">Sell inventory to customer</p>
                </div>
              </div>
              {editingId && editType === "out" && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200 font-bold">EDITING MODE</span>}
            </div>
          </div>

          <div className="p-6 space-y-5 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <input
                  type="date" name="date" value={formOut.date} onChange={(e) => handleChange(e, "out")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Customer</label>
                <input
                  type="text" name="customer" value={formOut.customer} onChange={(e) => handleChange(e, "out")}
                  placeholder="Search customer..." list="customer-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <datalist id="customer-list">
                  {Array.isArray(customers) && customers.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Item Category (Rice, Wheat etc)</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                <input
                  type="text" name="description" value={formOut.description} onChange={(e) => handleChange(e, "out")}
                  placeholder="e.g. Rice, Wheat..." list="category-list-out"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <datalist id="category-list-out">
                  {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
            </div>

            {/* NEW: DETAILS FIELD */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex gap-2">
                Description / Notes
                <span className="text-rose-500 text-[9px] bg-rose-50 px-1 rounded border border-rose-100">REQUIRED</span>
              </label>
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                <input
                  type="text"
                  name="details"
                  value={formOut.details}
                  onChange={(e) => handleChange(e, "out")}
                  placeholder="Vehicle No, Type, Quality Details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Split Rates */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 block">Sale Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number" step="0.01" name="rate" value={formOut.rate} onChange={(e) => handleChange(e, "out")}
                    placeholder="Sold At"
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg pl-6 pr-2 py-2 text-sm text-emerald-700 focus:ring-1 focus:ring-emerald-500 outline-none font-mono font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 block">Purchase Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number" step="0.01" name="purchase_rate" value={formOut.purchase_rate} onChange={(e) => handleChange(e, "out")}
                    placeholder="Cost"
                    className="w-full bg-blue-50 border border-blue-200 rounded-lg pl-6 pr-2 py-2 text-sm text-blue-700 focus:ring-1 focus:ring-blue-500 outline-none font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Weight (kg)</label>
                <input
                  type="number" step="0.01" name="weight" value={formOut.weight} onChange={(e) => handleChange(e, "out")}
                  placeholder="0.00"
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-3 text-sm text-slate-700 outline-none text-right font-mono font-medium transition-all ${isStockInsufficient ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 focus:ring-2 focus:ring-rose-500/20'}`}
                />
                {/* Stock Check: Display available stock here below the field */}
                <div className="mt-1.5 flex justify-end">
                  {formOut.description && !isStockInsufficient && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Available: {selectedCategoryStock.toFixed(2)} kg
                    </span>
                  )}
                  {isStockInsufficient && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md animate-pulse">
                      Insufficient! Max: {selectedCategoryStock.toFixed(2)} kg
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1.5 block">Total (Sale)</label>
                <input
                  type="number" name="amount" value={formOut.amount} readOnly
                  placeholder="0.00"
                  className="w-full bg-rose-50 border border-rose-100 rounded-xl px-3 py-3 text-sm text-rose-700 outline-none text-right font-mono font-bold cursor-default"
                />
              </div>
            </div>

            {/* Spacer and Button Group pushed to bottom */}
            <div className="mt-auto flex gap-3 pt-4">
              <button
                onClick={() => handleAdd("out")}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Plus size={18} /> {editingId && editType === "out" ? "Update Record" : "Sell Stock"}</>}
              </button>
              {editingId && editType === "out" && (
                <button onClick={handleCancel} className="px-5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- RECENT TRANSACTIONS --- */}
      <div className="relative z-10 grid md:grid-cols-2 gap-8">

        {/* Recent Stock In List */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
              Inflow ({filterMonth})
            </h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {Array.isArray(filteredStockIn) && filteredStockIn.slice().reverse().map((item, idx) => (
              <div key={idx} className="group p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all duration-300 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.description}</p>
                    {/* Show Details */}
                    {item.details && <p className="text-xs text-slate-600 italic mt-0.5">{item.details}</p>}
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      {item.supplier === 'Monthly Transfer' ? (
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">Transfer</span>
                      ) : (
                        <span className="text-emerald-600">{item.supplier}</span>
                      )}
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      {item.date}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item, "in")} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => initiateDelete(item.id, "in")} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Weight</p>
                    <p className="text-emerald-600 font-mono text-xs font-bold">{item.weight} kg</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Rate</p>
                    <p className="text-slate-600 font-mono text-xs font-medium">{parseFloat(item.rate).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Amount</p>
                    <p className="text-emerald-600 font-mono text-xs font-bold">{parseFloat(item.amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!Array.isArray(filteredStockIn) || filteredStockIn.length === 0) && <p className="text-center text-slate-400 text-xs py-4 italic">No inflow found for this month</p>}
          </div>
        </div>

        {/* Recent Stock Out List */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm"></span>
            Outflow ({filterMonth})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {Array.isArray(filteredStockOut) && filteredStockOut.slice().reverse().map((item, idx) => (
              <div key={idx} className="group p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all duration-300 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.description}</p>
                    {/* Show Details */}
                    {item.details && <p className="text-xs text-slate-600 italic mt-0.5">{item.details}</p>}
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      {item.customer === 'Month End Transfer' ? (
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">Transfer</span>
                      ) : (
                        <span className="text-rose-600">{item.customer}</span>
                      )}
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      {item.date}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item, "out")} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => initiateDelete(item.id, "out")} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Weight</p>
                    <p className="text-rose-600 font-mono text-xs font-bold">{item.weight} kg</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold text-blue-500">Pur. Rate</p>
                    <p className="text-blue-600 font-mono text-xs font-medium">{item.purchase_rate ? parseFloat(item.purchase_rate).toFixed(2) : '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold text-rose-500">Pur. Amt</p>
                    <p className="text-rose-600 font-mono text-xs font-bold">{(parseFloat(item.weight) * parseFloat(item.purchase_rate || 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!Array.isArray(filteredStockOut) || filteredStockOut.length === 0) && <p className="text-center text-slate-400 text-xs py-4 italic">No outflow found for this month</p>}
          </div>
        </div>

      </div>
    </div>
  );
}