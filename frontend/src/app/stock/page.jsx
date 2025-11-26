// "use client";
// import { useState, useEffect } from "react";
// import { Package, TrendingUp, TrendingDown, Plus, Calendar, FileText, User, CheckCircle, AlertCircle, X, Edit2, Trash2, DollarSign } from "lucide-react";

// const API_URL = "http://localhost:4000/api"; // Adjusted to relative path for standard Next.js setups, change back to full URL if needed

// export default function StockPage() {
//   const [stockIn, setStockIn] = useState([]);
//   const [stockOut, setStockOut] = useState([]);
//   const [suppliers, setSuppliers] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, currentStock: 0 });
//   const [notification, setNotification] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [editType, setEditType] = useState(null);

//   const [formIn, setFormIn] = useState({
//     date: new Date().toISOString().split('T')[0],
//     description: "",
//     weight: "",
//     rate: "",
//     amount: "",
//     supplier: "",
//   });

//   const [formOut, setFormOut] = useState({
//     date: new Date().toISOString().split('T')[0],
//     description: "",
//     weight: "",
//     rate: "", // Sale Rate
//     purchase_rate: "", // Purchased Rate
//     amount: "",
//     customer: "",
//   });

//   // Fetch all data on mount
//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         fetchStockIn(),
//         fetchStockOut(),
//         fetchSuppliers(),
//         fetchCustomers(),
//         fetchCategories(),
//         fetchSummary()
//       ]);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       showNotification("Error loading data", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStockIn = async () => {
//     try {
//       const res = await fetch(`${API_URL}/stock/stock-in`);
//       if (!res.ok) throw new Error('Failed to fetch stock in');
//       const data = await res.json();
//       setStockIn(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error fetching stock in:", error);
//       setStockIn([]);
//     }
//   };

//   const fetchStockOut = async () => {
//     try {
//       const res = await fetch(`${API_URL}/stock/stock-out`);
//       if (!res.ok) throw new Error('Failed to fetch stock out');
//       const data = await res.json();
//       setStockOut(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error fetching stock out:", error);
//       setStockOut([]);
//     }
//   };

//   const fetchSuppliers = async () => {
//     try {
//       const res = await fetch(`${API_URL}/suppliers`);
//       if (!res.ok) throw new Error('Failed to fetch suppliers');
//       const data = await res.json();
//       setSuppliers(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error fetching suppliers:", error);
//       setSuppliers([]);
//     }
//   };

//   const fetchCustomers = async () => {
//     try {
//       const res = await fetch(`${API_URL}/customers`);
//       if (!res.ok) throw new Error('Failed to fetch customers');
//       const data = await res.json();
//       setCustomers(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//       setCustomers([]);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch(`${API_URL}/categories`);
//       if (!res.ok) throw new Error('Failed to fetch categories');
//       const data = await res.json();
//       setCategories(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       setCategories([]);
//     }
//   };

