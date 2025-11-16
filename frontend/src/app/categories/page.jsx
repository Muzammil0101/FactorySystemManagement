"use client";
import { useState, useEffect } from "react";
import { Folder, Search, Edit2, Trash2, Plus, Download, X, FileText, Package, TrendingUp, TrendingDown } from "lucide-react";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const saved = localStorage.getItem("categories");
    const stockIn = JSON.parse(localStorage.getItem("stock-in") || "[]");
    const stockOut = JSON.parse(localStorage.getItem("stock-out") || "[]");
    
    let categoriesData = saved ? JSON.parse(saved) : [];
    
    // Calculate stock for each category
    categoriesData = categoriesData.map(cat => {
      const inStock = stockIn
        .filter(item => item.description === cat.name)
        .reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
      
      const outStock = stockOut
        .filter(item => item.description === cat.name)
        .reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
      
      return {
        ...cat,
        stockIn: inStock,
        stockOut: outStock,
        currentStock: inStock - outStock
      };
    });
    
    setCategories(categoriesData);
  };

  const saveCategories = (data) => {
    localStorage.setItem("categories", JSON.stringify(data));
    loadCategories();
  };

  const filtered = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    if (!form.name.trim()) {
      alert("Category name is required!");
      return;
    }

    if (editingId) {
      const updated = categories.map((c) =>
        c.id === editingId ? { ...c, name: form.name, description: form.description } : c
      );
      saveCategories(updated);
      setEditingId(null);
    } else {
      const newCategory = { 
        ...form, 
        id: Date.now(),
        stockIn: 0,
        stockOut: 0,
        currentStock: 0
      };
      const updated = [...categories, newCategory];
      saveCategories(updated);
    }

    setForm({ name: "", description: "" });
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this category?")) {
      const updated = categories.filter((c) => c.id !== id);
      saveCategories(updated);
    }
  };

  const exportCSV = () => {
    if (categories.length === 0) {
      alert("No data to export");
      return;
    }

    const csv = [
      ["Category Name", "Description", "Stock In (kg)", "Stock Out (kg)", "Current Stock (kg)"],
      ...categories.map((c) => [
        c.name, 
        c.description || "", 
        c.stockIn?.toFixed(2) || "0.00",
        c.stockOut?.toFixed(2) || "0.00",
        c.currentStock?.toFixed(2) || "0.00"
      ]),
    ]
      .map((row) => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `categories_stock_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 backdrop-blur-md border border-white/30 p-3 rounded-2xl shadow-lg">
              <Folder className="text-white" size={32} />
            </div>
            Category Management
          </h1>
          <p className="text-slate-600 mt-2 ml-1">Organize and manage product categories with stock tracking</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-md border border-white/40 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Download size={20} /> Export
          </button>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                setForm({ name: "", description: "" });
              }
            }} 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 backdrop-blur-md border border-white/40 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={20} /> Add Category
          </button>
        </div>
      </div>

      {/* Add/Edit Category Form */}
      {showForm && (
        <div className="bg-white/40 backdrop-blur-lg border border-white/50 p-8 rounded-2xl shadow-xl mb-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            {editingId ? "Edit Category" : "New Category Details"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Category Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-white/60 bg-white/50 backdrop-blur-sm p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-white/60 bg-white/50 backdrop-blur-sm p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 backdrop-blur-md border border-white/40 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {editingId ? "Update Category" : "Add Category"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm({ name: "", description: "" });
              }}
              className="bg-white/50 backdrop-blur-md border border-white/60 hover:bg-white/70 text-slate-700 px-8 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 p-4 rounded-2xl shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500" size={20} />
          <input
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-3 border border-white/60 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-12 text-center">
            <Folder className="mx-auto text-indigo-400 mb-4" size={64} />
            <p className="text-slate-600 text-lg">
              {search ? "No categories found matching your search" : "No categories yet"}
            </p>
          </div>
        ) : (
          filtered.map((cat) => (
            <div key={cat.id} className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:bg-white/50">
              <div className="bg-gradient-to-r from-blue-500/80 to-indigo-600/80 backdrop-blur-md border-b border-white/40 p-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Folder size={20} className="text-white" />
                  {cat.name}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3 text-slate-700">
                    <FileText size={16} className="text-indigo-500 mt-0.5" />
                    <span className="flex-1">{cat.description || "No description"}</span>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Current Stock</span>
                    <Package className="text-indigo-500" size={18} />
                  </div>
                  <div className="text-2xl font-bold text-indigo-700 mb-3">
                    {cat.currentStock?.toFixed(2) || "0.00"} kg
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50/80 backdrop-blur-sm rounded-lg p-2 border border-green-200/50">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp size={14} className="text-green-600" />
                        <span className="text-xs text-green-700 font-medium">In</span>
                      </div>
                      <p className="text-sm font-bold text-green-700">
                        {cat.stockIn?.toFixed(2) || "0.00"} kg
                      </p>
                    </div>
                    
                    <div className="bg-red-50/80 backdrop-blur-sm rounded-lg p-2 border border-red-200/50">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingDown size={14} className="text-red-600" />
                        <span className="text-xs text-red-700 font-medium">Out</span>
                      </div>
                      <p className="text-sm font-bold text-red-700">
                        {cat.stockOut?.toFixed(2) || "0.00"} kg
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="flex-1 bg-blue-100/60 backdrop-blur-sm border border-blue-200/50 hover:bg-blue-200/60 text-blue-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="bg-red-100/60 backdrop-blur-sm border border-red-200/50 hover:bg-red-200/60 text-red-700 px-4 py-2.5 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}