"use client";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Package, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function MallManagementPage() {
  // --- STATE ---
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Forms
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    detail: "",
    weight: "",
    rate: "",
    amount: "",
    customer: ""
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    detail: "",
    weight: "",
    rate: "",
    amount: "",
    supplier: ""
  });

  const [editingSale, setEditingSale] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSales(),
        fetchPurchases(),
        fetchSuppliers(),
        fetchCustomers()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    const res = await fetch(`${API_URL}/stock/stock-out`);
    const data = await res.json();
    setSalesData(Array.isArray(data) ? data : []);
  };

  const fetchPurchases = async () => {
    const res = await fetch(`${API_URL}/stock/stock-in`);
    const data = await res.json();
    setPurchaseData(Array.isArray(data) ? data : []);
  };

  const fetchSuppliers = async () => {
    const res = await fetch(`${API_URL}/suppliers`);
    const data = await res.json();
    setSuppliers(Array.isArray(data) ? data : []);
  };

  const fetchCustomers = async () => {
    const res = await fetch(`${API_URL}/customers`);
    const data = await res.json();
    setCustomers(Array.isArray(data) ? data : []);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- FILTERING ---
  const filterByMonth = (data) => {
    return data.filter(item => item.date.startsWith(currentMonth));
  };

  const filteredSales = filterByMonth(salesData);
  const filteredPurchases = filterByMonth(purchaseData);

  const getMonthName = (monthString) => {
    if (!monthString) return "";
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  // --- HANDLERS ---

  const handleSaleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...saleForm, [name]: value };
    
    if (name === "weight" || name === "rate") {
      const weight = name === "weight" ? value : saleForm.weight;
      const rate = name === "rate" ? value : saleForm.rate;
      newForm.amount = weight && rate ? (parseFloat(weight) * parseFloat(rate)).toFixed(0) : "";
    }
    
    setSaleForm(newForm);
  };

  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...purchaseForm, [name]: value };
    
    if (name === "weight" || name === "rate") {
      const weight = name === "weight" ? value : purchaseForm.weight;
      const rate = name === "rate" ? value : purchaseForm.rate;
      newForm.amount = weight && rate ? (parseFloat(weight) * parseFloat(rate)).toFixed(0) : "";
    }
    
    setPurchaseForm(newForm);
  };

  const addSale = async () => {
    if (!saleForm.date || !saleForm.detail || !saleForm.weight || !saleForm.rate || !saleForm.customer) {
      showNotification("Please fill all fields including Customer!", "error");
      return;
    }

    const payload = {
      date: saleForm.date,
      description: saleForm.detail,
      weight: saleForm.weight,
      rate: saleForm.rate,
      purchase_rate: 0,
      amount: saleForm.amount,
      customer: saleForm.customer
    };

    const method = editingSale ? "PUT" : "POST";
    const url = editingSale 
      ? `${API_URL}/stock/stock-out/${editingSale}` 
      : `${API_URL}/stock/stock-out`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      await fetchSales();
      setSaleForm({
        date: new Date().toISOString().split('T')[0],
        detail: "",
        weight: "",
        rate: "",
        amount: "",
        customer: ""
      });
      setEditingSale(null);
      showNotification(editingSale ? "Sale updated successfully" : "Sale added successfully", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const addPurchase = async () => {
    if (!purchaseForm.date || !purchaseForm.detail || !purchaseForm.weight || !purchaseForm.rate || !purchaseForm.supplier) {
      showNotification("Please fill all fields including Supplier!", "error");
      return;
    }

    const payload = {
      date: purchaseForm.date,
      description: purchaseForm.detail,
      weight: purchaseForm.weight,
      rate: purchaseForm.rate,
      amount: purchaseForm.amount,
      supplier: purchaseForm.supplier
    };

    const method = editingPurchase ? "PUT" : "POST";
    const url = editingPurchase 
      ? `${API_URL}/stock/stock-in/${editingPurchase}` 
      : `${API_URL}/stock/stock-in`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      await fetchPurchases();
      setPurchaseForm({
        date: new Date().toISOString().split('T')[0],
        detail: "",
        weight: "",
        rate: "",
        amount: "",
        supplier: ""
      });
      setEditingPurchase(null);
      showNotification(editingPurchase ? "Purchase updated successfully" : "Purchase added successfully", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const deleteSale = async (id) => {
    if (!confirm("Are you sure you want to delete this sale entry?")) return;
    try {
      await fetch(`${API_URL}/stock/stock-out/${id}`, { method: "DELETE" });
      await fetchSales();
      showNotification("Sale deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to delete sale", "error");
    }
  };

  const deletePurchase = async (id) => {
    if (!confirm("Are you sure you want to delete this purchase entry?")) return;
    try {
      await fetch(`${API_URL}/stock/stock-in/${id}`, { method: "DELETE" });
      await fetchPurchases();
      showNotification("Purchase deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to delete purchase", "error");
    }
  };

  const editSale = (item) => {
    const calculatedAmount = item.weight && item.rate ? (parseFloat(item.weight) * parseFloat(item.rate)).toFixed(0) : item.amount;
    setSaleForm({
      date: item.date,
      detail: item.description,
      weight: item.weight,
      rate: item.rate,
      amount: calculatedAmount,
      customer: item.customer
    });
    setEditingSale(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editPurchase = (item) => {
    setPurchaseForm({
      date: item.date,
      detail: item.description,
      weight: item.weight,
      rate: item.rate,
      amount: item.amount,
      supplier: item.supplier
    });
    setEditingPurchase(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- CALCULATIONS ---
  const totalSales = filteredSales.reduce((sum, item) => sum + (parseFloat(item.weight || 0) * parseFloat(item.rate || 0)), 0);
  const totalPurchases = filteredPurchases.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const profit = totalSales - totalPurchases;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${
          notification.type === "success" 
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

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                <FileText size={24} />
              </span>
              Month Wise Report
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">
              {getMonthName(currentMonth)} - Sales & Purchase Detail
            </p>
          </div>

          {/* Month Filter */}
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-slate-200 flex items-center gap-2">
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Profit Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Total Sales</p>
              <p className="text-2xl font-extrabold text-emerald-700">₨{totalSales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between group hover:border-orange-200 transition-all">
            <div>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">Total Purchases</p>
              <p className="text-2xl font-extrabold text-orange-700">₨{totalPurchases.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
              <TrendingDown size={24} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-900/20 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Net Profit</p>
              <p className={`text-3xl font-extrabold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>₨{profit.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl text-white relative z-10">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Side by Side Forms */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          
          {/* Sale Form (Green) */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{editingSale ? "Edit Sale" : "New Sale"}</h3>
              </div>
              {editingSale && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200 font-bold">EDITING</span>}
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={saleForm.date}
                    onChange={handleSaleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Detail</label>
                  <input
                    type="text"
                    name="detail"
                    value={saleForm.detail}
                    onChange={handleSaleChange}
                    placeholder="Product..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Customer</label>
                <input
                  type="text"
                  name="customer"
                  value={saleForm.customer}
                  onChange={handleSaleChange}
                  placeholder="Search customer..."
                  list="customer-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                />
                <datalist id="customer-list">
                  {customers.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Weight</label>
                  <input
                    type="number"
                    name="weight"
                    value={saleForm.weight}
                    onChange={handleSaleChange}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none text-right font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rate</label>
                  <input
                    type="number"
                    name="rate"
                    value={saleForm.rate}
                    onChange={handleSaleChange}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none text-right font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={saleForm.amount}
                    readOnly
                    className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 text-sm text-emerald-700 font-bold text-right outline-none cursor-default"
                  />
                </div>
              </div>
              <button
                onClick={addSale}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all mt-2 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> {editingSale ? "Update Sale" : "Add Sale"}
              </button>
            </div>
          </div>

          {/* Purchase Form (Orange) */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                  <TrendingDown size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{editingPurchase ? "Edit Purchase" : "New Purchase"}</h3>
              </div>
              {editingPurchase && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200 font-bold">EDITING</span>}
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={purchaseForm.date}
                    onChange={handlePurchaseChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Detail</label>
                  <input
                    type="text"
                    name="detail"
                    value={purchaseForm.detail}
                    onChange={handlePurchaseChange}
                    placeholder="Product..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={purchaseForm.supplier}
                  onChange={handlePurchaseChange}
                  placeholder="Search supplier..."
                  list="supplier-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                />
                <datalist id="supplier-list">
                  {suppliers.map(s => <option key={s.id} value={s.name} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Weight</label>
                  <input
                    type="number"
                    name="weight"
                    value={purchaseForm.weight}
                    onChange={handlePurchaseChange}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none text-right font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rate</label>
                  <input
                    type="number"
                    name="rate"
                    value={purchaseForm.rate}
                    onChange={handlePurchaseChange}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none text-right font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={purchaseForm.amount}
                    readOnly
                    className="w-full bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 text-sm text-orange-700 font-bold text-right outline-none cursor-default"
                  />
                </div>
              </div>
              <button
                onClick={addPurchase}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition-all mt-2 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> {editingPurchase ? "Update Purchase" : "Add Purchase"}
              </button>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" /> 
              Sales Records (Mall)
            </h3>
            <span className="text-xs text-slate-500 font-medium">{getMonthName(currentMonth)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Detail</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Weight</th>
                  <th className="px-6 py-4 text-right">Rate</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSales.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.description}</td>
                    <td className="px-6 py-4 text-slate-600">{item.customer}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{item.weight}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{item.rate}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      ₨{(parseFloat(item.weight || 0) * parseFloat(item.rate || 0)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editSale(item)} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => deleteSale(item.id)} className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No sales found for this month</td></tr>}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right text-slate-600 uppercase text-xs tracking-wider">Total Sales</td>
                  <td className="px-6 py-4 text-right text-emerald-700">₨{totalSales.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Purchase Table */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingDown size={18} className="text-orange-600" /> 
              Purchase Records (Mall)
            </h3>
            <span className="text-xs text-slate-500 font-medium">{getMonthName(currentMonth)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Detail</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-right">Weight</th>
                  <th className="px-6 py-4 text-right">Rate</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPurchases.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.description}</td>
                    <td className="px-6 py-4 text-slate-600">{item.supplier}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{item.weight}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{item.rate}</td>
                    <td className="px-6 py-4 text-right font-bold text-orange-600">
                      ₨{parseFloat(item.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editPurchase(item)} className="p-1.5 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => deletePurchase(item.id)} className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No purchases found for this month</td></tr>}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right text-slate-600 uppercase text-xs tracking-wider">Total Purchases</td>
                  <td className="px-6 py-4 text-right text-orange-700">₨{totalPurchases.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}