//   const fetchSummary = async () => {
//     try {
//       const res = await fetch(`${API_URL}/stock/summary`);
//       if (!res.ok) throw new Error('Failed to fetch summary');
//       const data = await res.json();
//       setSummary(data);
//     } catch (error) {
//       console.error("Error fetching summary:", error);
//       setSummary({ totalIn: 0, totalOut: 0, currentStock: 0 });
//     }
//   };

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   const handleChange = (e, type) => {
//     const { name, value } = e.target;
//     const form = type === "in" ? { ...formIn } : { ...formOut };
//     form[name] = value;

//     if (type === "in") {
//       if (name === "weight" || name === "rate") {
//         const weight = name === "weight" ? value : form.weight;
//         const rate = name === "rate" ? value : form.rate;
//         form.amount = weight && rate ? (weight * rate).toFixed(2) : "";
//       }
//       setFormIn(form);
//     }  else {
//       // Logic for Stock Out
//       // IMPORTANT: Amount here is calculated using SALE RATE for the Customer Ledger
//       if (name === "weight" || name === "rate") { 
//         const weight = name === "weight" ? value : form.weight;
//         const sRate = name === "rate" ? value : form.rate; // Sale Rate
        
//         form.amount = weight && sRate ? (weight * sRate).toFixed(2) : "";
//       }
//       setFormOut(form);
//     }
//   };

//   const handleEdit = (item, type) => {
//     setEditingId(item.id);
//     setEditType(type);
//     if (type === "in") {
//       setFormIn({
//         date: item.date,
//         description: item.description,
//         weight: item.weight,
//         rate: item.rate,
//         amount: item.amount,
//         supplier: item.supplier,
//       });
//     } else {
//       setFormOut({
//         date: item.date,
//         description: item.description,
//         weight: item.weight,
//         rate: item.rate, 
//         purchase_rate: item.purchase_rate || "",
//         amount: item.amount,
//         customer: item.customer,
//       });
//     }
//   };

//   const handleDelete = async (id, type) => {
//     if (!confirm("Are you sure you want to delete this record?")) return;

//     setLoading(true);
//     try {
//       const endpoint = type === "in" ? "stock-in" : "stock-out";
//       const res = await fetch(`${API_URL}/stock/${endpoint}/${id}`, {
//         method: "DELETE",
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         showNotification(data.error || "Error deleting record", "error");
//         return;
//       }

//       showNotification(data.message || "Record deleted successfully", "success");
//       await fetchAllData();
//     } catch (error) {
//       console.error("Error:", error);
//       showNotification("Error deleting record", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdd = async (type) => {
//     const form = type === "in" ? formIn : formOut;

//     // Validation
//     if (!form.date || !form.description || !form.weight || !form.rate) {
//       showNotification("Please fill all required fields!", "error");
//       return;
//     }
//     if (type === "in" && !form.supplier) {
//       showNotification("Please select a supplier!", "error");
//       return;
//     }
//     if (type === "out" && !form.customer) {
//       showNotification("Please select a customer!", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       const endpoint = type === "in" ? "stock-in" : "stock-out";
//       const method = editingId ? "PUT" : "POST";
//       const url = editingId ? `${API_URL}/stock/${endpoint}/${editingId}` : `${API_URL}/stock/${endpoint}`;

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form)
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         showNotification(data.error || "Error saving data", "error");
//         return;
//       }

//       showNotification(data.message, "success");

//       // Refresh data
//       await fetchAllData();

