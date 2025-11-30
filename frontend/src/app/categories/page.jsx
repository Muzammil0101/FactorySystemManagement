// "use client";
// import { useState, useEffect } from "react";
// import { 
//   Folder, 
//   Search, 
//   Edit2, 
//   Trash2, 
//   Plus, 
//   Download, 
//   FileText, 
//   Package, 
//   TrendingUp, 
//   TrendingDown,
//   X,
//   CheckCircle,
//   AlertCircle,
//   Box,
//   AlertTriangle
// } from "lucide-react";

// const API_URL = "http://localhost:4000/api";

// export default function CategoryPage() {
//   const [categories, setCategories] = useState([]);
//   const [search, setSearch] = useState("");
//   const [form, setForm] = useState({ name: "", description: "" });
//   const [editingId, setEditingId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState(null);
  
//   // State for Delete Confirmation Modal
//   const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Updated to fetch Categories AND Stock Data to calculate totals
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [catRes, inRes, outRes] = await Promise.all([
//         fetch(`${API_URL}/categories`),
//         fetch(`${API_URL}/stock/stock-in`),
//         fetch(`${API_URL}/stock/stock-out`)
//       ]);

//       if (!catRes.ok || !inRes.ok || !outRes.ok) throw new Error('Failed to fetch data');

//       const catData = await catRes.json();
//       const inData = await inRes.json();
//       const outData = await outRes.json();

//       const safeCatData = Array.isArray(catData) ? catData : [];
//       const safeInData = Array.isArray(inData) ? inData : [];
//       const safeOutData = Array.isArray(outData) ? outData : [];

//       // Calculate totals for each category locally
//       const categoriesWithStats = safeCatData.map(cat => {
//         // Filter transactions that match the category name
//         // Note: Assuming 'description' in stock matches 'name' in category
//         const catName = cat.name.trim().toLowerCase();
        
//         const relevantIn = safeInData.filter(item => item.description?.trim().toLowerCase() === catName);
//         const relevantOut = safeOutData.filter(item => item.description?.trim().toLowerCase() === catName);

//         const totalIn = relevantIn.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
//         const totalOut = relevantOut.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

//         return {
//           ...cat,
//           stockIn: totalIn,
//           stockOut: totalOut,
//           currentStock: totalIn - totalOut
//         };
//       });

//       setCategories(categoriesWithStats);
//     } catch (err) {
//       showNotification(err.message, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   const filtered = categories.filter((item) =>
//     item.name.toLowerCase().includes(search.toLowerCase()) ||
//     (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
//   );

//   const handleAdd = async () => {
//     if (!form.name.trim()) {
//       showNotification("Category name is required!", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       const url = editingId ? `${API_URL}/categories/${editingId}` : `${API_URL}/categories`;
//       const method = editingId ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       const result = await response.json();

//       if (!response.ok) throw new Error(result.error || 'Operation failed');

//       showNotification(result.message, "success");
//       setForm({ name: "", description: "" });
//       setShowForm(false);
//       setEditingId(null);
//       await fetchData(); // Reload to update list
//     } catch (err) {
//       showNotification(err.message, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (cat) => {
//     setEditingId(cat.id);
//     setForm({ name: cat.name, description: cat.description || "" });
//     setShowForm(true);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Trigger the custom modal instead of window.confirm
//   const confirmDelete = (cat) => {
//     setDeleteModal({ show: true, id: cat.id, name: cat.name });
//   };

//   const executeDelete = async () => {
//     if (!deleteModal.id) return;

//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/categories/${deleteModal.id}`, { method: 'DELETE' });
//       const result = await response.json();

//       if (!response.ok) throw new Error(result.error || 'Failed to delete');

//       showNotification(result.message, "success");
//       setDeleteModal({ show: false, id: null, name: "" }); // Close modal
//       await fetchData(); // Reload data
//     } catch (err) {
//       showNotification(err.message, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportCSV = () => {
//     if (categories.length === 0) {
//       showNotification("No data to export", "error");
//       return;
//     }

//     const csv = [
//       ["Category Name", "Description", "Stock In (kg)", "Stock Out (kg)", "Current Stock (kg)"],
//       ...categories.map((c) => [
//         c.name, 
//         c.description || "", 
//         c.stockIn?.toFixed(2) || "0.00",
//         c.stockOut?.toFixed(2) || "0.00",
//         c.currentStock?.toFixed(2) || "0.00"
//       ]),
//     ]
//       .map((row) => row.map(cell => `"${cell}"`).join(","))
//       .join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `categories_stock_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     showNotification("Export successful", "success");
//   };

//   const handleCancel = () => {
//     setShowForm(false);
//     setEditingId(null);
//     setForm({ name: "", description: "" });
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
//       {/* Background Ambient Glows */}
//       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
//       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

//       {/* Notification Toast */}
//       {notification && (
//         <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${
//           notification.type === "success" 
//             ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
//             : "bg-rose-50 text-rose-700 border-rose-200"
//         }`}>
//           {notification.type === "success" ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-rose-500" />}
//           <p className="font-bold text-sm">{notification.message}</p>
//           <button onClick={() => setNotification(null)} className="hover:bg-slate-200/50 p-1 rounded-lg transition-colors ml-2">
//             <X size={16} />
//           </button>
//         </div>
//       )}

//       {/* Header Section */}
//       <div className="relative z-10 mb-8">
//         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
//               <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
//                 <Folder size={24} />
//               </span>
//               Category Management
//             </h1>
//             <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Organize and manage product categories</p>
//           </div>
//           <div className="flex gap-3">
//             <button 
//               onClick={exportCSV}
//               disabled={loading}
//               className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm transition-all"
//             >
//               <Download size={18} /> <span className="hidden sm:inline">Export</span>
//             </button>
//             <button 
//               onClick={() => {
//                 setShowForm(!showForm);
//                 if (showForm) handleCancel();
//               }}
//               disabled={loading}
//               className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
//             >
//               <Plus size={18} /> {showForm ? "Close Form" : "Add Category"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Add/Edit Form Section */}
//       {showForm && (
//         <div className="relative z-10 mb-8 animate-slide-in">
//           <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
//             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
//             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
//                     {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold text-slate-800">{editingId ? "Edit Category" : "New Category"}</h3>
//                     <p className="text-xs text-slate-500 font-medium">Enter category details below</p>
//                   </div>
//                 </div>
//                 {editingId && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200 font-bold">EDITING MODE</span>}
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Category Name</label>
//                   <div className="relative">
//                     <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                     <input
//                       type="text"
//                       placeholder="e.g. Rice"
//                       value={form.name}
//                       onChange={(e) => setForm({ ...form, name: e.target.value })}
//                       disabled={loading}
//                       className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
//                   <div className="relative">
//                     <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                     <input
//                       type="text"
//                       placeholder="Optional description"
//                       value={form.description}
//                       onChange={(e) => setForm({ ...form, description: e.target.value })}
//                       disabled={loading}
//                       className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3 mt-6">
//                 <button
//                   onClick={handleAdd}
//                   disabled={loading}
//                   className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
//                 >
//                   {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><CheckCircle size={18} /> {editingId ? "Update Category" : "Save Category"}</>}
//                 </button>
//                 <button
//                   onClick={handleCancel}
//                   disabled={loading}
//                   className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Search Bar */}
//       <div className="relative z-10 mb-8">
//         <div className="relative max-w-md">
//           <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
//           <input
//             placeholder="Search categories..."
//             className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             disabled={loading}
//           />
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading && categories.length === 0 && (
//         <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-12 text-center">
//           <div className="animate-spin mx-auto w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
//           <p className="text-slate-500 font-medium">Loading categories...</p>
//         </div>
//       )}

//       {/* Category Grid */}
//       {!loading && (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
//           {filtered.length === 0 ? (
//             <div className="col-span-full bg-white border border-slate-200 rounded-3xl shadow-lg p-12 text-center">
//               <Folder className="mx-auto text-slate-300 mb-4" size={64} />
//               <p className="text-slate-500 font-medium">
//                 {search ? "No categories found matching your search" : "No categories yet"}
//               </p>
//               {!search && !showForm && (
//                 <button
//                   onClick={() => setShowForm(true)}
//                   className="mt-4 text-blue-600 font-bold hover:underline"
//                 >
//                   Create your first category
//                 </button>
//               )}
//             </div>
//           ) : (
//             filtered.map((cat) => (
//               <div key={cat.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group">
//                 <div className="flex justify-between items-start mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
//                       <Folder size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-slate-800 text-lg leading-tight">{cat.name}</h3>
//                       <p className="text-xs text-slate-500 mt-0.5">{cat.description || "No description"}</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-xl transition-colors"><Edit2 size={16} /></button>
//                     {/* Use confirmDelete instead of direct handleDelete */}
//                     <button onClick={() => confirmDelete(cat)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors"><Trash2 size={16} /></button>
//                   </div>
//                 </div>

//                 {/* Stock Stats Grid */}
//                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
//                    <div className="flex justify-between items-center mb-3">
//                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Stock</span>
//                       <span className="text-lg font-extrabold text-slate-700">{cat.currentStock?.toFixed(2) || "0.00"} <span className="text-xs font-medium text-slate-400">kg</span></span>
//                    </div>
                   
//                    <div className="grid grid-cols-2 gap-3">
//                       <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
//                          <div className="flex items-center gap-1.5 mb-1">
//                             <TrendingUp size={14} className="text-emerald-500" />
//                             <span className="text-[10px] font-bold text-slate-400 uppercase">Inflow</span>
//                          </div>
//                          <p className="text-sm font-bold text-emerald-600">{cat.stockIn?.toFixed(2) || "0.00"}</p>
//                       </div>
//                       <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
//                          <div className="flex items-center gap-1.5 mb-1">
//                             <TrendingDown size={14} className="text-rose-500" />
//                             <span className="text-[10px] font-bold text-slate-400 uppercase">Outflow</span>
//                          </div>
//                          <p className="text-sm font-bold text-rose-600">{cat.stockOut?.toFixed(2) || "0.00"}</p>
//                       </div>
//                    </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-white/20">
//             <div className="p-6 text-center">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
//                 <AlertTriangle size={32} />
//               </div>
//               <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Category?</h3>
//               <p className="text-slate-600 text-sm mb-1">
//                 Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteModal.name}"</span>?
//               </p>
//               <p className="text-xs text-red-500 font-medium">
//                 This action cannot be undone.
//               </p>
//             </div>
//             <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
//               <button 
//                 onClick={() => setDeleteModal({ show: false, id: null, name: "" })}
//                 className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={executeDelete}
//                 className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
//               >
//                 {loading ? "Deleting..." : <><Trash2 size={16} /> Delete</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

//new
"use client";
import { useState, useEffect } from "react";
import { 
  Folder, 
  Search, 
  Edit2, 
  Trash2, 
  Plus, 
  Download, 
  FileText, 
  Package, 
  TrendingUp, 
  TrendingDown,
  X,
  CheckCircle,
  AlertCircle,
  Box,
  AlertTriangle
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // State for Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });

  useEffect(() => {
    fetchData();
  }, []);

  // Updated to fetch Categories AND Stock Data to calculate totals
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, inRes, outRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/stock/stock-in`),
        fetch(`${API_URL}/stock/stock-out`)
      ]);

      if (!catRes.ok || !inRes.ok || !outRes.ok) throw new Error('Failed to fetch data');

      const catData = await catRes.json();
      const inData = await inRes.json();
      const outData = await outRes.json();

      const safeCatData = Array.isArray(catData) ? catData : [];
      const safeInData = Array.isArray(inData) ? inData : [];
      const safeOutData = Array.isArray(outData) ? outData : [];

      // Calculate totals for each category locally
      const categoriesWithStats = safeCatData.map(cat => {
        const catName = cat.name.trim().toLowerCase();
        
        // 1. FILTERED LISTS (For Display In/Out ONLY)
        // We filter out transfers so they don't bloat the Inflow/Outflow stats
        const relevantInFiltered = safeInData.filter(item => 
          item.description?.trim().toLowerCase() === catName && 
          item.supplier !== 'Monthly Transfer'
        );
        
        const relevantOutFiltered = safeOutData.filter(item => 
          item.description?.trim().toLowerCase() === catName &&
          item.customer !== 'Month End Transfer'
        );

        const displayIn = relevantInFiltered.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
        const displayOut = relevantOutFiltered.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

        // 2. UNFILTERED LISTS (For Actual Current Stock)
        // We MUST include transfers here to get the correct physical stock on hand
        const relevantInAll = safeInData.filter(item => 
          item.description?.trim().toLowerCase() === catName
        );
        const relevantOutAll = safeOutData.filter(item => 
          item.description?.trim().toLowerCase() === catName
        );

        const totalInAll = relevantInAll.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
        const totalOutAll = relevantOutAll.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
        const actualStock = totalInAll - totalOutAll;
        
        return {
          ...cat,
          stockIn: displayIn,    // Visual Inflow (Clean)
          stockOut: displayOut,  // Visual Outflow (Clean)
          currentStock: actualStock // Actual Physical Stock (Accurate)
        };
      });

      setCategories(categoriesWithStats);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!form.name.trim()) {
      showNotification("Category name is required!", "error");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `${API_URL}/categories/${editingId}` : `${API_URL}/categories`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Operation failed');

      showNotification(result.message, "success");
      setForm({ name: "", description: "" });
      setShowForm(false);
      setEditingId(null);
      await fetchData(); // Reload to update list
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger the custom modal instead of window.confirm
  const confirmDelete = (cat) => {
    setDeleteModal({ show: true, id: cat.id, name: cat.name });
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories/${deleteModal.id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to delete');

      showNotification(result.message, "success");
      setDeleteModal({ show: false, id: null, name: "" }); // Close modal
      await fetchData(); // Reload data
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (categories.length === 0) {
      showNotification("No data to export", "error");
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
    showNotification("Export successful", "success");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "" });
  };

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

      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                <Folder size={24} />
              </span>
              Category Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Organize and manage product categories</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportCSV}
              disabled={loading}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm transition-all"
            >
              <Download size={18} /> <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) handleCancel();
              }}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
            >
              <Plus size={18} /> {showForm ? "Close Form" : "Add Category"}
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Section */}
      {showForm && (
        <div className="relative z-10 mb-8 animate-slide-in">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                    {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{editingId ? "Edit Category" : "New Category"}</h3>
                    <p className="text-xs text-slate-500 font-medium">Enter category details below</p>
                  </div>
                </div>
                {editingId && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200 font-bold">EDITING MODE</span>}
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Category Name</label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Rice"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={loading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Optional description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      disabled={loading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><CheckCircle size={18} /> {editingId ? "Update Category" : "Save Category"}</>}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative z-10 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && categories.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-12 text-center">
          <div className="animate-spin mx-auto w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-slate-500 font-medium">Loading categories...</p>
        </div>
      )}

      {/* Category Grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl shadow-lg p-12 text-center">
              <Folder className="mx-auto text-slate-300 mb-4" size={64} />
              <p className="text-slate-500 font-medium">
                {search ? "No categories found matching your search" : "No categories yet"}
              </p>
              {!search && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  Create your first category
                </button>
              )}
            </div>
          ) : (
            filtered.map((cat) => (
              <div key={cat.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                      <Folder size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{cat.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{cat.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-xl transition-colors"><Edit2 size={16} /></button>
                    {/* Use confirmDelete instead of direct handleDelete */}
                    <button onClick={() => confirmDelete(cat)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* Stock Stats Grid */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Stock</span>
                      <span className="text-lg font-extrabold text-slate-700">{cat.currentStock?.toFixed(2) || "0.00"} <span className="text-xs font-medium text-slate-400">kg</span></span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                         <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Inflow</span>
                         </div>
                         <p className="text-sm font-bold text-emerald-600">{cat.stockIn?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                         <div className="flex items-center gap-1.5 mb-1">
                            <TrendingDown size={14} className="text-rose-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Outflow</span>
                         </div>
                         <p className="text-sm font-bold text-rose-600">{cat.stockOut?.toFixed(2) || "0.00"}</p>
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-white/20">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Category?</h3>
              <p className="text-slate-600 text-sm mb-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteModal.name}"</span>?
              </p>
              <p className="text-xs text-red-500 font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => setDeleteModal({ show: false, id: null, name: "" })}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Deleting..." : <><Trash2 size={16} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}