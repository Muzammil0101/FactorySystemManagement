// "use client";
// import { useState, useEffect } from "react";
// import {
//   Package,
//   Calendar,
//   ArrowRight,
//   RefreshCw,
//   CheckCircle,
//   AlertCircle,
//   X,
//   Lock,
//   ClipboardList,
//   Flag,
//   History,
//   CheckSquare,
//   Square
// } from "lucide-react";

// const API_URL = "http://localhost:4000/api";

// export default function MonthEndTransfer() {
//   const [categories, setCategories] = useState([]);
//   const [transferData, setTransferData] = useState([]);
//   const [notification, setNotification] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
//   const [closureChecklist, setClosureChecklist] = useState({
//     invoicesReceived: false,
//     physicalCountDone: false,
//     discrepanciesResolved: false,
//   });
//   const [checklistOpen, setChecklistOpen] = useState(true);
//   const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
//   const [closureHistory, setClosureHistory] = useState([]);

//   useEffect(() => {
//     fetchCategoriesWithStock();
//     fetchClosureHistory();
//   }, []);

//   const fetchClosureHistory = () => {
//     const history = JSON.parse(localStorage.getItem('closureHistory') || '[]');
//     setClosureHistory(history);
//   };

//   const fetchCategoriesWithStock = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/stock/categories`); // Assuming backend supports this or returns categories with stock
//       const data = await res.json();
//       // Filter for categories that actually have stock
//       const categoriesWithStock = Array.isArray(data) ? data.filter(cat => cat.currentStock > 0) : [];
//       setCategories(categoriesWithStock);
//       setTransferData(categoriesWithStock.map(cat => ({
//         description: cat.name,
//         weight: cat.currentStock,
//         rate: 0,
//         amount: 0,
//         supplier: "Opening Balance",
//         transferEnabled: false
//       })));
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       showNotification("Error loading stock data", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   const handleRateChange = (index, value) => {
//     const updated = [...transferData];
//     updated[index].rate = value;
//     updated[index].amount = (parseFloat(value || 0) * updated[index].weight).toFixed(2);
//     setTransferData(updated);
//   };

//   const toggleTransfer = (index) => {
//     const updated = [...transferData];
//     updated[index].transferEnabled = !updated[index].transferEnabled;
//     setTransferData(updated);
//   };

//   const allChecklistsComplete = () => {
//     return Object.values(closureChecklist).every(val => val === true);
//   };

//   const handleChecklistChange = (key) => {
//     setClosureChecklist(prev => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   const handleTransferAll = async () => {
//     if (!allChecklistsComplete()) {
//       showNotification("Please complete all closure checklist items first", "error");
//       return;
//     }

//     const itemsToTransfer = transferData.filter(item => item.transferEnabled && item.rate > 0);
//     if (itemsToTransfer.length === 0) {
//       showNotification("Please select items and enter opening rates", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       let successCount = 0;
//       let errorCount = 0;

//       for (const item of itemsToTransfer) {
//         try {
//           const res = await fetch(`${API_URL}/stock/stock-in`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               date: transferDate,
//               description: item.description,
//               weight: item.weight,
//               rate: item.rate,
//               amount: item.amount,
//               supplier: item.supplier,
//               isTransfer: true,
//               fromMonth: currentMonth,
//               toMonth: transferDate.slice(0, 7)
//             })
//           });

//           if (res.ok) {
//             successCount++;
//           } else {
//             errorCount++;
//           }
//         } catch (err) {
//           errorCount++;
//         }
//       }

//       if (errorCount === 0) {
//         const newClosure = {
//           month: currentMonth,
//           closureDate: new Date().toISOString().split('T')[0],
//           itemsTransferred: successCount,
//           totalWeight: itemsToTransfer.reduce((sum, item) => sum + parseFloat(item.weight), 0),
//           totalAmount: itemsToTransfer.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
//         };
//         const updated = [newClosure, ...closureHistory];
//         setClosureHistory(updated);
//         localStorage.setItem('closureHistory', JSON.stringify(updated));

//         showNotification(`Month ${currentMonth} successfully closed!`, "success");
//         setClosureChecklist({
//           invoicesReceived: false,
//           physicalCountDone: false,
//           discrepanciesResolved: false,
//         });
//         await fetchCategoriesWithStock();
//       } else {
//         showNotification(`Transferred ${successCount} items, ${errorCount} failed`, "error");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       showNotification("Error transferring stock", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalSelectedItems = transferData.filter(item => item.transferEnabled).length;
//   const totalSelectedWeight = transferData
//     .filter(item => item.transferEnabled)
//     .reduce((sum, item) => sum + parseFloat(item.weight), 0);
//   const totalSelectedAmount = transferData
//     .filter(item => item.transferEnabled)
//     .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

//   const getNextMonth = () => {
//     const [year, month] = currentMonth.split('-');
//     const date = new Date(year, parseInt(month), 1);
//     date.setMonth(date.getMonth() + 1);
//     return date.toISOString().split('T')[0].slice(0, 7);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
//       {/* Background Ambient Glows */}
//       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
//       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

//       {/* Notification Toast */}
//       {notification && (
//         <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${notification.type === "success"
//             ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//             : "bg-rose-50 text-rose-700 border-rose-200"
//           }`}>
//           {notification.type === "success" ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-rose-500" />}
//           <p className="font-bold text-sm">{notification.message}</p>
//           <button onClick={() => setNotification(null)} className="hover:bg-slate-200/50 p-1 rounded-lg transition-colors ml-2">
//             <X size={16} />
//           </button>
//         </div>
//       )}

//       {/* Header */}
//       <div className="relative z-10 mb-8">
//         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
//               <span className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 text-white">
//                 <RefreshCw size={24} />
//               </span>
//               Stock Transfer
//             </h1>
//             <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Close current month & carry forward stock</p>
//           </div>
//           <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
//             <div className="flex items-center gap-2">
//               <Lock size={16} className="text-indigo-500" />
//               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closing:</span>
//               <input
//                 type="month"
//                 value={currentMonth}
//                 onChange={(e) => setCurrentMonth(e.target.value)}
//                 className="bg-transparent text-slate-800 font-bold outline-none w-32"
//               />
//             </div>
//             <div className="w-px h-6 bg-slate-200"></div>
//             <div className="flex items-center gap-2">
//               <ArrowRight size={16} className="text-purple-500" />
//               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opening:</span>
//               <input
//                 type="date"
//                 value={transferDate}
//                 onChange={(e) => setTransferDate(e.target.value)}
//                 className="bg-transparent text-slate-800 font-bold outline-none"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="relative z-10 grid lg:grid-cols-3 gap-8">
//         {/* Left Column: Checklist & Summary */}
//         <div className="lg:col-span-1 space-y-6">
//           {/* Checklist Card */}
//           <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
//             <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100 flex justify-between items-center cursor-pointer" onClick={() => setChecklistOpen(!checklistOpen)}>
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
//                   <ClipboardList size={20} />
//                 </div>
//                 <h3 className="font-bold text-amber-900">Pre-Closure Checklist</h3>
//               </div>
//               <Flag size={18} className={`text-amber-600 transition-transform duration-300 ${checklistOpen ? 'rotate-90' : ''}`} />
//             </div>
//             {checklistOpen && (
//               <div className="p-5 space-y-3">
//                 <div
//                   onClick={() => handleChecklistChange('invoicesReceived')}
//                   className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${closureChecklist.invoicesReceived ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}
//                 >
//                   {closureChecklist.invoicesReceived ? <CheckSquare className="text-green-600" size={20} /> : <Square className="text-slate-400" size={20} />}
//                   <span className={`text-sm font-medium ${closureChecklist.invoicesReceived ? 'text-green-800' : 'text-slate-600'}`}>Invoices Verified</span>
//                 </div>

//                 <div
//                   onClick={() => handleChecklistChange('physicalCountDone')}
//                   className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${closureChecklist.physicalCountDone ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}
//                 >
//                   {closureChecklist.physicalCountDone ? <CheckSquare className="text-green-600" size={20} /> : <Square className="text-slate-400" size={20} />}
//                   <span className={`text-sm font-medium ${closureChecklist.physicalCountDone ? 'text-green-800' : 'text-slate-600'}`}>Physical Count Done</span>
//                 </div>

//                 <div
//                   onClick={() => handleChecklistChange('discrepanciesResolved')}
//                   className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${closureChecklist.discrepanciesResolved ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}
//                 >
//                   {closureChecklist.discrepanciesResolved ? <CheckSquare className="text-green-600" size={20} /> : <Square className="text-slate-400" size={20} />}
//                   <span className={`text-sm font-medium ${closureChecklist.discrepanciesResolved ? 'text-green-800' : 'text-slate-600'}`}>Discrepancies Resolved</span>
//                 </div>

//                 {allChecklistsComplete() && (
//                   <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
//                     <CheckCircle size={16} /> Ready for Transfer
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Selection Summary */}
//           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
//             <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Package size={20} /> Selection Summary</h3>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center border-b border-white/10 pb-3">
//                 <span className="text-indigo-100 text-sm">Items Selected</span>
//                 <span className="font-bold text-xl">{totalSelectedItems}</span>
//               </div>
//               <div className="flex justify-between items-center border-b border-white/10 pb-3">
//                 <span className="text-indigo-100 text-sm">Total Weight</span>
//                 <span className="font-bold text-xl">{totalSelectedWeight.toFixed(2)} <span className="text-xs font-normal opacity-70">kg</span></span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-indigo-100 text-sm">Est. Value</span>
//                 <span className="font-bold text-xl">₨{totalSelectedAmount.toFixed(0)}</span>
//               </div>
//             </div>
//             <button
//               onClick={handleTransferAll}
//               disabled={loading || totalSelectedItems === 0 || !allChecklistsComplete()}
//               className="w-full mt-6 bg-white text-indigo-700 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <><RefreshCw size={18} /> Confirm Transfer</>}
//             </button>
//           </div>

//           {/* Info Box */}
//           <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
//             <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
//               <AlertCircle size={16} /> Best Practices
//             </h4>
//             <ul className="text-xs text-blue-800 space-y-2 list-disc pl-4">
//               <li>Complete checklist before transfer.</li>
//               <li>Set transfer date 5-7 days after month end.</li>
//               <li>Verify opening rates to ensure accurate valuation.</li>
//               <li>This action records the Opening Balance for next month.</li>
//             </ul>
//           </div>

//         </div>

//         {/* Right Column: Transfer List */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Stock Items Card */}
//           <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[600px]">
//             <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
//               <div>
//                 <h3 className="font-bold text-slate-800 text-lg">Remaining Stock</h3>
//                 <p className="text-xs text-slate-500">Select items to carry forward</p>
//               </div>
//               <div className="flex gap-2 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
//                 <span className="text-slate-400">Target:</span>
//                 <span className="text-indigo-600">{getNextMonth()}</span>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 space-y-3">
//               {loading ? (
//                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
//                   <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
//                   <p>Loading inventory...</p>
//                 </div>
//               ) : categories.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
//                   <Package size={48} className="mb-4 opacity-50" />
//                   <p>No remaining stock found.</p>
//                 </div>
//               ) : (
//                 transferData.map((item, index) => (
//                   <div
//                     key={index}
//                     className={`border rounded-2xl p-4 transition-all duration-200 flex items-center gap-4 group ${item.transferEnabled
//                         ? 'border-indigo-500 bg-indigo-50/30 shadow-md'
//                         : 'border-slate-200 bg-white hover:border-indigo-200'
//                       }`}
//                   >
//                     <div className="pt-1">
//                       <input
//                         type="checkbox"
//                         checked={item.transferEnabled}
//                         onChange={() => toggleTransfer(index)}
//                         className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-offset-0 focus:ring-0 cursor-pointer"
//                       />
//                     </div>

//                     <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
//                       <div>
//                         <p className="text-xs font-bold text-slate-400 uppercase">Item</p>
//                         <p className="font-bold text-slate-800">{item.description}</p>
//                       </div>

//                       <div>
//                         <p className="text-xs font-bold text-slate-400 uppercase">Weight</p>
//                         <p className="font-bold text-indigo-600">{item.weight.toFixed(2)} kg</p>
//                       </div>

//                       <div>
//                         <p className="text-xs font-bold text-slate-400 uppercase mb-1">Opening Rate</p>
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={item.rate}
//                           onChange={(e) => handleRateChange(index, e.target.value)}
//                           disabled={!item.transferEnabled}
//                           placeholder="0.00"
//                           className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 transition-all"
//                         />
//                       </div>

//                       <div className="text-right">
//                         <p className="text-xs font-bold text-slate-400 uppercase">Value</p>
//                         <p className="font-bold text-emerald-600 text-lg">₨{parseFloat(item.amount || 0).toLocaleString()}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Closure History */}
//           <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-6">
//             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
//               <History size={20} className="text-slate-400" /> Closure History
//             </h3>
//             <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
//               {closureHistory.length > 0 ? closureHistory.slice().reverse().map((closure, idx) => (
//                 <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
//                   <div className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                     <div>
//                       <p className="font-bold text-slate-700">Month: {closure.month}</p>
//                       <p className="text-xs text-slate-500">Closed on {closure.closureDate}</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold text-slate-700">{closure.itemsTransferred} Items</p>
//                     <p className="text-xs text-slate-500">{closure.totalWeight.toFixed(2)} kg • ₨{closure.totalAmount.toLocaleString()}</p>
//                   </div>
//                 </div>
//               )) : (
//                 <p className="text-slate-400 text-sm text-center py-4 italic">No history available</p>
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

//
"use client";
import { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Lock,
  ClipboardList,
  Flag,
  History,
  CheckSquare,
  Square,
  ArrowRightCircle
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function MonthEndTransfer() {
  const [categories, setCategories] = useState([]);
  const [transferData, setTransferData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [closureChecklist, setClosureChecklist] = useState({
    invoicesReceived: false,
    physicalCountDone: false,
    discrepanciesResolved: false,
  });
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [closureHistory, setClosureHistory] = useState([]);

  useEffect(() => {
    fetchCategoriesWithStock();
    fetchClosureHistory();
  }, []);

  const fetchClosureHistory = () => {
    const history = JSON.parse(localStorage.getItem('closureHistory') || '[]');
    setClosureHistory(history);
  };

  const fetchCategoriesWithStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stock/categories`);
      const data = await res.json();
      // Filter for categories that actually have stock
      const categoriesWithStock = Array.isArray(data) ? data.filter(cat => cat.currentStock > 0) : [];
      setCategories(categoriesWithStock);
      
      setTransferData(categoriesWithStock.map(cat => ({
        description: cat.name,
        weight: cat.currentStock,
        // REAL TIME LOGIC: Transfer exact weight (No doubling)
        nextMonthWeight: cat.currentStock, 
        rate: 0,
        amount: 0,
        supplier: "Opening Balance",
        transferEnabled: false
      })));
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification("Error loading stock data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRateChange = (index, value) => {
    const updated = [...transferData];
    updated[index].rate = value;
    // Calculate amount based on the weight being transferred
    updated[index].amount = (parseFloat(value || 0) * updated[index].nextMonthWeight).toFixed(2);
    setTransferData(updated);
  };

  const toggleTransfer = (index) => {
    const updated = [...transferData];
    updated[index].transferEnabled = !updated[index].transferEnabled;
    setTransferData(updated);
  };

  const allChecklistsComplete = () => {
    return Object.values(closureChecklist).every(val => val === true);
  };

  const handleChecklistChange = (key) => {
    setClosureChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTransferAll = async () => {
    if (!allChecklistsComplete()) {
      showNotification("Please complete all closure checklist items first", "error");
      return;
    }

    const itemsToTransfer = transferData.filter(item => item.transferEnabled && item.rate > 0);
    if (itemsToTransfer.length === 0) {
      showNotification("Please select items and enter opening rates", "error");
      return;
    }

    if (!confirm(`Are you sure? This will remove stock from ${currentMonth} and carry it forward to ${transferDate}.`)) {
      return;
    }

    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of itemsToTransfer) {
        try {
          const res = await fetch(`${API_URL}/stock/transfer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: transferDate,
              description: item.description,
              currentWeight: item.weight,        // Original weight to remove from old month
              newWeight: item.nextMonthWeight,   // Exact same weight for new month
              rate: item.rate,
              amount: item.amount,
              supplier: item.supplier,
              fromMonth: currentMonth
            })
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        const newClosure = {
          month: currentMonth,
          closureDate: new Date().toISOString().split('T')[0],
          itemsTransferred: successCount,
          totalWeight: itemsToTransfer.reduce((sum, item) => sum + parseFloat(item.nextMonthWeight), 0),
          totalAmount: itemsToTransfer.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
        };
        const updated = [newClosure, ...closureHistory];
        setClosureHistory(updated);
        localStorage.setItem('closureHistory', JSON.stringify(updated));

        showNotification(`Success! Stock transferred to next month.`, "success");
        setClosureChecklist({
          invoicesReceived: false,
          physicalCountDone: false,
          discrepanciesResolved: false,
        });
        await fetchCategoriesWithStock();
      } else {
        showNotification(`Transferred ${successCount} items, ${errorCount} failed`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Error transferring stock", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalSelectedItems = transferData.filter(item => item.transferEnabled).length;
  
  const totalSelectedWeight = transferData
    .filter(item => item.transferEnabled)
    .reduce((sum, item) => sum + parseFloat(item.nextMonthWeight), 0);
    
  const totalSelectedAmount = transferData
    .filter(item => item.transferEnabled)
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const getNextMonth = () => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(year, parseInt(month), 1);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0].slice(0, 7);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
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

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 text-white">
                <RefreshCw size={24} />
              </span>
              Stock Transfer
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Close current month & carry forward stock</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closing:</span>
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="bg-transparent text-slate-800 font-bold outline-none w-32"
              />
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <ArrowRight size={16} className="text-purple-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opening:</span>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="bg-transparent text-slate-800 font-bold outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid lg:grid-cols-3 gap-8">
        {/* Left Column: Checklist & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Checklist Card */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100 flex justify-between items-center cursor-pointer" onClick={() => setChecklistOpen(!checklistOpen)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                  <ClipboardList size={20} />
                </div>
                <h3 className="font-bold text-amber-900">Pre-Closure Checklist</h3>
              </div>
              <Flag size={18} className={`text-amber-600 transition-transform duration-300 ${checklistOpen ? 'rotate-90' : ''}`} />
            </div>
            {checklistOpen && (
              <div className="p-5 space-y-3">
                <div
                  onClick={() => handleChecklistChange('invoicesReceived')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${closureChecklist.invoicesReceived ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}
                >
                  {closureChecklist.invoicesReceived ? <CheckSquare className="text-green-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                  <span className={`text-sm font-medium ${closureChecklist.invoicesReceived ? 'text-green-800' : 'text-slate-600'}`}>Invoices Verified</span>
                </div>

                <div
                  onClick={() => handleChecklistChange('physicalCountDone')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${closureChecklist.physicalCountDone ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}
                >
                  {closureChecklist.physicalCountDone ? <CheckSquare className="text-green-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                  <span className={`text-sm font-medium ${closureChecklist.physicalCountDone ? 'text-green-800' : 'text-slate-600'}`}>Physical Count Done</span>
                </div>

                <div
                  onClick={() => handleChecklistChange('discrepanciesResolved')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${closureChecklist.discrepanciesResolved ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}
                >
                  {closureChecklist.discrepanciesResolved ? <CheckSquare className="text-green-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                  <span className={`text-sm font-medium ${closureChecklist.discrepanciesResolved ? 'text-green-800' : 'text-slate-600'}`}>Discrepancies Resolved</span>
                </div>

                {allChecklistsComplete() && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
                    <CheckCircle size={16} /> Ready for Transfer
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selection Summary */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Package size={20} /> Transfer Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-indigo-100 text-sm">Items Selected</span>
                <span className="font-bold text-xl">{totalSelectedItems}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-indigo-100 text-sm">Transfer Weight</span>
                <span className="font-bold text-xl">{totalSelectedWeight.toFixed(2)} <span className="text-xs font-normal opacity-70">kg</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-100 text-sm">New Value</span>
                <span className="font-bold text-xl">₨{totalSelectedAmount.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/10">
               <p className="text-xs text-indigo-100 flex gap-2">
                 <ArrowRightCircle size={16} className="shrink-0" />
                 <span>Current stock becomes Opening Balance for next month.</span>
               </p>
            </div>

            <button
              onClick={handleTransferAll}
              disabled={loading || totalSelectedItems === 0 || !allChecklistsComplete()}
              className="w-full mt-6 bg-white text-indigo-700 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <><RefreshCw size={18} /> Confirm Transfer</>}
            </button>
          </div>
        </div>

        {/* Right Column: Transfer List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Items Card */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Remaining Stock</h3>
                <p className="text-xs text-slate-500">Select items to carry forward</p>
              </div>
              <div className="flex gap-2 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400">Target:</span>
                <span className="text-indigo-600">{getNextMonth()}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                  <p>Loading inventory...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Package size={48} className="mb-4 opacity-50" />
                  <p>No remaining stock found.</p>
                </div>
              ) : (
                transferData.map((item, index) => (
                  <div
                    key={index}
                    className={`border rounded-2xl p-4 transition-all duration-200 flex items-center gap-4 group ${item.transferEnabled
                        ? 'border-indigo-500 bg-indigo-50/30 shadow-md'
                        : 'border-slate-200 bg-white hover:border-indigo-200'
                      }`}
                  >
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={item.transferEnabled}
                        onChange={() => toggleTransfer(index)}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-offset-0 focus:ring-0 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Item</p>
                        <p className="font-bold text-slate-800">{item.description}</p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Weight</p>
                        <span className="font-bold text-indigo-600">{item.weight.toFixed(2)} kg</span>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Opening Rate</p>
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleRateChange(index, e.target.value)}
                          disabled={!item.transferEnabled}
                          placeholder="0.00"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 transition-all"
                        />
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">New Value</p>
                        <p className="font-bold text-emerald-600 text-lg">₨{parseFloat(item.amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Closure History */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History size={20} className="text-slate-400" /> Closure History
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {closureHistory.length > 0 ? closureHistory.slice().reverse().map((closure, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-bold text-slate-700">Month: {closure.month}</p>
                      <p className="text-xs text-slate-500">Closed on {closure.closureDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700">{closure.itemsTransferred} Items</p>
                    <p className="text-xs text-slate-500">{closure.totalWeight.toFixed(2)} kg • ₨{closure.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-sm text-center py-4 italic">No history available</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}