//       // Reset form and editing state
//       setEditingId(null);
//       setEditType(null);
//       if (type === "in") {
//         setFormIn({ 
//           date: new Date().toISOString().split('T')[0], 
//           description: "", 
//           weight: "", 
//           rate: "", 
//           amount: "", 
//           supplier: "" 
//         });
//       } else {
//         setFormOut({ 
//           date: new Date().toISOString().split('T')[0], 
//           description: "", 
//           weight: "", 
//           rate: "", 
//           purchase_rate: "",
//           amount: "", 
//           customer: "" 
//         });
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       showNotification("Error saving data. Please try again.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setEditingId(null);
//     setEditType(null);
//     setFormIn({ 
//       date: new Date().toISOString().split('T')[0], 
//       description: "", 
//       weight: "", 
//       rate: "", 
//       amount: "", 
//       supplier: "" 
//     });
//     setFormOut({ 
//       date: new Date().toISOString().split('T')[0], 
//       description: "", 
//       weight: "", 
//       rate: "", 
//       purchase_rate: "",
//       amount: "", 
//       customer: "" 
//     });
//   };

//   return (
//     <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-10">
//       {/* Notification Toast */}
//       {notification && (
//         <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${
//           notification.type === "success" 
//             ? "bg-gradient-to-r from-green-500 to-emerald-500" 
//             : "bg-gradient-to-r from-red-500 to-rose-500"
//         }`}>
//           {notification.type === "success" ? (
//             <CheckCircle className="text-white" size={24} />
//           ) : (
//             <AlertCircle className="text-white" size={24} />
//           )}
//           <p className="text-white font-medium">{notification.message}</p>
//           <button 
//             onClick={() => setNotification(null)}
//             className="text-white hover:bg-white/20 p-1 rounded-lg transition-all ml-2"
//           >
//             <X size={18} />
//           </button>
//         </div>
//       )}

//       {/* Header */}
//       <div className="text-center mb-8">
//         <div className="flex justify-center mb-4">
//           <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-3xl shadow-lg">
//             <Package className="text-white" size={40} />
//           </div>
//         </div>
//         <h1 className="text-4xl font-bold text-slate-800">Stock Management</h1>
//         <p className="text-slate-600 mt-2">Track your inventory in real-time</p>
//         <p className="text-sm text-slate-500 mt-1">Description = Category Name (auto-creates in Category page)</p>
//       </div>

//       {/* Current Stock Display */}
//       <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 mb-8 text-center border border-white/50">
//         <h2 className="text-lg font-medium text-slate-600 mb-3">Current Stock Level</h2>
//         <div className="flex items-center justify-center gap-3 mb-4">
//           <Package className="text-purple-600" size={32} />
//           <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//             {summary.currentStock.toFixed(2)} kg
//           </p>
//         </div>
//         <div className="flex justify-center gap-8 mt-6">
//           <div className="flex items-center gap-2">
//             <TrendingUp className="text-green-600" size={20} />
//             <div className="text-left">
//               <p className="text-xs text-slate-500">Stock In</p>
//               <p className="text-lg font-bold text-green-700">{summary.totalIn.toFixed(2)} kg</p>
//             </div>
//           </div>
//           <div className="h-12 w-px bg-slate-300"></div>
//           <div className="flex items-center gap-2">
//             <TrendingDown className="text-red-600" size={20} />
//             <div className="text-left">
//               <p className="text-xs text-slate-500">Stock Out</p>
//               <p className="text-lg font-bold text-red-700">{summary.totalOut.toFixed(2)} kg</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stock Forms */}
//       <div className="grid lg:grid-cols-2 gap-8">
//         {/* Stock In Form */}
//         <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border border-white/50">
//           <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
//             <div className="flex items-center gap-3">
//               <div className="bg-white/20 p-2 rounded-xl">
//                 <TrendingUp className="text-white" size={24} />
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold text-white">{editingId && editType === "in" ? "Edit Stock In" : "Stock In"}</h3>
//                 <p className="text-green-100 text-sm">{editingId && editType === "in" ? "Update inventory record" : "Add inventory from supplier"}</p>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
//                 <Calendar size={16} className="text-green-600" />
//                 Date *
//               </label>
//               <input 
//                 type="date" 
//                 name="date" 
//                 value={formIn.date} 
//                 onChange={(e) => handleChange(e, "in")} 
//                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
//                 <FileText size={16} className="text-green-600" />
//                 Category Name (Description) *
//               </label>
//               <input 
//                 type="text" 
//                 name="description" 
//                 value={formIn.description} 
//                 onChange={(e) => handleChange(e, "in")} 
//                 placeholder="e.g., Rice, Wheat, Sugar..." 
//                 list="category-list"
//                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
//               />
//               <datalist id="category-list">
//                 {Array.isArray(categories) && categories.map(c => (
//                   <option key={c.id} value={c.name} />
//                 ))}
//               </datalist>
//               <p className="text-xs text-slate-500 mt-1">💡 This will auto-create category if new</p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
//                 <User size={16} className="text-green-600" />
//                 Supplier *
//               </label>
//               <input 
//                 type="text" 
//                 name="supplier" 
//                 value={formIn.supplier} 
//                 onChange={(e) => handleChange(e, "in")} 
//                 placeholder="Select or type supplier name" 
//                 list="supplier-list" 
//                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
//               />
//               <datalist id="supplier-list">
//                 {Array.isArray(suppliers) && suppliers.map(s => (
//                   <option key={s.id} value={s.name} />
//                 ))}
//               </datalist>
//             </div>

//             <div className="grid grid-cols-3 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-2">Weight (kg) *</label>
//                 <input 
//                   type="number" 
//                   step="0.01" 
//                   name="weight" 
//                   value={formIn.weight} 
//                   onChange={(e) => handleChange(e, "in")} 
//                   placeholder="0.00" 
//                   className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-2">Rate *</label>
//                 <input 
//                   type="number" 
//                   step="0.01" 
//                   name="rate" 
//                   value={formIn.rate} 
//                   onChange={(e) => handleChange(e, "in")} 
//                   placeholder="0.00" 
//                   className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-2">Amount (PKR)</label>
//                 <input 
//                   type="number" 
//                   name="amount" 
//                   value={formIn.amount} 
//                   readOnly 
//                   placeholder="0.00" 
//                   className="w-full border border-slate-300 p-3 rounded-xl bg-slate-50 text-slate-600 font-semibold"
//                 />
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button 
//                 onClick={() => handleAdd("in")} 
//                 disabled={loading}
//                 className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Plus size={20} /> {loading ? "Processing..." : editingId && editType === "in" ? "Update Stock In" : "Add Stock In"}
//               </button>
//               {editingId && editType === "in" && (
//                 <button 
//                   onClick={handleCancel}
//                   className="flex-1 bg-slate-400 hover:bg-slate-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Stock Out Form */}
//         <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border border-white/50">
//           <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
//             <div className="flex items-center gap-3">
//               <div className="bg-white/20 p-2 rounded-xl">
//                 <TrendingDown className="text-white" size={24} />
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold text-white">{editingId && editType === "out" ? "Edit Stock Out" : "Stock Out"}</h3>
//                 <p className="text-red-100 text-sm">{editingId && editType === "out" ? "Update inventory record" : "Sell inventory to customer"}</p>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
//                 <Calendar size={16} className="text-red-600" />
//                 Date *
//               </label>
//               <input 
//                 type="date" 
//                 name="date" 
//                 value={formOut.date} 
//                 onChange={(e) => handleChange(e, "out")} 
//                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
//                 <FileText size={16} className="text-red-600" />
//                 Category Name (Description) *
//               </label>
//               <input 
//                 type="text" 
//                 name="description" 
//                 value={formOut.description} 
//                 onChange={(e) => handleChange(e, "out")} 
//                 placeholder="e.g., Rice, Wheat, Sugar..." 
//                 list="category-list-out"
//                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
//               />
//               <datalist id="category-list-out">
//                 {Array.isArray(categories) && categories.map(c => (
//                   <option key={c.id} value={c.name} />
//                 ))}
//               </datalist>
//               <p className="text-xs text-slate-500 mt-1">💡 This will auto-create category if new</p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
//                 <User size={16} className="text-red-600" />
//                 Customer *
//               </label>
//               <input 
//                 type="text" 
//                 name="customer" 
//                 value={formOut.customer} 
//                 onChange={(e) => handleChange(e, "out")} 
//                 placeholder="Select or type customer name" 
//                 list="customer-list" 
//                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
//               />
//               <datalist id="customer-list">
//                 {Array.isArray(customers) && customers.map(c => (
//                   <option key={c.id} value={c.name} />
//                 ))}
//               </datalist>
//             </div>

//             {/* Split Rates Grid */}
//             <div className="grid grid-cols-2 gap-3">
//                <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-2 text-green-700">Sale Rate *</label>
//                 <div className="relative">
//                   <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                   <input 
//                     type="number" 
//                     step="0.01" 
//                     name="rate" 
//                     value={formOut.rate} 
//                     onChange={(e) => handleChange(e, "out")} 
//                     placeholder="Sold At" 
//                     className="w-full pl-8 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-green-50"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-2 text-blue-700">Purchased Rate</label>
//                 <div className="relative">
//                   <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                   <input 
//                     type="number" 
//                     step="0.01" 
//                     name="purchase_rate" 
//                     value={formOut.purchase_rate} 
//                     onChange={(e) => handleChange(e, "out")} 
//                     placeholder="Cost Price" 
//                     className="w-full pl-8 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-blue-50"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-2">Weight (kg) *</label>
//                 <input 
//                   type="number" 
//                   step="0.01" 
//                   name="weight" 
//                   value={formOut.weight} 
//                   onChange={(e) => handleChange(e, "out")} 
//                   placeholder="0.00" 
//                   className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-2">Total Amount (PKR)</label>
//                 <input 
//                   type="number" 
//                   name="amount" 
//                   value={formOut.amount} 
//                   readOnly 
//                   placeholder="0.00" 
//                   className="w-full border border-slate-300 p-3 rounded-xl bg-slate-50 text-slate-600 font-semibold"
//                 />
//                 <p className="text-[10px] text-gray-500 mt-1">Calculated via Sale Rate for Customer Ledger</p>
//               </div>
//             </div>

//             {/* Stock Warning */}
//             {formOut.weight && parseFloat(formOut.weight) > summary.currentStock && (
//               <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
//                 <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
//                 <div className="text-sm">
//                   <p className="text-red-800 font-medium">Insufficient Stock</p>
//                   <p className="text-red-600">Available: {summary.currentStock.toFixed(2)} kg</p>
//                 </div>
//               </div>
//             )}

//             <div className="flex gap-3">
//               <button 
//                 onClick={() => handleAdd("out")} 
//                 disabled={loading}
//                 className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Plus size={20} /> {loading ? "Processing..." : editingId && editType === "out" ? "Update Stock Out" : "Add Stock Out"}
//               </button>
//               {editingId && editType === "out" && (
//                 <button 
//                   onClick={handleCancel}
//                   className="flex-1 bg-slate-400 hover:bg-slate-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recent Transactions Summary */}
//       <div className="grid md:grid-cols-2 gap-6 mt-8">
//         {/* Recent Stock In */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
//           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
//             <TrendingUp className="text-green-600" size={20} />
//             Recent Stock In
//           </h3>
//           <div className="space-y-3 max-h-96 overflow-y-auto">
//             {Array.isArray(stockIn) && stockIn.slice(-5).reverse().map((item, idx) => (
//               <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 transition-all">
//                 <div className="flex justify-between items-start mb-2">
//                   <div>
//                     <p className="font-bold text-slate-800">{item.description}</p>
//                     <p className="text-xs text-slate-600">{item.supplier} • {item.date}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <button 
//                       onClick={() => handleEdit(item, "in")}
//                       className="p-2 hover:bg-green-200 rounded-lg transition-all text-green-700"
//                       title="Edit"
//                     >
//                       <Edit2 size={16} />
//                     </button>
//                     <button 
//                       onClick={() => handleDelete(item.id, "in")}
//                       className="p-2 hover:bg-red-200 rounded-lg transition-all text-red-700"
//                       title="Delete"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-2 text-sm">
//                   <div className="bg-white/60 p-2 rounded-lg">
//                     <p className="text-xs text-slate-600">Weight</p>
//                     <p className="font-semibold text-green-700">{item.weight} kg</p>
//                   </div>
//                   <div className="bg-white/60 p-2 rounded-lg">
//                     <p className="text-xs text-slate-600">Rate</p>
//                     <p className="font-semibold text-green-700">₨{parseFloat(item.rate).toFixed(2)}</p>
//                   </div>
//                   <div className="bg-white/60 p-2 rounded-lg">
//                     <p className="text-xs text-slate-600">Amount</p>
//                     <p className="font-semibold text-green-700">₨{parseFloat(item.amount).toLocaleString()}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {(!Array.isArray(stockIn) || stockIn.length === 0) && (
//               <p className="text-center text-slate-400 py-4">No transactions yet</p>
//             )}
//           </div>
//         </div>

//         {/* Recent Stock Out */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
//           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
//             <TrendingDown className="text-red-600" size={20} />
//             Recent Stock Out
//           </h3>
//           <div className="space-y-3 max-h-96 overflow-y-auto">
//             {Array.isArray(stockOut) && stockOut.slice(-5).reverse().map((item, idx) => (
//               <div key={idx} className="p-4 bg-red-50 rounded-xl border border-red-100 hover:border-red-300 transition-all">
//                 <div className="flex justify-between items-start mb-2">
//                   <div>
//                     <p className="font-bold text-slate-800">{item.description}</p>
//                     <p className="text-xs text-slate-600">{item.customer} • {item.date}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <button 
//                       onClick={() => handleEdit(item, "out")}
//                       className="p-2 hover:bg-red-200 rounded-lg transition-all text-red-700"
//                       title="Edit"
//                     >
//                       <Edit2 size={16} />
//                     </button>
//                     <button 
//                       onClick={() => handleDelete(item.id, "out")}
//                       className="p-2 hover:bg-red-200 rounded-lg transition-all text-red-700"
//                       title="Delete"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//                 {/* UPDATED: Shows Purchase Rate and calculates Total based on Purchase Rate 
//                    Calculation: Weight * Purchase Rate = Total Cost Amount
//                 */}
//                 <div className="grid grid-cols-3 gap-2 text-sm">
//                   <div className="bg-white/60 p-2 rounded-lg">
//                     <p className="text-xs text-slate-600">Weight</p>
//                     <p className="font-semibold text-red-700">{item.weight} kg</p>
//                   </div>
//                   <div className="bg-white/60 p-2 rounded-lg">
//                     <p className="text-xs text-slate-600">Pur. Rate</p>
//                     <p className="font-semibold text-blue-700">
//                       {item.purchase_rate ? `₨${parseFloat(item.purchase_rate).toFixed(2)}` : '-'}
//                     </p>
//                   </div>
//                   <div className="bg-white/60 p-2 rounded-lg">
//                     <p className="text-xs text-slate-600">Pur. Amount</p>
//                     <p className="font-semibold text-red-700">
//                       ₨{(parseFloat(item.weight) * parseFloat(item.purchase_rate || 0)).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {(!Array.isArray(stockOut) || stockOut.length === 0) && (
//               <p className="text-center text-slate-400 py-4">No transactions yet</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  Box
} from "lucide-react";

const API_URL = "http://localhost:4000/api"; 

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

  // --- API Functions (Same logic as before) ---
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

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/stock/summary`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSummary(data);
    } catch (error) { setSummary({ totalIn: 0, totalOut: 0, currentStock: 0 }); }
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
      if (name === "weight" || name === "rate") { 
        const weight = name === "weight" ? value : form.weight;
        const sRate = name === "rate" ? value : form.rate; 
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
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setLoading(true);
    try {
      const endpoint = type === "in" ? "stock-in" : "stock-out";
      const res = await fetch(`${API_URL}/stock/${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showNotification(data.error || "Error", "error"); return; }
      showNotification(data.message || "Deleted", "success");
      await fetchAllData();
    } catch (error) { showNotification("Error deleting", "error"); } finally { setLoading(false); }
  };

  const handleAdd = async (type) => {
    const form = type === "in" ? formIn : formOut;
    if (!form.date || !form.description || !form.weight || !form.rate) {
      showNotification("Please fill all required fields!", "error");
      return;
    }
    if (type === "in" && !form.supplier) { showNotification("Please select a supplier!", "error"); return; }
    if (type === "out" && !form.customer) { showNotification("Please select a customer!", "error"); return; }

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
        setFormIn({ date: new Date().toISOString().split('T')[0], description: "", weight: "", rate: "", amount: "", supplier: "" });
      } else {
        setFormOut({ date: new Date().toISOString().split('T')[0], description: "", weight: "", rate: "", purchase_rate: "", amount: "", customer: "" });
      }
    } catch (error) { showNotification("Error saving data", "error"); } finally { setLoading(false); }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditType(null);
    setFormIn({ date: new Date().toISOString().split('T')[0], description: "", weight: "", rate: "", amount: "", supplier: "" });
    setFormOut({ date: new Date().toISOString().split('T')[0], description: "", weight: "", rate: "", purchase_rate: "", amount: "", customer: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
      {/* Background Ambient Glows (Light Mode) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

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
          <div className="flex gap-2 text-xs font-mono text-slate-600 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
             <span>SYS: ONLINE</span>
             <span className="text-emerald-500 animate-pulse">●</span>
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
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 relative">
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

          <div className="p-6 space-y-5">
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Item Category</label>
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

             <div className="flex gap-3 pt-2">
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
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 relative">
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

          <div className="p-6 space-y-5">
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Item Category</label>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-rose-500/20 outline-none text-right font-mono font-medium"
                  />
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

              {/* Insufficient Stock Warning */}
              {formOut.weight && parseFloat(formOut.weight) > summary.currentStock && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-3">
                  <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-rose-700 font-bold text-xs">Insufficient Stock!</p>
                    <p className="text-rose-600/80 text-[10px]">Max Available: {summary.currentStock.toFixed(2)} kg</p>
                  </div>
                </div>
              )}

             <div className="flex gap-3 pt-2">
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
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
              Recent Inflow
           </h3>
           <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {Array.isArray(stockIn) && stockIn.slice(-5).reverse().map((item, idx) => (
                <div key={idx} className="group p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all duration-300 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.description}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="text-emerald-600">{item.supplier}</span> 
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span> 
                        {item.date}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item, "in")} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(item.id, "in")} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
              {(!Array.isArray(stockIn) || stockIn.length === 0) && <p className="text-center text-slate-400 text-xs py-4 italic">No records found</p>}
           </div>
        </div>

        {/* Recent Stock Out List */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm"></span>
              Recent Outflow
           </h3>
           <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {Array.isArray(stockOut) && stockOut.slice(-5).reverse().map((item, idx) => (
                <div key={idx} className="group p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all duration-300 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.description}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="text-rose-600">{item.customer}</span> 
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span> 
                        {item.date}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item, "out")} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(item.id, "out")} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
              {(!Array.isArray(stockOut) || stockOut.length === 0) && <p className="text-center text-slate-400 text-xs py-4 italic">No records found</p>}
           </div>
        </div>

      </div>
    </div>
  );
}