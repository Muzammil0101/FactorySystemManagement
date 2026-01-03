
// "use client";
// import { useState, useEffect } from "react";
// import { 
//   TrendingUp, 
//   TrendingDown, 
//   Plus, 
//   Edit2, 
//   Trash2, 
//   Banknote, 
//   Calendar, 
//   FileText,
//   CheckCircle,
//   AlertCircle,
//   X,
//   RotateCcw, 
//   Receipt,
//   Search,
//   Download,
//   FileSpreadsheet,
//   Package,
//   Clock,
//   Printer
// } from "lucide-react";

// const API_URL = "http://localhost:4000/api";

// export default function MallManagementPage() {
//   // --- STATE ---
//   // Date Range State (Defaults to current month start and end)
//   const [dateRange, setDateRange] = useState(() => {
//     const now = new Date();
//     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
//     return { start: firstDay, end: lastDay };
//   });

//   const [searchTerm, setSearchTerm] = useState("");
  
//   const [salesData, setSalesData] = useState([]);
//   const [purchaseData, setPurchaseData] = useState([]);
//   const [suppliers, setSuppliers] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [stockData, setStockData] = useState([]); // For Stock Remaining
  
//   const [loading, setLoading] = useState(false);
//   const [notification, setNotification] = useState(null);
//   const [showStockModal, setShowStockModal] = useState(false);

//   // Forms
//   const [saleForm, setSaleForm] = useState({
//     date: new Date().toISOString().split('T')[0],
//     detail: "",
//     weight: "",
//     rate: "",
//     amount: "",
//     customer: "",
//     is_return: false
//   });

//   const [purchaseForm, setPurchaseForm] = useState({
//     date: new Date().toISOString().split('T')[0],
//     detail: "",
//     weight: "",
//     rate: "",
//     amount: "",
//     supplier: "",
//     is_expense: false
//   });

//   const [editingSale, setEditingSale] = useState(null);
//   const [editingPurchase, setEditingPurchase] = useState(null);

//   // --- FETCH DATA ---
//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         fetchSales(),
//         fetchPurchases(),
//         fetchSuppliers(),
//         fetchCustomers(),
//         fetchStockData() // Fetch categories for stock remaining
//       ]);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       showNotification("Error loading data", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSales = async () => {
//     const res = await fetch(`${API_URL}/stock/stock-out`);
//     const data = await res.json();
//     setSalesData(Array.isArray(data) ? data : []);
//   };

//   const fetchPurchases = async () => {
//     const res = await fetch(`${API_URL}/stock/stock-in`);
//     const data = await res.json();
//     setPurchaseData(Array.isArray(data) ? data : []);
//   };

//   const fetchSuppliers = async () => {
//     const res = await fetch(`${API_URL}/suppliers`);
//     const data = await res.json();
//     setSuppliers(Array.isArray(data) ? data : []);
//   };

//   const fetchCustomers = async () => {
//     const res = await fetch(`${API_URL}/customers`);
//     const data = await res.json();
//     setCustomers(Array.isArray(data) ? data : []);
//   };

//   const fetchStockData = async () => {
//     // Using the /categories endpoint from your backend which calculates currentStock
//     const res = await fetch(`${API_URL}/categories`);
//     const data = await res.json();
//     setStockData(Array.isArray(data) ? data : []);
//   };

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   // --- FILTERING LOGIC ---
  
//   const isWithinDateRange = (dateStr) => {
//     return dateStr >= dateRange.start && dateStr <= dateRange.end;
//   };

//   const matchesSearch = (item, type) => {
//     const search = searchTerm.toLowerCase();
//     const desc = item.description?.toLowerCase() || "";
//     const entity = type === 'sale' ? (item.customer?.toLowerCase() || "") : (item.supplier?.toLowerCase() || "");
//     return desc.includes(search) || entity.includes(search);
//   };

//   // Filtered Lists
//   const filteredSales = salesData.filter(item => {
//     return isWithinDateRange(item.date) && 
//            matchesSearch(item, 'sale') && 
//            item.customer !== 'Month End Transfer';
//   });

//   const filteredPurchases = purchaseData.filter(item => {
//     return isWithinDateRange(item.date) && 
//            matchesSearch(item, 'purchase') && 
//            item.supplier !== 'Monthly Transfer';
//   });

//   // Daily Summary Logic
//   const today = new Date().toISOString().split('T')[0];
//   const todaySales = salesData.filter(item => item.date === today && item.customer !== 'Month End Transfer');
//   const todayPurchases = purchaseData.filter(item => item.date === today && item.supplier !== 'Monthly Transfer');
  
//   const todaySalesTotal = todaySales.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
//   const todayPurchasesTotal = todayPurchases.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

//   // --- CALCULATIONS ---
//   const totalSales = filteredSales.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
//   const totalPurchases = filteredPurchases.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
//   const profit = totalSales - totalPurchases;

//   // --- EXPORT FUNCTIONS (NATIVE) ---

//   const handlePrint = () => {
//     window.print();
//   };

//   const exportToCSV = () => {
//     // 1. Create Headers
//     const headers = ["Date", "Type", "Detail", "Entity", "Weight", "Rate", "Amount"];
    
//     // 2. Format Sales Data
//     const salesRows = filteredSales.map(item => [
//       item.date,
//       parseFloat(item.weight) < 0 ? 'Return' : 'Sale',
//       `"${item.description}"`, // Quote strings to handle commas
//       `"${item.customer}"`,
//       item.weight,
//       item.rate,
//       item.amount
//     ]);

//     // 3. Format Purchase Data
//     const purchaseRows = filteredPurchases.map(item => [
//       item.date,
//       parseFloat(item.weight) === 0 ? 'Expense' : 'Stock In',
//       `"${item.description}"`,
//       `"${item.supplier}"`,
//       item.weight,
//       item.rate,
//       item.amount
//     ]);

//     // 4. Combine
//     const csvContent = [
//       ["--- SALES REPORT ---"],
//       headers,
//       ...salesRows,
//       [""], // Empty line
//       ["--- PURCHASES REPORT ---"],
//       headers,
//       ...purchaseRows,
//       [""],
//       ["--- SUMMARY ---"],
//       ["Metric", "Value"],
//       ["Start Date", dateRange.start],
//       ["End Date", dateRange.end],
//       ["Total Sales", totalSales],
//       ["Total Out", totalPurchases],
//       ["Net Profit", profit]
//     ]
//     .map(e => e.join(","))
//     .join("\n");

