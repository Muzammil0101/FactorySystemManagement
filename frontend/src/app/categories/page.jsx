"use client";
import { useState, useEffect } from "react";
import { Folder, Search, Edit2, Trash2, Plus, Download, FileText, Package, TrendingUp, TrendingDown } from "lucide-react";

const API_URL = "http://localhost:4000/api/stock";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!form.name.trim()) {
      alert("Category name is required!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing category
        const response = await fetch(`${API_URL}/categories/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update category');
        }

        const result = await response.json();
        alert(result.message);
        setEditingId(null);
      } else {
        // Add new category
        const response = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add category');
        }

        const result = await response.json();
        alert(result.message);
      }

      setForm({ name: "", description: "" });
      setShowForm(false);
      await loadCategories();
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    if (!confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      const result = await response.json();
      alert(result.message);
      await loadCategories();
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
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
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-8 -m-3">
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
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-md border border-white/40 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 backdrop-blur-md border border-white/40 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} /> Add Category
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100/60 backdrop-blur-lg border border-red-300 text-red-700 p-4 rounded-2xl mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

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
              disabled={loading}
              className="border border-white/60 bg-white/50 backdrop-blur-sm p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:opacity-50"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={loading}
              className="border border-white/60 bg-white/50 backdrop-blur-sm p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:opacity-50"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 backdrop-blur-md border border-white/40 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : editingId ? "Update Category" : "Add Category"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm({ name: "", description: "" });
              }}
              disabled={loading}
              className="bg-white/50 backdrop-blur-md border border-white/60 hover:bg-white/70 text-slate-700 px-8 py-2.5 rounded-xl transition-all disabled:opacity-50"
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
            disabled={loading}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && categories.length === 0 && (
        <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin mx-auto w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-slate-600 text-lg">Loading categories...</p>
        </div>
      )}

      {/* Category Cards */}
      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg p-12 text-center">
              <Folder className="mx-auto text-indigo-400 mb-4" size={64} />
              <p className="text-slate-600 text-lg">
                {search ? "No categories found matching your search" : "No categories yet"}
              </p>
              {!search && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Add Your First Category
                </button>
              )}
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
                      disabled={loading}
                      className="flex-1 bg-blue-100/60 backdrop-blur-sm border border-blue-200/50 hover:bg-blue-200/60 text-blue-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={loading}
                      className="bg-red-100/60 backdrop-blur-sm border border-red-200/50 hover:bg-red-200/60 text-red-700 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
// "use client";
// import { useState } from "react";
// import { AlertCircle, Database, Search } from "lucide-react";

// const API_URL = "http://localhost:4000/api";

// export default function DebugPage() {
//   const [debugData, setDebugData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchDebugData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_URL}/stock/debug/stock-data`);
//       if (!res.ok) throw new Error('Failed to fetch debug data');
//       const data = await res.json();
//       setDebugData(data);
//     } catch (err) {
//       setError(err.message);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6">
//           <div className="flex items-center gap-4 mb-6">
//             <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl">
//               <Database className="text-white" size={32} />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-slate-800">Database Debug Tool</h1>
//               <p className="text-slate-600">Check stock and category matching</p>
//             </div>
//           </div>

//           <button
//             onClick={fetchDebugData}
//             disabled={loading}
//             className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
//           >
//             <Search size={20} />
//             {loading ? "Loading..." : "Fetch Debug Data"}
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
//             <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
//             <div>
//               <p className="font-semibold text-red-800">Error</p>
//               <p className="text-red-700">{error}</p>
//             </div>
//           </div>
//         )}

//         {debugData && (
//           <div className="space-y-6">
//             {/* Categories */}
//             <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
//               <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
//                 📁 Categories ({debugData.categories?.length || 0})
//               </h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-slate-100 text-left">
//                       <th className="p-3 font-semibold">ID</th>
//                       <th className="p-3 font-semibold">Name</th>
//                       <th className="p-3 font-semibold">Name Length</th>
//                       <th className="p-3 font-semibold">Has Spaces?</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {debugData.categories?.map((cat) => (
//                       <tr key={cat.id} className="border-b border-slate-200">
//                         <td className="p-3">{cat.id}</td>
//                         <td className="p-3 font-mono bg-blue-50">[{cat.name}]</td>
//                         <td className="p-3">{cat.name.length} chars</td>
//                         <td className="p-3">
//                           {cat.name.trim() !== cat.name ? 
//                             <span className="text-red-600 font-semibold">⚠️ YES (spaces found!)</span> : 
//                             <span className="text-green-600">✓ No</span>
//                           }
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Stock In */}
//             <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
//               <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
//                 📈 Stock In ({debugData.stockInItems?.length || 0})
//               </h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-green-100 text-left">
//                       <th className="p-3 font-semibold">ID</th>
//                       <th className="p-3 font-semibold">Description</th>
//                       <th className="p-3 font-semibold">Weight</th>
//                       <th className="p-3 font-semibold">Length</th>
//                       <th className="p-3 font-semibold">Has Spaces?</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {debugData.stockInItems?.map((item) => (
//                       <tr key={item.id} className="border-b border-slate-200">
//                         <td className="p-3">{item.id}</td>
//                         <td className="p-3 font-mono bg-green-50">[{item.description}]</td>
//                         <td className="p-3">{item.weight} kg</td>
//                         <td className="p-3">{item.description.length} chars</td>
//                         <td className="p-3">
//                           {item.description.trim() !== item.description ? 
//                             <span className="text-red-600 font-semibold">⚠️ YES</span> : 
//                             <span className="text-green-600">✓ No</span>
//                           }
//                         </td>
//                       </tr>
//                     ))}
//                     {debugData.stockInItems?.length === 0 && (
//                       <tr>
//                         <td colSpan="5" className="p-6 text-center text-slate-400">
//                           No stock in records found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Stock Out */}
//             <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
//               <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
//                 📉 Stock Out ({debugData.stockOutItems?.length || 0})
//               </h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-red-100 text-left">
//                       <th className="p-3 font-semibold">ID</th>
//                       <th className="p-3 font-semibold">Description</th>
//                       <th className="p-3 font-semibold">Weight</th>
//                       <th className="p-3 font-semibold">Length</th>
//                       <th className="p-3 font-semibold">Has Spaces?</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {debugData.stockOutItems?.map((item) => (
//                       <tr key={item.id} className="border-b border-slate-200">
//                         <td className="p-3">{item.id}</td>
//                         <td className="p-3 font-mono bg-red-50">[{item.description}]</td>
//                         <td className="p-3">{item.weight} kg</td>
//                         <td className="p-3">{item.description.length} chars</td>
//                         <td className="p-3">
//                           {item.description.trim() !== item.description ? 
//                             <span className="text-red-600 font-semibold">⚠️ YES</span> : 
//                             <span className="text-green-600">✓ No</span>
//                           }
//                         </td>
//                       </tr>
//                     ))}
//                     {debugData.stockOutItems?.length === 0 && (
//                       <tr>
//                         <td colSpan="5" className="p-6 text-center text-slate-400">
//                           No stock out records found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Matching Analysis */}
//             <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
//               <h2 className="text-xl font-bold text-slate-800 mb-4">🔍 Matching Analysis</h2>
//               <div className="space-y-3">
//                 {debugData.categories?.map((cat) => {
//                   const matchingStockIn = debugData.stockInItems?.filter(
//                     item => item.description.toLowerCase().trim() === cat.name.toLowerCase().trim()
//                   ) || [];
                  
//                   const matchingStockOut = debugData.stockOutItems?.filter(
//                     item => item.description.toLowerCase().trim() === cat.name.toLowerCase().trim()
//                   ) || [];

//                   const totalIn = matchingStockIn.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
//                   const totalOut = matchingStockOut.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);

//                   return (
//                     <div key={cat.id} className="border border-slate-200 rounded-xl p-4">
//                       <h3 className="font-bold text-slate-800 mb-2">
//                         Category: <span className="font-mono bg-blue-100 px-2 py-1 rounded">{cat.name}</span>
//                       </h3>
//                       <div className="grid md:grid-cols-3 gap-4 text-sm">
//                         <div className="bg-green-50 p-3 rounded-lg">
//                           <p className="text-slate-600 mb-1">Stock In Matches</p>
//                           <p className="font-bold text-green-700">{matchingStockIn.length} items = {totalIn.toFixed(2)} kg</p>
//                         </div>
//                         <div className="bg-red-50 p-3 rounded-lg">
//                           <p className="text-slate-600 mb-1">Stock Out Matches</p>
//                           <p className="font-bold text-red-700">{matchingStockOut.length} items = {totalOut.toFixed(2)} kg</p>
//                         </div>
//                         <div className="bg-blue-50 p-3 rounded-lg">
//                           <p className="text-slate-600 mb-1">Current Stock</p>
//                           <p className="font-bold text-blue-700">{(totalIn - totalOut).toFixed(2)} kg</p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Message */}
//             <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
//               <p className="text-slate-700">
//                 <strong>💡 Tip:</strong> Check if category names match stock descriptions exactly. 
//                 Look for extra spaces, different cases, or typos. The brackets [ ] show the exact text.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }