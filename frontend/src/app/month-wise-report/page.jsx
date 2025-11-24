"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, DollarSign, Package, Calendar, User, FileText } from "lucide-react";

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

  // Forms
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    detail: "",
    weight: "",
    rate: "",
    amount: "",
    customer: "" // Required by backend
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    detail: "",
    weight: "",
    rate: "",
    amount: "",
    supplier: "" // Required by backend
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

  // Add/Update Sale (Stock Out)
  const addSale = async () => {
    if (!saleForm.date || !saleForm.detail || !saleForm.weight || !saleForm.rate || !saleForm.customer) {
      alert("Please fill all fields including Customer!");
      return;
    }

    const payload = {
      date: saleForm.date,
      description: saleForm.detail, // Map detail -> description
      weight: saleForm.weight,
      rate: saleForm.rate, // Sale Rate
      purchase_rate: 0, // Default to 0 for Mall View
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
    } catch (error) {
      alert(error.message);
    }
  };

  // Add/Update Purchase (Stock In)
  const addPurchase = async () => {
    if (!purchaseForm.date || !purchaseForm.detail || !purchaseForm.weight || !purchaseForm.rate || !purchaseForm.supplier) {
      alert("Please fill all fields including Supplier!");
      return;
    }

    const payload = {
      date: purchaseForm.date,
      description: purchaseForm.detail, // Map detail -> description
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
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteSale = async (id) => {
    if (!confirm("Are you sure you want to delete this sale entry?")) return;
    try {
      await fetch(`${API_URL}/stock/stock-out/${id}`, { method: "DELETE" });
      await fetchSales();
    } catch (error) {
      console.error(error);
    }
  };

  const deletePurchase = async (id) => {
    if (!confirm("Are you sure you want to delete this purchase entry?")) return;
    try {
      await fetch(`${API_URL}/stock/stock-in/${id}`, { method: "DELETE" });
      await fetchPurchases();
    } catch (error) {
      console.error(error);
    }
  };

  const editSale = (item) => {
    // Recalculate amount based on Sale Rate to ensure consistency in Mall View
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
  };

  // --- CALCULATIONS ---
  // CHANGED: Explicitly calculate Sales Amount as Weight * Sale Rate
  const totalSales = filteredSales.reduce((sum, item) => sum + (parseFloat(item.weight || 0) * parseFloat(item.rate || 0)), 0);
  
  // Purchases use the stored amount (which is Weight * Cost Rate)
  const totalPurchases = filteredPurchases.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  
  const profit = totalSales - totalPurchases;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen p-6 pt-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-3xl shadow-lg">
            <Package className="text-white" size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Mall Management</h1>
        <p className="text-slate-600">{getMonthName(currentMonth)} - Sales & Purchase Detail</p>
        
        {/* Month Selector */}
        <div className="flex justify-center items-center gap-3 mt-4">
          <Calendar className="text-slate-600" size={20} />
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="border border-slate-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Profit Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 mb-8 shadow-xl text-white">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-sm opacity-90 mb-2">Total Sales</p>
            <p className="text-3xl font-bold">₨{totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-sm opacity-90 mb-2">Total Purchases</p>
            <p className="text-3xl font-bold">₨{totalPurchases.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
            <p className="text-sm opacity-90 mb-2">Profit Alhamdulillah 🌟</p>
            <p className="text-3xl font-bold">₨{profit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Side by Side Forms */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sale Form (Stock Out) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-white" size={24} />
              <h3 className="text-xl font-bold text-white">
                {editingSale ? "Edit Sale" : "Add New Sale"}
              </h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={saleForm.date}
                  onChange={handleSaleChange}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Detail (Product)</label>
                <input
                  type="text"
                  name="detail"
                  value={saleForm.detail}
                  onChange={handleSaleChange}
                  placeholder="Product detail"
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
            
            {/* Customer Field - Required by Backend */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Customer</label>
              <input
                type="text"
                name="customer"
                value={saleForm.customer}
                onChange={handleSaleChange}
                placeholder="Select or type customer"
                list="customer-list"
                className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              <datalist id="customer-list">
                {customers.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Weight</label>
                <input
                  type="number"
                  name="weight"
                  value={saleForm.weight}
                  onChange={handleSaleChange}
                  placeholder="0"
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rate (Sale)</label>
                <input
                  type="number"
                  name="rate"
                  value={saleForm.rate}
                  onChange={handleSaleChange}
                  placeholder="0"
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={saleForm.amount}
                  readOnly
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-slate-50 font-semibold"
                />
              </div>
            </div>
            <button
              onClick={addSale}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={18} />
              {editingSale ? "Update Sale" : "Add Sale"}
            </button>
          </div>
        </div>

        {/* Purchase Form (Stock In) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="text-white" size={24} />
              <h3 className="text-xl font-bold text-white">
                {editingPurchase ? "Edit Purchase" : "Add New Purchase"}
              </h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={purchaseForm.date}
                  onChange={handlePurchaseChange}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Detail (Product)</label>
                <input
                  type="text"
                  name="detail"
                  value={purchaseForm.detail}
                  onChange={handlePurchaseChange}
                  placeholder="Product detail"
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Supplier Field - Required by Backend */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={purchaseForm.supplier}
                onChange={handlePurchaseChange}
                placeholder="Select or type supplier"
                list="supplier-list"
                className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <datalist id="supplier-list">
                {suppliers.map(s => <option key={s.id} value={s.name} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Weight</label>
                <input
                  type="number"
                  name="weight"
                  value={purchaseForm.weight}
                  onChange={handlePurchaseChange}
                  placeholder="0"
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rate</label>
                <input
                  type="number"
                  name="rate"
                  value={purchaseForm.rate}
                  onChange={handlePurchaseChange}
                  placeholder="0"
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={purchaseForm.amount}
                  readOnly
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-slate-50 font-semibold"
                />
              </div>
            </div>
            <button
              onClick={addPurchase}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={18} />
              {editingPurchase ? "Update Purchase" : "Add Purchase"}
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table - Full Width */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign size={24} />
              Sale Mall - {getMonthName(currentMonth)}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Sr</th>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Date</th>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Detail</th>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Customer</th>
                  <th className="p-3 text-right text-xs font-bold text-slate-700">Weight</th>
                  <th className="p-3 text-right text-xs font-bold text-slate-700">Rate</th>
                  <th className="p-3 text-right text-xs font-bold text-slate-700">Amount</th>
                  <th className="p-3 text-center text-xs font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSales.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-green-50 transition-colors">
                    <td className="p-3 text-sm text-slate-700">{idx + 1}</td>
                    <td className="p-3 text-sm text-slate-700">{item.date}</td>
                    <td className="p-3 text-sm text-slate-700">{item.description}</td>
                    <td className="p-3 text-sm text-slate-700">{item.customer}</td>
                    <td className="p-3 text-sm text-slate-700 text-right">{item.weight}</td>
                    <td className="p-3 text-sm text-slate-700 text-right">{item.rate}</td>
                    {/* CHANGED: Calculate Amount dynamically as Weight * Sale Rate */}
                    <td className="p-3 text-sm font-semibold text-green-700 text-right">
                      ₨{(parseFloat(item.weight || 0) * parseFloat(item.rate || 0)).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => editSale(item)}
                          className="p-1 hover:bg-green-100 rounded transition-colors text-green-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteSale(item.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-slate-500">No Sales found for this month</td>
                  </tr>
                )}
                <tr className="bg-green-100 font-bold">
                  <td colSpan="6" className="p-3 text-sm text-slate-800 text-right">Total Sale Mall:</td>
                  <td className="p-3 text-sm text-green-700 text-right">
                    ₨{totalSales.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Purchase Table - Full Width */}
      <div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={24} />
              Purchased Mall - {getMonthName(currentMonth)}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Sr</th>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Date</th>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Detail</th>
                  <th className="p-3 text-left text-xs font-bold text-slate-700">Supplier</th>
                  <th className="p-3 text-right text-xs font-bold text-slate-700">Weight</th>
                  <th className="p-3 text-right text-xs font-bold text-slate-700">Rate</th>
                  <th className="p-3 text-right text-xs font-bold text-slate-700">Amount</th>
                  <th className="p-3 text-center text-xs font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPurchases.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-orange-50 transition-colors">
                    <td className="p-3 text-sm text-slate-700">{idx + 1}</td>
                    <td className="p-3 text-sm text-slate-700">{item.date}</td>
                    <td className="p-3 text-sm text-slate-700">{item.description}</td>
                    <td className="p-3 text-sm text-slate-700">{item.supplier}</td>
                    <td className="p-3 text-sm text-slate-700 text-right">{item.weight}</td>
                    <td className="p-3 text-sm text-slate-700 text-right">{item.rate}</td>
                    <td className="p-3 text-sm font-semibold text-orange-700 text-right">
                      ₨{parseFloat(item.amount).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => editPurchase(item)}
                          className="p-1 hover:bg-orange-100 rounded transition-colors text-orange-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deletePurchase(item.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-slate-500">No Purchases found for this month</td>
                  </tr>
                )}
                <tr className="bg-orange-100 font-bold">
                  <td colSpan="6" className="p-3 text-sm text-slate-800 text-right">Total Purchase Mall:</td>
                  <td className="p-3 text-sm text-orange-700 text-right">
                    ₨{totalPurchases.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}