//     // 5. Download
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", `Mall_Report_${dateRange.start}_to_${dateRange.end}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // --- HANDLERS ---

//   const handleSaleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const val = type === 'checkbox' ? checked : value;
    
//     const newForm = { ...saleForm, [name]: val };
    
//     if (name === "weight" || name === "rate") {
//       const weight = name === "weight" ? value : saleForm.weight;
//       const rate = name === "rate" ? value : saleForm.rate;
//       newForm.amount = weight && rate ? (parseFloat(weight) * parseFloat(rate)).toFixed(0) : "";
//     }
    
//     setSaleForm(newForm);
//   };

//   const handlePurchaseChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const val = type === 'checkbox' ? checked : value;
    
//     let newForm = { ...purchaseForm, [name]: val };

//     if (name === 'is_expense' && val === true) {
//       newForm.weight = "0";
//       newForm.rate = "1";
//     }
    
//     if (name === "weight" || name === "rate" || name === "amount") {
//       if (!newForm.is_expense) {
//         const weight = name === "weight" ? value : purchaseForm.weight;
//         const rate = name === "rate" ? value : purchaseForm.rate;
//         newForm.amount = weight && rate ? (parseFloat(weight) * parseFloat(rate)).toFixed(0) : "";
//       } else if (name === "amount") {
//          newForm.amount = value;
//       }
//     }
    
//     setPurchaseForm(newForm);
//   };

//   const addSale = async () => {
//     if (!saleForm.date || !saleForm.detail || !saleForm.customer) {
//       showNotification("Please fill Date, Detail and Customer!", "error");
//       return;
//     }
//     if (!saleForm.is_return && (!saleForm.weight || !saleForm.rate)) {
//        showNotification("Please fill Weight and Rate for sales!", "error");
//        return;
//     }

//     const payload = {
//       date: saleForm.date,
//       description: saleForm.detail,
//       weight: saleForm.weight || 0,
//       rate: saleForm.rate || 0,
//       purchase_rate: 0,
//       amount: saleForm.amount,
//       customer: saleForm.customer,
//       is_return: saleForm.is_return
//     };

//     const method = editingSale ? "PUT" : "POST";
//     const url = editingSale 
//       ? `${API_URL}/stock/stock-out/${editingSale}` 
//       : `${API_URL}/stock/stock-out`;

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });
      
//       const result = await res.json();
//       if (!res.ok) throw new Error(result.error);

//       await Promise.all([fetchSales(), fetchStockData()]);
//       setSaleForm({
//         date: new Date().toISOString().split('T')[0],
//         detail: "",
//         weight: "",
//         rate: "",
//         amount: "",
//         customer: "",
//         is_return: false
//       });
//       setEditingSale(null);
//       showNotification(editingSale ? "Entry updated successfully" : "Entry added successfully", "success");
//     } catch (error) {
//       showNotification(error.message, "error");
//     }
//   };

//   const addPurchase = async () => {
//     if (!purchaseForm.date || !purchaseForm.detail || !purchaseForm.amount) {
//       showNotification("Please fill Date, Detail and Amount!", "error");
//       return;
//     }
//     if (!purchaseForm.is_expense && !purchaseForm.supplier) {
//         showNotification("Please select a Supplier for stock purchases!", "error");
//         return;
//     }

//     const payload = {
//       date: purchaseForm.date,
//       description: purchaseForm.detail,
//       weight: purchaseForm.weight || 0,
//       rate: purchaseForm.rate || 1,
//       amount: purchaseForm.amount,
//       supplier: purchaseForm.supplier || "General Expense",
//       is_expense: purchaseForm.is_expense
//     };

//     const method = editingPurchase ? "PUT" : "POST";
//     const url = editingPurchase 
//       ? `${API_URL}/stock/stock-in/${editingPurchase}` 
//       : `${API_URL}/stock/stock-in`;

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });
      
//       const result = await res.json();
//       if (!res.ok) throw new Error(result.error);

//       await Promise.all([fetchPurchases(), fetchStockData()]);
//       setPurchaseForm({
//         date: new Date().toISOString().split('T')[0],
//         detail: "",
//         weight: "",
//         rate: "",
//         amount: "",
//         supplier: "",
//         is_expense: false
//       });
//       setEditingPurchase(null);
//       showNotification(editingPurchase ? "Entry updated successfully" : "Entry added successfully", "success");
//     } catch (error) {
//       showNotification(error.message, "error");
//     }
//   };

//   const deleteSale = async (id) => {
//     if (!confirm("Are you sure you want to delete this entry?")) return;
//     try {
//       await fetch(`${API_URL}/stock/stock-out/${id}`, { method: "DELETE" });
//       await Promise.all([fetchSales(), fetchStockData()]);
//       showNotification("Entry deleted successfully", "success");
//     } catch (error) {
//       console.error(error);
//       showNotification("Failed to delete entry", "error");
//     }
//   };

//   const deletePurchase = async (id) => {
//     if (!confirm("Are you sure you want to delete this entry?")) return;
//     try {
//       await fetch(`${API_URL}/stock/stock-in/${id}`, { method: "DELETE" });
//       await Promise.all([fetchPurchases(), fetchStockData()]);
//       showNotification("Entry deleted successfully", "success");
//     } catch (error) {
//       console.error(error);
//       showNotification("Failed to delete entry", "error");
//     }
//   };

//   const editSale = (item) => {
//     const isReturn = parseFloat(item.weight) < 0;
//     setSaleForm({
//       date: item.date,
//       detail: item.description,
//       weight: Math.abs(item.weight),
//       rate: item.rate,
//       amount: Math.abs(item.amount),
//       customer: item.customer,
//       is_return: isReturn
//     });
//     setEditingSale(item.id);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const editPurchase = (item) => {
//     const isExpense = parseFloat(item.weight) === 0;
//     setPurchaseForm({
//       date: item.date,
//       detail: item.description,
//       weight: item.weight,
//       rate: item.rate,
//       amount: item.amount,
//       supplier: item.supplier,
//       is_expense: isExpense
//     });
//     setEditingPurchase(item.id);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden print:overflow-visible print:bg-white print:p-0">
      
//       {/* Print Styles */}
//       <style>{`
//         @media print {
//           .no-print { display: none !important; }
//           .print-only { display: block !important; }
//           body { background: white; -webkit-print-color-adjust: exact; }
//           .shadow-xl, .shadow-lg { shadow: none !important; box-shadow: none !important; }
//         }
//       `}</style>

//       {/* Background Ambient Glows (Hidden in Print) */}
//       <div className="no-print absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
//       <div className="no-print absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

