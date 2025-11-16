
//new
"use client";
import { useState, useEffect } from "react";
import { Package, TrendingUp, TrendingDown, Plus, Calendar, FileText, Weight, DollarSign, User, CheckCircle, AlertCircle, X } from "lucide-react";

export default function StockPage() {
  const [stockIn, setStockIn] = useState([]);
  const [stockOut, setStockOut] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState(null);

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
    rate: "",
    amount: "",
    customer: "",
  });

  useEffect(() => {
    const stockInData = JSON.parse(localStorage.getItem("stock-in") || "[]");
    const stockOutData = JSON.parse(localStorage.getItem("stock-out") || "[]");
    const suppliersData = JSON.parse(localStorage.getItem("suppliers") || "[]");
    const customersData = JSON.parse(localStorage.getItem("customers") || "[]");
    const categoriesData = JSON.parse(localStorage.getItem("categories") || "[]");

    setStockIn(stockInData);
    setStockOut(stockOutData);
    setSuppliers(suppliersData);
    setCustomers(customersData);
    setCategories(categoriesData);
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const totalIn = stockIn.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  const totalOut = stockOut.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  const currentStock = totalIn - totalOut;

  const handleChange = (e, type) => {
    const { name, value } = e.target;
    const form = type === "in" ? { ...formIn } : { ...formOut };
    form[name] = value;

    if (name === "weight" || name === "rate") {
      const weight = name === "weight" ? value : form.weight;
      const rate = name === "rate" ? value : form.rate;
      form.amount = weight && rate ? (weight * rate).toFixed(2) : "";
    }

    type === "in" ? setFormIn(form) : setFormOut(form);
  };

  const addOrUpdateCategory = (categoryName) => {
    let updatedCategories = [...categories];
    const existingCategory = updatedCategories.find(c => c.name === categoryName);
    
    if (!existingCategory) {
      // Create new category if it doesn't exist
      const newCategory = {
        id: Date.now(),
        name: categoryName,
        description: "",
        stockIn: 0,
        stockOut: 0,
        currentStock: 0
      };
      updatedCategories.push(newCategory);
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    }
  };

  const handleAdd = (type) => {
    const form = type === "in" ? formIn : formOut;

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

    try {
      const newItem = { ...form, id: Date.now() };
      let updatedStockIn = [...stockIn];
      let updatedStockOut = [...stockOut];
      let updatedSuppliers = [...suppliers];
      let updatedCustomers = [...customers];

      if (type === "in") {
        if (parseFloat(form.weight) <= 0) {
          showNotification("Weight must be greater than 0!", "error");
          return;
        }
        
        updatedStockIn.push(newItem);

        // Add or update category
        addOrUpdateCategory(form.description);

        let supplier = updatedSuppliers.find(s => s.name === form.supplier);
        if (!supplier) {
          supplier = { id: Date.now(), name: form.supplier, phone: "", city: "", ledger: [] };
          updatedSuppliers.push(supplier);
        }
        supplier.ledger.push({
          id: Date.now(),
          date: form.date,
          description: form.description,
          weight: parseFloat(form.weight),
          rate: parseFloat(form.rate),
          debit: 0,
          credit: parseFloat(form.amount),
        });

        localStorage.setItem("stock-in", JSON.stringify(updatedStockIn));
        localStorage.setItem("suppliers", JSON.stringify(updatedSuppliers));
        setStockIn(updatedStockIn);
        setSuppliers(updatedSuppliers);
        setFormIn({ date: new Date().toISOString().split('T')[0], description: "", weight: "", rate: "", amount: "", supplier: "" });
        showNotification(`Successfully added ${form.weight} kg of ${form.description} from ${form.supplier}!`, "success");
      } else {
        if (parseFloat(form.weight) > currentStock) {
          showNotification(`Not enough stock! Available: ${currentStock.toFixed(2)} kg`, "error");
          return;
        }
        if (parseFloat(form.weight) <= 0) {
          showNotification("Weight must be greater than 0!", "error");
          return;
        }
        
        updatedStockOut.push(newItem);

        // Add or update category
        addOrUpdateCategory(form.description);

        let customer = updatedCustomers.find(c => c.name === form.customer);
        if (!customer) {
          customer = { id: Date.now(), name: form.customer, phone: "", city: "", ledger: [] };
          updatedCustomers.push(customer);
        }
        customer.ledger.push({
          id: Date.now(),
          date: form.date,
          description: form.description,
          weight: parseFloat(form.weight),
          rate: parseFloat(form.rate),
          debit: parseFloat(form.amount),
          credit: 0,
        });

        localStorage.setItem("stock-out", JSON.stringify(updatedStockOut));
        localStorage.setItem("customers", JSON.stringify(updatedCustomers));
        setStockOut(updatedStockOut);
        setCustomers(updatedCustomers);
        setFormOut({ date: new Date().toISOString().split('T')[0], description: "", weight: "", rate: "", amount: "", customer: "" });
        showNotification(`Successfully sold ${form.weight} kg of ${form.description} to ${form.customer}!`, "success");
      }
    } catch (error) {
      console.error(error);
      showNotification("Error saving data. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
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
            {currentStock.toFixed(2)} kg
          </p>
        </div>
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            <div className="text-left">
              <p className="text-xs text-slate-500">Stock In</p>
              <p className="text-lg font-bold text-green-700">{totalIn.toFixed(2)} kg</p>
            </div>
          </div>
          <div className="h-12 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-600" size={20} />
            <div className="text-left">
              <p className="text-xs text-slate-500">Stock Out</p>
              <p className="text-lg font-bold text-red-700">{totalOut.toFixed(2)} kg</p>
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
                <h3 className="text-2xl font-bold text-white">Stock In</h3>
                <p className="text-green-100 text-sm">Add inventory from supplier</p>
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
                {categories.map(c => <option key={c.id} value={c.name} />)}
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
                {suppliers.map(s => <option key={s.id} value={s.name} />)}
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
                <label className="block text-xs font-medium text-slate-700 mb-2">Amount</label>
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

            <button 
              onClick={() => handleAdd("in")} 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Stock In
            </button>
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
                <h3 className="text-2xl font-bold text-white">Stock Out</h3>
                <p className="text-red-100 text-sm">Sell inventory to customer</p>
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
                {categories.map(c => <option key={c.id} value={c.name} />)}
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
                {customers.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                <label className="block text-xs font-medium text-slate-700 mb-2">Rate *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="rate" 
                  value={formOut.rate} 
                  onChange={(e) => handleChange(e, "out")} 
                  placeholder="0.00" 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Amount</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={formOut.amount} 
                  readOnly 
                  placeholder="0.00" 
                  className="w-full border border-slate-300 p-3 rounded-xl bg-slate-50 text-slate-600 font-semibold"
                />
              </div>
            </div>

            {/* Stock Warning */}
            {formOut.weight && parseFloat(formOut.weight) > currentStock && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="text-red-800 font-medium">Insufficient Stock</p>
                  <p className="text-red-600">Available: {currentStock.toFixed(2)} kg</p>
                </div>
              </div>
            )}

            <button 
              onClick={() => handleAdd("out")} 
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Stock Out
            </button>
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
          <div className="space-y-2">
            {stockIn.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                <div>
                  <p className="font-medium text-slate-800">{item.description}</p>
                  <p className="text-xs text-slate-600">{item.supplier} • {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">{item.weight} kg</p>
                  <p className="text-xs text-slate-600">${item.amount}</p>
                </div>
              </div>
            ))}
            {stockIn.length === 0 && (
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
          <div className="space-y-2">
            {stockOut.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="font-medium text-slate-800">{item.description}</p>
                  <p className="text-xs text-slate-600">{item.customer} • {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-700">{item.weight} kg</p>
                  <p className="text-xs text-slate-600">${item.amount}</p>
                </div>
              </div>
            ))}
            {stockOut.length === 0 && (
              <p className="text-center text-slate-400 py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}