//       {/* Stock Modal (Hidden in Print) */}
//       {showStockModal && (
//         <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col animate-scale-in">
//             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
//               <h2 className="text-xl font-bold flex items-center gap-2">
//                 <Package className="text-blue-600" /> Stock Remaining Calculation
//               </h2>
//               <button onClick={() => setShowStockModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="overflow-y-auto p-6">
//               <table className="w-full text-sm text-left">
//                 <thead className="text-xs text-slate-500 uppercase bg-slate-50">
//                   <tr>
//                     <th className="px-4 py-3">Category / Item</th>
//                     <th className="px-4 py-3 text-right">Total In</th>
//                     <th className="px-4 py-3 text-right">Total Out</th>
//                     <th className="px-4 py-3 text-right">Remaining</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {stockData.map((stock, index) => (
//                     <tr key={index} className="hover:bg-slate-50">
//                       <td className="px-4 py-3 font-medium text-slate-700">{stock.name}</td>
//                       <td className="px-4 py-3 text-right text-emerald-600 font-medium">{stock.stockIn.toLocaleString()} kg</td>
//                       <td className="px-4 py-3 text-right text-orange-600 font-medium">{stock.stockOut.toLocaleString()} kg</td>
//                       <td className={`px-4 py-3 text-right font-bold ${stock.currentStock < 10 ? 'text-rose-600' : 'text-blue-600'}`}>
//                         {stock.currentStock.toLocaleString()} kg
//                       </td>
//                     </tr>
//                   ))}
//                   {stockData.length === 0 && (
//                     <tr><td colSpan="4" className="text-center py-4 text-slate-400">No stock data available</td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
//                <button onClick={() => setShowStockModal(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">Close</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Notification Toast */}
//       {notification && (
//         <div className={`no-print fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${
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

//       <div className="max-w-7xl mx-auto relative z-10">
        
//         {/* Header Section */}
//         <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
//               <span className="no-print p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
//                 <FileText size={24} />
//               </span>
//               Mall Management
//             </h1>
//             <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">
//               Sales, Inventory & Expense Tracker
//             </p>
//           </div>

//           {/* Controls: Search, Date Range, Exports */}
//           <div className="no-print flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            
//             {/* Search */}
//             <div className="relative group flex-1 md:w-64">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
//               <input 
//                 type="text" 
//                 placeholder="Search detail, client..." 
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
//               />
//             </div>

//             {/* Date Range */}
//             <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
//               <input 
//                 type="date" 
//                 value={dateRange.start}
//                 onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
//                 className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 outline-none px-2"
//               />
//               <span className="text-slate-300">to</span>
//               <input 
//                 type="date" 
//                 value={dateRange.end}
//                 onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
//                 className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 outline-none px-2"
//               />
//             </div>

//             {/* Actions */}
//             <div className="flex gap-2">
//                <button onClick={() => setShowStockModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm text-xs font-bold whitespace-nowrap">
//                  <Package size={16} /> Stock Check
//                </button>
//                <button onClick={handlePrint} className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors shadow-sm" title="Print / Save PDF">
//                  <Printer size={18} />
//                </button>
//                <button onClick={exportToCSV} className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm" title="Export CSV/Excel">
//                  <FileSpreadsheet size={18} />
//                </button>
//             </div>
//           </div>
//         </div>

//         {/* Daily Summary Card (Hidden in Print) */}
//         <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//            <div className="md:col-span-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-1 relative overflow-hidden shadow-xl">
//               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
//               <div className="bg-slate-900/50 backdrop-blur-sm rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
//                  <div className="flex items-center gap-4">
//                     <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
//                        <Clock size={24} />
//                     </div>
//                     <div>
//                        <h3 className="text-white font-bold text-lg">Daily Summary</h3>
//                        <p className="text-slate-400 text-xs">{new Date().toDateString()}</p>
//                     </div>
//                  </div>
//                  <div className="flex gap-8 text-right">
//                     <div>
//                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Today's Sales</p>
//                        <p className="text-emerald-400 font-bold text-xl">Rs. {todaySalesTotal.toLocaleString()}</p>
//                     </div>
//                     <div>
//                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Today's Exp</p>
//                        <p className="text-orange-400 font-bold text-xl">Rs. {todayPurchasesTotal.toLocaleString()}</p>
//                     </div>
//                     <div>
//                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Today's Profit</p>
//                        <p className="text-white font-bold text-xl">Rs. {(todaySalesTotal - todayPurchasesTotal).toLocaleString()}</p>
//                     </div>
//                  </div>
//               </div>
//            </div>
//         </div>

//         {/* Period Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4">
//           <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between print:border-slate-300">
//             <div>
//               <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Period Sales</p>
//               <p className="text-2xl font-extrabold text-emerald-700">Rs. {totalSales.toLocaleString()}</p>
//             </div>
//             <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 no-print">
//               <TrendingUp size={24} />
//             </div>
//           </div>

//           <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between print:border-slate-300">
//             <div>
//               <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">Period Out</p>
//               <p className="text-2xl font-extrabold text-orange-700">Rs. {totalPurchases.toLocaleString()}</p>
//             </div>
//             <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 no-print">
//               <TrendingDown size={24} />
//             </div>
//           </div>

//           <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between print:border-slate-300">
//              <div>
//               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Period Profit</p>
//               <p className={`text-2xl font-extrabold ${profit >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>Rs. {profit.toLocaleString()}</p>
//             </div>
//             <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 no-print">
//               <Banknote size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Side by Side Forms (Hidden in Print) */}
//         <div className="no-print grid lg:grid-cols-2 gap-8 mb-10 items-stretch">
          
//           {/* Sale Form (Green) */}
//           <div className={`flex flex-col h-full bg-white border ${saleForm.is_return ? 'border-rose-100' : 'border-slate-100'} rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 transition-colors relative`}>
//             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${saleForm.is_return ? 'from-rose-500 to-red-500' : 'from-emerald-500 to-teal-500'}`}></div>
//             <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <div className={`p-2 rounded-xl ${saleForm.is_return ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
//                   {saleForm.is_return ? <RotateCcw size={20} /> : <TrendingUp size={20} />}
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-800">{editingSale ? "Edit Entry" : saleForm.is_return ? "Record Return" : "New Sale"}</h3>
//               </div>
              
//               <div className="flex bg-slate-200/50 p-1 rounded-xl">
//                   <button 
//                     onClick={() => setSaleForm(p => ({...p, is_return: false}))}
//                     className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${!saleForm.is_return ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//                   >
//                     Sale
//                   </button>
//                   <button 
//                     onClick={() => setSaleForm(p => ({...p, is_return: true}))}
//                     className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${saleForm.is_return ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//                   >
//                     Return
//                   </button>
//               </div>
//             </div>
            
//             <div className="p-6 flex flex-col flex-1 gap-4">
//               <div className="space-y-4 flex-1">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
//                       <input
//                         type="date"
//                         name="date"
//                         value={saleForm.date}
//                         onChange={handleSaleChange}
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Detail</label>
//                       <input
//                         type="text"
//                         name="detail"
//                         value={saleForm.detail}
//                         onChange={handleSaleChange}
//                         placeholder="Product..."
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Customer</label>
//                     <input
//                       type="text"
//                       name="customer"
//                       value={saleForm.customer}
//                       onChange={handleSaleChange}
//                       placeholder="Search customer..."
//                       list="customer-list"
//                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
//                     />
//                     <datalist id="customer-list">
//                       {customers.map(c => <option key={c.id} value={c.name} />)}
//                     </datalist>
//                   </div>
//                   <div className="grid grid-cols-3 gap-3">
//                     <div>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Weight</label>
//                       <input
//                         type="number"
//                         name="weight"
//                         value={saleForm.weight}
//                         onChange={handleSaleChange}
//                         placeholder="0"
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none text-right font-medium"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rate</label>
//                       <input
//                         type="number"
//                         name="rate"
//                         value={saleForm.rate}
//                         onChange={handleSaleChange}
//                         placeholder="0"
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none text-right font-medium"
//                       />
//                     </div>
//                     <div>
//                       <label className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 block ${saleForm.is_return ? 'text-rose-600' : 'text-emerald-600'}`}>
//                         {saleForm.is_return ? 'Refund Amt' : 'Amount'}
//                       </label>
//                       <input
//                         type="number"
//                         name="amount"
//                         value={saleForm.amount}
//                         readOnly
//                         className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold text-right outline-none cursor-default ${saleForm.is_return ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
//                       />
//                     </div>
//                   </div>
//               </div>
//               <button
//                 onClick={addSale}
//                 disabled={loading}
//                 className={`w-full text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all mt-auto flex items-center justify-center gap-2 ${saleForm.is_return ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-200' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-200'}`}
//               >
//                 {editingSale ? "Update" : <Plus size={16} />} 
//                 {editingSale ? " Update Entry" : saleForm.is_return ? " Record Return" : " Add Sale"}
//               </button>
//             </div>
//           </div>

//           {/* Purchase Form (Orange) */}
//           <div className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 relative">
//             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${purchaseForm.is_expense ? 'from-purple-500 to-indigo-500' : 'from-orange-500 to-red-500'}`}></div>
//             <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <div className={`p-2 rounded-xl ${purchaseForm.is_expense ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
//                   {purchaseForm.is_expense ? <Receipt size={20} /> : <TrendingDown size={20} />}
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-800">{editingPurchase ? "Edit Entry" : purchaseForm.is_expense ? "New Expense" : "New Purchase"}</h3>
//               </div>

//                <div className="flex bg-slate-200/50 p-1 rounded-xl">
//                  <button 
//                     onClick={() => setPurchaseForm(p => ({...p, is_expense: false}))}
//                     className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${!purchaseForm.is_expense ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//                   >
//                     Stock
//                   </button>
//                   <button 
//                     onClick={() => setPurchaseForm(p => ({...p, is_expense: true}))}
//                     className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${purchaseForm.is_expense ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//                   >
//                     Expense
//                   </button>
//               </div>
//             </div>
            
//             <div className="p-6 flex flex-col flex-1 gap-4">
//               <div className="space-y-4 flex-1">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
//                       <input
//                         type="date"
//                         name="date"
//                         value={purchaseForm.date}
//                         onChange={handlePurchaseChange}
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Detail</label>
//                       <input
//                         type="text"
//                         name="detail"
//                         value={purchaseForm.detail}
//                         onChange={handlePurchaseChange}
//                         placeholder={purchaseForm.is_expense ? "Rent, Electricity..." : "Product..."}
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
//                       />
//                     </div>
//                   </div>
                  
//                   {!purchaseForm.is_expense && (
//                     <div>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Supplier</label>
//                       <input
//                         type="text"
//                         name="supplier"
//                         value={purchaseForm.supplier}
//                         onChange={handlePurchaseChange}
//                         placeholder="Search supplier..."
//                         list="supplier-list"
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
//                       />
//                       <datalist id="supplier-list">
//                         {suppliers.map(s => <option key={s.id} value={s.name} />)}
//                       </datalist>
//                     </div>
//                   )}

//                   <div className="grid grid-cols-3 gap-3">
//                     <div className={purchaseForm.is_expense ? 'opacity-50 pointer-events-none' : ''}>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Weight</label>
//                       <input
//                         type="number"
//                         name="weight"
//                         value={purchaseForm.weight}
//                         onChange={handlePurchaseChange}
//                         placeholder="0"
//                         disabled={purchaseForm.is_expense}
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none text-right font-medium"
//                       />
//                     </div>
//                     <div className={purchaseForm.is_expense ? 'opacity-50 pointer-events-none' : ''}>
//                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rate</label>
//                       <input
//                         type="number"
//                         name="rate"
//                         value={purchaseForm.rate}
//                         onChange={handlePurchaseChange}
//                         placeholder="0"
//                         disabled={purchaseForm.is_expense}
//                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none text-right font-medium"
//                       />
//                     </div>
//                     <div>
//                       <label className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 block ${purchaseForm.is_expense ? 'text-purple-600' : 'text-orange-600'}`}>Amount</label>
//                       <input
//                         type="number"
//                         name="amount"
//                         value={purchaseForm.amount}
//                         onChange={purchaseForm.is_expense ? handlePurchaseChange : undefined}
//                         readOnly={!purchaseForm.is_expense}
//                         className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold text-right outline-none ${purchaseForm.is_expense ? 'bg-purple-50 border-purple-100 text-purple-700 cursor-text' : 'bg-orange-50 border-orange-100 text-orange-700 cursor-default'}`}
//                       />
//                     </div>
//                   </div>
//               </div>
//               <button
//                 onClick={addPurchase}
//                 disabled={loading}
//                 className={`w-full text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all mt-auto flex items-center justify-center gap-2 ${purchaseForm.is_expense ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-200' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-200'}`}
//               >
//                 {editingPurchase ? "Update" : <Plus size={16} />} 
//                 {editingPurchase ? " Update Entry" : purchaseForm.is_expense ? " Add Expense" : " Add Purchase"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Sales Table */}
//         <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden mb-8 print:shadow-none print:border-slate-300">
//           <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center print:bg-white">
//             <h3 className="font-bold text-slate-800 flex items-center gap-2">
//               <TrendingUp size={18} className="text-emerald-600" /> 
//               Sales & Returns
//             </h3>
//             <span className="text-xs text-slate-500 font-medium">
//                {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
//             </span>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left">
//               <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100 print:bg-white print:text-black">
//                 <tr>
//                   <th className="px-6 py-4">Date</th>
//                   <th className="px-6 py-4">Detail</th>
//                   <th className="px-6 py-4">Customer</th>
//                   <th className="px-6 py-4 text-right">Weight</th>
//                   <th className="px-6 py-4 text-right">Rate</th>
//                   <th className="px-6 py-4 text-right">Amount</th>
//                   <th className="px-6 py-4 text-center no-print">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50 print:divide-slate-200">
//                 {filteredSales.map((item) => {
//                   const isReturn = parseFloat(item.weight) < 0;
//                   return (
//                     <tr key={item.id} className={`transition-colors group ${isReturn ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-emerald-50/30'} print:bg-white`}>
//                       <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{item.date}</td>
//                       <td className="px-6 py-4 font-medium text-slate-800">
//                         {isReturn && <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded mr-2 font-bold uppercase no-print"><RotateCcw size={10} /> Return</span>}
//                         {isReturn && <span className="print-only hidden font-bold text-rose-600 text-xs uppercase">[RETURN] </span>}
//                         {item.description}
//                       </td>
//                       <td className="px-6 py-4 text-slate-600">{item.customer}</td>
//                       <td className="px-6 py-4 text-right text-slate-600">{Math.abs(item.weight)}</td>
//                       <td className="px-6 py-4 text-right text-slate-600">{item.rate}</td>
//                       <td className={`px-6 py-4 text-right font-bold ${isReturn ? 'text-rose-600' : 'text-emerald-600'}`}>
//                         {isReturn ? '-' : ''}Rs. {Math.abs(item.amount).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 text-center no-print">
//                         <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <button onClick={() => editSale(item)} className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
//                           <button onClick={() => deleteSale(item.id)} className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })}
//                 {filteredSales.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No records found for this period</td></tr>}
//               </tbody>
//               <tfoot className="bg-slate-50 font-bold border-t border-slate-200 print:bg-white print:border-slate-300">
//                 <tr>
//                   <td colSpan="5" className="px-6 py-4 text-right text-slate-600 uppercase text-xs tracking-wider">Net Sales</td>
//                   <td className="px-6 py-4 text-right text-emerald-700">Rs. {totalSales.toLocaleString()}</td>
//                   <td className="no-print"></td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>

//         {/* Purchase Table */}
//         <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border-slate-300">
//           <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center print:bg-white">
//             <h3 className="font-bold text-slate-800 flex items-center gap-2">
//               <TrendingDown size={18} className="text-orange-600" /> 
//               Purchases & Expenses
//             </h3>
//             <span className="text-xs text-slate-500 font-medium">
//                {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
//             </span>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left">
//               <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100 print:bg-white print:text-black">
//                 <tr>
//                   <th className="px-6 py-4">Date</th>
//                   <th className="px-6 py-4">Detail</th>
//                   <th className="px-6 py-4">Supplier/Type</th>
//                   <th className="px-6 py-4 text-right">Weight</th>
//                   <th className="px-6 py-4 text-right">Rate</th>
//                   <th className="px-6 py-4 text-right">Amount</th>
//                   <th className="px-6 py-4 text-center no-print">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50 print:divide-slate-200">
//                 {filteredPurchases.map((item) => {
//                    const isExpense = parseFloat(item.weight) === 0;
//                    return (
//                     <tr key={item.id} className={`transition-colors group ${isExpense ? 'bg-purple-50/50 hover:bg-purple-50' : 'hover:bg-orange-50/30'} print:bg-white`}>
//                       <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{item.date}</td>
//                       <td className="px-6 py-4 font-medium text-slate-800">
//                           {isExpense && <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mr-2 font-bold uppercase no-print"><Receipt size={10} /> Exp</span>}
//                           {isExpense && <span className="print-only hidden font-bold text-purple-600 text-xs uppercase">[EXP] </span>}
//                           {item.description}
//                       </td>
//                       <td className="px-6 py-4 text-slate-600">{item.supplier}</td>
//                       <td className="px-6 py-4 text-right text-slate-600">{isExpense ? '-' : item.weight}</td>
//                       <td className="px-6 py-4 text-right text-slate-600">{isExpense ? '-' : item.rate}</td>
//                       <td className={`px-6 py-4 text-right font-bold ${isExpense ? 'text-purple-600' : 'text-orange-600'}`}>
//                         Rs. {parseFloat(item.amount).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 text-center no-print">
//                         <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <button onClick={() => editPurchase(item)} className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
//                           <button onClick={() => deletePurchase(item.id)} className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })}
//                 {filteredPurchases.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No records found for this period</td></tr>}
//               </tbody>
//               <tfoot className="bg-slate-50 font-bold border-t border-slate-200 print:bg-white print:border-slate-300">
//                 <tr>
//                   <td colSpan="5" className="px-6 py-4 text-right text-slate-600 uppercase text-xs tracking-wider">Total (Stock + Exp)</td>
//                   <td className="px-6 py-4 text-right text-orange-700">Rs. {totalPurchases.toLocaleString()}</td>
//                   <td className="no-print"></td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit2, 
  Trash2, 
  Banknote, 
  Calendar, 
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  RotateCcw, 
  Receipt,
  Search,
  Download,
  FileSpreadsheet,
  Package,
  Clock,
  Printer
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function MallManagementPage() {
  // --- STATE ---
  // Date Range State (Defaults to current month start and end)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return { start: firstDay, end: lastDay };
  });

  const [searchTerm, setSearchTerm] = useState("");
  
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]); // Raw categories list
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);

  // Forms
  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().split('T')[0],
    detail: "",
    weight: "",
    rate: "",
    amount: "",
    customer: "",
    is_return: false
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    detail: "",
    weight: "",
    rate: "",
    amount: "",
    supplier: "",
    is_expense: false
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

  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  // --- CALCULATE STOCK SUMMARY LOCALLY ---
  const stockSummary = useMemo(() => {
    return categories.map(cat => {
      const catName = cat.name.toLowerCase().trim();

      // Calculate Stock In (Purchases + Transfers In)
      // Exclude General Expenses (weight 0)
      const totalIn = purchaseData
        .filter(p => p.description && p.description.toLowerCase().trim() === catName)
        .reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

      // Calculate Stock Out (Sales + Transfers Out)
      // Includes Returns (which are negative weight in stock-out, effectively adding to stock)
      // Note: If you want Returns to ADD to stock, and Sales to SUBTRACT:
      // Current Stock = Total In - Total Out
      // If a Return has negative weight in Stock Out table, subtracting a negative adds it back. 
      // e.g. Sale 10, Return -2. Total Out = 8. Stock = In - 8. Correct.
      const totalOut = salesData
        .filter(s => s.description && s.description.toLowerCase().trim() === catName)
        .reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

      return {
        name: cat.name,
        stockIn: totalIn,
        stockOut: totalOut,
        currentStock: totalIn - totalOut
      };
    });
  }, [categories, purchaseData, salesData]);


  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- FILTERING LOGIC ---
  
  const isWithinDateRange = (dateStr) => {
    return dateStr >= dateRange.start && dateStr <= dateRange.end;
  };

  const matchesSearch = (item, type) => {
    const search = searchTerm.toLowerCase();
    const desc = item.description?.toLowerCase() || "";
    const entity = type === 'sale' ? (item.customer?.toLowerCase() || "") : (item.supplier?.toLowerCase() || "");
    return desc.includes(search) || entity.includes(search);
  };

  // Filtered Lists
  const filteredSales = salesData.filter(item => {
    return isWithinDateRange(item.date) && 
           matchesSearch(item, 'sale') && 
           item.customer !== 'Month End Transfer';
  });

  const filteredPurchases = purchaseData.filter(item => {
    return isWithinDateRange(item.date) && 
           matchesSearch(item, 'purchase') && 
           item.supplier !== 'Monthly Transfer';
  });

  // Daily Summary Logic
  const today = new Date().toISOString().split('T')[0];
  const todaySales = salesData.filter(item => item.date === today && item.customer !== 'Month End Transfer');
  const todayPurchases = purchaseData.filter(item => item.date === today && item.supplier !== 'Monthly Transfer');
  
  const todaySalesTotal = todaySales.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const todayPurchasesTotal = todayPurchases.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  // --- CALCULATIONS ---
  const totalSales = filteredSales.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalPurchases = filteredPurchases.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const profit = totalSales - totalPurchases;

  // --- EXPORT FUNCTIONS (NATIVE) ---

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    // 1. Create Headers
    const headers = ["Date", "Type", "Detail", "Entity", "Weight", "Rate", "Amount"];
    
    // 2. Format Sales Data
    const salesRows = filteredSales.map(item => [
      item.date,
      parseFloat(item.weight) < 0 ? 'Return' : 'Sale',
      `"${item.description}"`, // Quote strings to handle commas
      `"${item.customer}"`,
      item.weight,
      item.rate,
      item.amount
    ]);

    // 3. Format Purchase Data
    const purchaseRows = filteredPurchases.map(item => [
      item.date,
      parseFloat(item.weight) === 0 ? 'Expense' : 'Stock In',
      `"${item.description}"`,
      `"${item.supplier}"`,
      item.weight,
      item.rate,
      item.amount
    ]);

    // 4. Combine
    const csvContent = [
      ["--- SALES REPORT ---"],
      headers,
      ...salesRows,
      [""], // Empty line
      ["--- PURCHASES REPORT ---"],
      headers,
      ...purchaseRows,
      [""],
      ["--- SUMMARY ---"],
      ["Metric", "Value"],
      ["Start Date", dateRange.start],
      ["End Date", dateRange.end],
      ["Total Sales", totalSales],
      ["Total Out", totalPurchases],
      ["Net Profit", profit]
    ]
    .map(e => e.join(","))
    .join("\n");

    // 5. Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Mall_Report_${dateRange.start}_to_${dateRange.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- HANDLERS ---

  const handleSaleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    const newForm = { ...saleForm, [name]: val };
    
    if (name === "weight" || name === "rate") {
      const weight = name === "weight" ? value : saleForm.weight;
      const rate = name === "rate" ? value : saleForm.rate;
      newForm.amount = weight && rate ? (parseFloat(weight) * parseFloat(rate)).toFixed(0) : "";
    }
    
    setSaleForm(newForm);
  };

  const handlePurchaseChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    let newForm = { ...purchaseForm, [name]: val };

    if (name === 'is_expense' && val === true) {
      newForm.weight = "0";
      newForm.rate = "1";
    }
    
    if (name === "weight" || name === "rate" || name === "amount") {
      if (!newForm.is_expense) {
        const weight = name === "weight" ? value : purchaseForm.weight;
        const rate = name === "rate" ? value : purchaseForm.rate;
        newForm.amount = weight && rate ? (parseFloat(weight) * parseFloat(rate)).toFixed(0) : "";
      } else if (name === "amount") {
         newForm.amount = value;
      }
    }
    
    setPurchaseForm(newForm);
  };

  const addSale = async () => {
    if (!saleForm.date || !saleForm.detail || !saleForm.customer) {
      showNotification("Please fill Date, Detail and Customer!", "error");
      return;
    }
    if (!saleForm.is_return && (!saleForm.weight || !saleForm.rate)) {
       showNotification("Please fill Weight and Rate for sales!", "error");
       return;
    }

    const payload = {
      date: saleForm.date,
      description: saleForm.detail,
      weight: saleForm.weight || 0,
      rate: saleForm.rate || 0,
      purchase_rate: 0,
      amount: saleForm.amount,
      customer: saleForm.customer,
      is_return: saleForm.is_return
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

      await Promise.all([fetchSales(), fetchCategories()]);
      setSaleForm({
        date: new Date().toISOString().split('T')[0],
        detail: "",
        weight: "",
        rate: "",
        amount: "",
        customer: "",
        is_return: false
      });
      setEditingSale(null);
      showNotification(editingSale ? "Entry updated successfully" : "Entry added successfully", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const addPurchase = async () => {
    if (!purchaseForm.date || !purchaseForm.detail || !purchaseForm.amount) {
      showNotification("Please fill Date, Detail and Amount!", "error");
      return;
    }
    if (!purchaseForm.is_expense && !purchaseForm.supplier) {
        showNotification("Please select a Supplier for stock purchases!", "error");
        return;
    }

    const payload = {
      date: purchaseForm.date,
      description: purchaseForm.detail,
      weight: purchaseForm.weight || 0,
      rate: purchaseForm.rate || 1,
      amount: purchaseForm.amount,
      supplier: purchaseForm.supplier || "General Expense",
      is_expense: purchaseForm.is_expense
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

      await Promise.all([fetchPurchases(), fetchCategories()]);
      setPurchaseForm({
        date: new Date().toISOString().split('T')[0],
        detail: "",
        weight: "",
        rate: "",
        amount: "",
        supplier: "",
        is_expense: false
      });
      setEditingPurchase(null);
      showNotification(editingPurchase ? "Entry updated successfully" : "Entry added successfully", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const deleteSale = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await fetch(`${API_URL}/stock/stock-out/${id}`, { method: "DELETE" });
      await Promise.all([fetchSales(), fetchCategories()]);
      showNotification("Entry deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to delete entry", "error");
    }
  };

  const deletePurchase = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await fetch(`${API_URL}/stock/stock-in/${id}`, { method: "DELETE" });
      await Promise.all([fetchPurchases(), fetchCategories()]);
      showNotification("Entry deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to delete entry", "error");
    }
  };

  const editSale = (item) => {
    const isReturn = parseFloat(item.weight) < 0;
    setSaleForm({
      date: item.date,
      detail: item.description,
      weight: Math.abs(item.weight),
      rate: item.rate,
      amount: Math.abs(item.amount),
      customer: item.customer,
      is_return: isReturn
    });
    setEditingSale(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editPurchase = (item) => {
    const isExpense = parseFloat(item.weight) === 0;
    setPurchaseForm({
      date: item.date,
      detail: item.description,
      weight: item.weight,
      rate: item.rate,
      amount: item.amount,
      supplier: item.supplier,
      is_expense: isExpense
    });
    setEditingPurchase(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden print:overflow-visible print:bg-white print:p-0">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .shadow-xl, .shadow-lg { shadow: none !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Background Ambient Glows (Hidden in Print) */}
      <div className="no-print absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="no-print absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Stock Modal (Hidden in Print) */}
      {showStockModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="text-blue-600" /> Stock Remaining Calculation
              </h2>
              <button onClick={() => setShowStockModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Category / Item</th>
                    <th className="px-4 py-3 text-right">Total In</th>
                    <th className="px-4 py-3 text-right">Total Out</th>
                    <th className="px-4 py-3 text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockSummary.map((stock, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{stock.name}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">{(stock.stockIn || 0).toLocaleString()} kg</td>
                      <td className="px-4 py-3 text-right text-orange-600 font-medium">{(stock.stockOut || 0).toLocaleString()} kg</td>
                      <td className={`px-4 py-3 text-right font-bold ${stock.currentStock < 10 ? 'text-rose-600' : 'text-blue-600'}`}>
                        {(stock.currentStock || 0).toLocaleString()} kg
                      </td>
                    </tr>
                  ))}
                  {stockSummary.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-4 text-slate-400">No stock data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button onClick={() => setShowStockModal(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`no-print fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${
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
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="no-print p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                <FileText size={24} />
              </span>
              Mall Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">
              Sales, Inventory & Expense Tracker
            </p>
          </div>

          {/* Controls: Search, Date Range, Exports */}
          <div className="no-print flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            
            {/* Search */}
            <div className="relative group flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search detail, client..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 outline-none px-2"
              />
              <span className="text-slate-300">to</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 outline-none px-2"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
               <button onClick={() => setShowStockModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm text-xs font-bold whitespace-nowrap">
                 <Package size={16} /> Stock Check
               </button>
               <button onClick={handlePrint} className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors shadow-sm" title="Print / Save PDF">
                 <Printer size={18} />
               </button>
               <button onClick={exportToCSV} className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm" title="Export CSV/Excel">
                 <FileSpreadsheet size={18} />
               </button>
            </div>
          </div>
        </div>

        {/* Daily Summary Card (Hidden in Print) */}
        <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
           <div className="md:col-span-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-1 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                       <Clock size={24} />
                    </div>
                    <div>
                       <h3 className="text-white font-bold text-lg">Daily Summary</h3>
                       <p className="text-slate-400 text-xs">{new Date().toDateString()}</p>
                    </div>
                 </div>
                 <div className="flex gap-8 text-right">
                    <div>
                       <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Today's Sales</p>
                       <p className="text-emerald-400 font-bold text-xl">Rs. {todaySalesTotal.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Today's Exp</p>
                       <p className="text-orange-400 font-bold text-xl">Rs. {todayPurchasesTotal.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Today's Profit</p>
                       <p className="text-white font-bold text-xl">Rs. {(todaySalesTotal - todayPurchasesTotal).toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Period Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between print:border-slate-300">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Period Sales</p>
              <p className="text-2xl font-extrabold text-emerald-700">Rs. {totalSales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 no-print">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between print:border-slate-300">
            <div>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">Period Out</p>
              <p className="text-2xl font-extrabold text-orange-700">Rs. {totalPurchases.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 no-print">
              <TrendingDown size={24} />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex items-center justify-between print:border-slate-300">
             <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Period Profit</p>
              <p className={`text-2xl font-extrabold ${profit >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>Rs. {profit.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 no-print">
              <Banknote size={24} />
            </div>
          </div>
        </div>

        {/* Side by Side Forms (Hidden in Print) */}
        <div className="no-print grid lg:grid-cols-2 gap-8 mb-10 items-stretch">
          
          {/* Sale Form (Green) */}
          <div className={`flex flex-col h-full bg-white border ${saleForm.is_return ? 'border-rose-100' : 'border-slate-100'} rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 transition-colors relative`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${saleForm.is_return ? 'from-rose-500 to-red-500' : 'from-emerald-500 to-teal-500'}`}></div>
            <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${saleForm.is_return ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {saleForm.is_return ? <RotateCcw size={20} /> : <TrendingUp size={20} />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{editingSale ? "Edit Entry" : saleForm.is_return ? "Record Return" : "New Sale"}</h3>
              </div>
              
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                  <button 
                    onClick={() => setSaleForm(p => ({...p, is_return: false}))}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${!saleForm.is_return ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Sale
                  </button>
                  <button 
                    onClick={() => setSaleForm(p => ({...p, is_return: true}))}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${saleForm.is_return ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Return
                  </button>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1 gap-4">
              <div className="space-y-4 flex-1">
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
                      <label className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 block ${saleForm.is_return ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {saleForm.is_return ? 'Refund Amt' : 'Amount'}
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={saleForm.amount}
                        readOnly
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold text-right outline-none cursor-default ${saleForm.is_return ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
                      />
                    </div>
                  </div>
              </div>
              <button
                onClick={addSale}
                disabled={loading}
                className={`w-full text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all mt-auto flex items-center justify-center gap-2 ${saleForm.is_return ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-200' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-200'}`}
              >
                {editingSale ? "Update" : <Plus size={16} />} 
                {editingSale ? " Update Entry" : saleForm.is_return ? " Record Return" : " Add Sale"}
              </button>
            </div>
          </div>

          {/* Purchase Form (Orange) */}
          <div className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 relative">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${purchaseForm.is_expense ? 'from-purple-500 to-indigo-500' : 'from-orange-500 to-red-500'}`}></div>
            <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${purchaseForm.is_expense ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                  {purchaseForm.is_expense ? <Receipt size={20} /> : <TrendingDown size={20} />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{editingPurchase ? "Edit Entry" : purchaseForm.is_expense ? "New Expense" : "New Purchase"}</h3>
              </div>

               <div className="flex bg-slate-200/50 p-1 rounded-xl">
                 <button 
                    onClick={() => setPurchaseForm(p => ({...p, is_expense: false}))}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${!purchaseForm.is_expense ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Stock
                  </button>
                  <button 
                    onClick={() => setPurchaseForm(p => ({...p, is_expense: true}))}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${purchaseForm.is_expense ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Expense
                  </button>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1 gap-4">
              <div className="space-y-4 flex-1">
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
                        placeholder={purchaseForm.is_expense ? "Rent, Electricity..." : "Product..."}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  {!purchaseForm.is_expense && (
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
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className={purchaseForm.is_expense ? 'opacity-50 pointer-events-none' : ''}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Weight</label>
                      <input
                        type="number"
                        name="weight"
                        value={purchaseForm.weight}
                        onChange={handlePurchaseChange}
                        placeholder="0"
                        disabled={purchaseForm.is_expense}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none text-right font-medium"
                      />
                    </div>
                    <div className={purchaseForm.is_expense ? 'opacity-50 pointer-events-none' : ''}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Rate</label>
                      <input
                        type="number"
                        name="rate"
                        value={purchaseForm.rate}
                        onChange={handlePurchaseChange}
                        placeholder="0"
                        disabled={purchaseForm.is_expense}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none text-right font-medium"
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 block ${purchaseForm.is_expense ? 'text-purple-600' : 'text-orange-600'}`}>Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={purchaseForm.amount}
                        onChange={purchaseForm.is_expense ? handlePurchaseChange : undefined}
                        readOnly={!purchaseForm.is_expense}
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold text-right outline-none ${purchaseForm.is_expense ? 'bg-purple-50 border-purple-100 text-purple-700 cursor-text' : 'bg-orange-50 border-orange-100 text-orange-700 cursor-default'}`}
                      />
                    </div>
                  </div>
              </div>
              <button
                onClick={addPurchase}
                disabled={loading}
                className={`w-full text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all mt-auto flex items-center justify-center gap-2 ${purchaseForm.is_expense ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-200' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-200'}`}
              >
                {editingPurchase ? "Update" : <Plus size={16} />} 
                {editingPurchase ? " Update Entry" : purchaseForm.is_expense ? " Add Expense" : " Add Purchase"}
              </button>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden mb-8 print:shadow-none print:border-slate-300">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center print:bg-white">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" /> 
              Sales & Returns
            </h3>
            <span className="text-xs text-slate-500 font-medium">
               {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100 print:bg-white print:text-black">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Detail</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Weight</th>
                  <th className="px-6 py-4 text-right">Rate</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 print:divide-slate-200">
                {filteredSales.map((item) => {
                  const isReturn = parseFloat(item.weight) < 0;
                  return (
                    <tr key={item.id} className={`transition-colors group ${isReturn ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-emerald-50/30'} print:bg-white`}>
                      <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {isReturn && <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded mr-2 font-bold uppercase no-print"><RotateCcw size={10} /> Return</span>}
                        {isReturn && <span className="print-only hidden font-bold text-rose-600 text-xs uppercase">[RETURN] </span>}
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.customer}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{Math.abs(item.weight)}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{item.rate}</td>
                      <td className={`px-6 py-4 text-right font-bold ${isReturn ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isReturn ? '-' : ''}Rs. {Math.abs(item.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center no-print">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editSale(item)} className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => deleteSale(item.id)} className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredSales.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No records found for this period</td></tr>}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 print:bg-white print:border-slate-300">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right text-slate-600 uppercase text-xs tracking-wider">Net Sales</td>
                  <td className="px-6 py-4 text-right text-emerald-700">Rs. {totalSales.toLocaleString()}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Purchase Table */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border-slate-300">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center print:bg-white">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingDown size={18} className="text-orange-600" /> 
              Purchases & Expenses
            </h3>
            <span className="text-xs text-slate-500 font-medium">
               {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100 print:bg-white print:text-black">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Detail</th>
                  <th className="px-6 py-4">Supplier/Type</th>
                  <th className="px-6 py-4 text-right">Weight</th>
                  <th className="px-6 py-4 text-right">Rate</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 print:divide-slate-200">
                {filteredPurchases.map((item) => {
                   const isExpense = parseFloat(item.weight) === 0;
                   return (
                    <tr key={item.id} className={`transition-colors group ${isExpense ? 'bg-purple-50/50 hover:bg-purple-50' : 'hover:bg-orange-50/30'} print:bg-white`}>
                      <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                          {isExpense && <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mr-2 font-bold uppercase no-print"><Receipt size={10} /> Exp</span>}
                          {isExpense && <span className="print-only hidden font-bold text-purple-600 text-xs uppercase">[EXP] </span>}
                          {item.description}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.supplier}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{isExpense ? '-' : item.weight}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{isExpense ? '-' : item.rate}</td>
                      <td className={`px-6 py-4 text-right font-bold ${isExpense ? 'text-purple-600' : 'text-orange-600'}`}>
                        Rs. {parseFloat(item.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center no-print">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editPurchase(item)} className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => deletePurchase(item.id)} className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredPurchases.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No records found for this period</td></tr>}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 print:bg-white print:border-slate-300">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right text-slate-600 uppercase text-xs tracking-wider">Total (Stock + Exp)</td>
                  <td className="px-6 py-4 text-right text-orange-700">Rs. {totalPurchases.toLocaleString()}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}