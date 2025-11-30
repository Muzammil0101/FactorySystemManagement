// "use client";
// import { useState, useEffect } from "react";
// import { 
//   Plus, 
//   Users, 
//   Phone, 
//   MapPin, 
//   Eye, 
//   Trash2, 
//   Search, 
//   X, 
//   FileText, 
//   TrendingUp, 
//   TrendingDown, 
//   Edit2, 
//   Save, 
//   Printer,
//   CheckCircle,
//   AlertCircle,
//   Wallet,
//   Calendar,
//   DollarSign,
//   AlertTriangle,
//   CreditCard
// } from "lucide-react";

// const API_URL = "http://localhost:4000/api";

// export default function CustomersPage() {
//   const [customers, setCustomers] = useState([]);
//   const [form, setForm] = useState({ name: "", phone: "", city: "" });
//   const [showForm, setShowForm] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [showLedger, setShowLedger] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
  
//   // New: Manual Entry Modal State
//   const [showEntryModal, setShowEntryModal] = useState(false);
//   const [entryForm, setEntryForm] = useState({
//     amount: "",
//     date: new Date().toISOString().split('T')[0],
//     description: "Opening Balance",
//     type: "debit" // Default to Debit (Receivable) for customers
//   });

//   const [paymentForm, setPaymentForm] = useState({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
//   const [loading, setLoading] = useState(false);
//   const [editingEntry, setEditingEntry] = useState(null);
//   const [editForm, setEditForm] = useState({});
//   const [notification, setNotification] = useState(null);

//   // New State for Confirmation Modal
//   const [confirmationModal, setConfirmationModal] = useState({
//     isOpen: false,
//     title: "",
//     message: "",
//     onConfirm: null,
//     variant: "danger" // danger | warning | info
//   });

//   const fetchCustomers = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/customers`);
//       const data = await response.json();
//       setCustomers(data);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//       showNotification("Failed to load customers", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   // Helper to trigger confirmation modal
//   const requestConfirmation = (title, message, onConfirm, variant = "danger") => {
//     setConfirmationModal({
//       isOpen: true,
//       title,
//       message,
//       onConfirm,
//       variant
//     });
//   };

//   const closeConfirmation = () => {
//     setConfirmationModal(prev => ({ ...prev, isOpen: false }));
//   };

//   const handleAdd = async () => {
//     if (!form.name.trim()) {
//       showNotification("Please enter customer name", "error");
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/customers`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form)
//       });

//       const result = await response.json();

//       if (response.ok) {
//         showNotification(result.message, "success");
//         setForm({ name: "", phone: "", city: "" });
//         setShowForm(false);
//         fetchCustomers();
//       } else {
//         showNotification(result.error || "Failed to add customer", "error");
//       }
//     } catch (error) {
//       showNotification("Failed to add customer", "error");
//     }
//   };

//   const handleDelete = (id) => {
//     requestConfirmation(
//       "Delete Customer?",
//       "Are you sure you want to delete this customer? This action cannot be undone and will remove all associated transaction history.",
//       async () => {
//         try {
//           const response = await fetch(`${API_URL}/customers/${id}`, {
//             method: 'DELETE'
//           });

//           const result = await response.json();

//           if (response.ok) {
//             showNotification(result.message, "success");
//             fetchCustomers();
//           } else {
//             showNotification(result.error || "Failed to delete customer", "error");
//           }
//         } catch (error) {
//           showNotification("Failed to delete customer", "error");
//         }
//       }
//     );
//   };

//   const handleReceivePayment = async () => {
//     if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
//       showNotification("Please enter a valid amount", "error");
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/customers/${selectedCustomer.id}/payment`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(paymentForm)
//       });

//       const result = await response.json();

//       if (response.ok) {
//         showNotification(result.message, "success");
//         setPaymentForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
//         setShowPaymentModal(false);
//         fetchCustomers();

//         const updatedCustomer = await fetch(`${API_URL}/customers/${selectedCustomer.id}`);
//         const customerData = await updatedCustomer.json();
//         setSelectedCustomer(customerData);
//       } else {
//         showNotification(result.error || "Failed to process payment", "error");
//       }
//     } catch (error) {
//       showNotification("Failed to process payment", "error");
//     }
//   };

//   // Handle Manual Entry (Opening Balance / Debit / Credit)
//   const handleAddEntry = async () => {
//     if (!entryForm.amount || parseFloat(entryForm.amount) <= 0) {
//       showNotification("Please enter a valid amount", "error");
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/customers/${selectedCustomer.id}/ledger`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(entryForm)
//       });

//       const result = await response.json();
      
//       if (response.ok) {
//         showNotification(result.message, "success");
//         setEntryForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "Opening Balance", type: "debit" });
//         setShowEntryModal(false);
//         fetchCustomers();
        
//         const updatedCustomer = await fetch(`${API_URL}/customers/${selectedCustomer.id}`);
//         const customerData = await updatedCustomer.json();
//         setSelectedCustomer(customerData);
//       } else {
//         showNotification(result.error || "Failed to add entry", "error");
//       }
//     } catch (error) {
//       showNotification("Failed to add entry", "error");
//     }
//   };

//   const handleEditEntry = (entry) => {
//     setEditingEntry(entry.id);
//     setEditForm({
//       date: entry.date,
//       description: entry.description,
//       weight: entry.weight,
//       rate: entry.rate,
//       debit: entry.debit || 0,
//       credit: entry.credit || 0
//     });
//   };

//   const handleSaveEdit = async (ledgerId) => {
//     try {
//       const response = await fetch(`${API_URL}/customers/ledger/${ledgerId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editForm)
//       });

//       const result = await response.json();
      
//       if (response.ok) {
//         showNotification(result.message, "success");
//         setEditingEntry(null);
//         fetchCustomers();
        
//         const updatedCustomer = await fetch(`${API_URL}/customers/${selectedCustomer.id}`);
//         const customerData = await updatedCustomer.json();
//         setSelectedCustomer(customerData);
//       } else {
//         showNotification(result.error || "Failed to update entry", "error");
//       }
//     } catch (error) {
//       showNotification("Failed to update entry", "error");
//     }
//   };

//   const handleDeleteEntry = (ledgerId) => {
//     requestConfirmation(
//       "Delete Entry?",
//       "Are you sure you want to remove this ledger entry? This will affect the customer's total balance.",
//       async () => {
//         try {
//           const response = await fetch(`${API_URL}/customers/ledger/${ledgerId}`, {
//             method: 'DELETE'
//           });

//           const result = await response.json();
          
//           if (response.ok) {
//             showNotification(result.message, "success");
//             fetchCustomers();
            
//             const updatedCustomer = await fetch(`${API_URL}/customers/${selectedCustomer.id}`);
//             const customerData = await updatedCustomer.json();
//             setSelectedCustomer(customerData);
//           } else {
//             showNotification(result.error || "Failed to delete entry", "error");
//           }
//         } catch (error) {
//           showNotification("Failed to delete entry", "error");
//         }
//       }
//     );
//   };

//   const calculateBalance = (customer) => {
//     const ledger = customer.ledger || [];
//     const totalDebit = ledger.reduce((sum, e) => sum + (e.debit || 0), 0);
//     const totalCredit = ledger.reduce((sum, e) => sum + (e.credit || 0), 0);
//     return totalDebit - totalCredit;
//   };

//   const filtered = customers.filter(c =>
//     c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (c.phone && c.phone.includes(searchTerm)) ||
//     (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const getSortedLedger = (ledger) => {
//     if (!ledger) return [];
//     return [...ledger].sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);
//       const dateDiff = dateA - dateB;
//       if (dateDiff !== 0) return dateDiff;
//       if (typeof a.id === 'number' && typeof b.id === 'number') {
//         return a.id - b.id;
//       }
//       return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
//     });
//   };

//   const printLedger = () => {
//     if (!selectedCustomer) return;
//     const ledger = getSortedLedger(selectedCustomer.ledger);
//     let totalDebit = 0, totalCredit = 0;
//     let runningBalance = 0;

//     let ledgerHTML = `
//       <table style="width:100%; border-collapse:collapse; margin-top:20px; font-family: Arial, sans-serif; font-size: 12px;">
//         <thead style="background:#f1f5f9;">
//           <tr>
//             <th style="padding:10px;border:1px solid #e2e8f0;text-align:left;">Date</th>
//             <th style="padding:10px;border:1px solid #e2e8f0;text-align:left;">Description</th>
//             <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Weight</th>
//             <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Rate</th>
//             <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Debit</th>
//             <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Credit</th>
//             <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Balance</th>
//           </tr>
//         </thead>
//         <tbody>
//     `;

//     ledger.forEach(entry => {
//       totalDebit += entry.debit || 0;
//       totalCredit += entry.credit || 0;
//       runningBalance += (entry.debit || 0) - (entry.credit || 0);

//       ledgerHTML += `
//         <tr>
//           <td style="padding:8px;border:1px solid #e2e8f0;">${entry.date}</td>
//           <td style="padding:8px;border:1px solid #e2e8f0;">${entry.description}</td>
//           <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.weight || '-'}</td>
//           <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.rate || '-'}</td>
//           <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:#ef4444;">${entry.debit ? entry.debit.toLocaleString() : '-'}</td>
//           <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:#10b981;">${entry.credit ? entry.credit.toLocaleString() : '-'}</td>
//           <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;color:${runningBalance >= 0 ? '#3b82f6' : '#10b981'};">
//             ${Math.abs(runningBalance).toLocaleString()} ${runningBalance >= 0 ? 'Recv' : 'Adv'}
//           </td>
//         </tr>
//       `;
//     });

//     const balance = totalDebit - totalCredit;
//     ledgerHTML += `
//         </tbody>
//         <tfoot style="background:#f8fafc;font-weight:bold;">
//           <tr>
//             <td colspan="4" style="padding:10px;text-align:right;border:1px solid #e2e8f0;">Totals</td>
//             <td style="padding:10px;text-align:right;color:#ef4444;border:1px solid #e2e8f0;">${totalDebit.toLocaleString()}</td>
//             <td style="padding:10px;text-align:right;color:#10b981;border:1px solid #e2e8f0;">${totalCredit.toLocaleString()}</td>
//             <td style="padding:10px;text-align:right;border:1px solid #e2e8f0;"></td>
//           </tr>
//           <tr>
//             <td colspan="6" style="padding:12px;text-align:right;border:1px solid #e2e8f0;">Net Balance</td>
//             <td style="padding:12px;text-align:right;color:${balance >= 0 ? '#3b82f6' : '#10b981'};border:1px solid #e2e8f0;font-size:14px;">
//               Rs ${Math.abs(balance).toLocaleString()} ${balance >= 0 ? '(Receivable)' : '(Advance)'}
//             </td>
//           </tr>
//         </tfoot>
//       </table>
//     `;

//     const popup = window.open('', '_blank', 'width=900,height=700');
//     popup.document.write(`
//       <html>
//         <head>
//           <title>Ledger - ${selectedCustomer.name}</title>
//           <style>
//             body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:40px; background:#fff; color: #334155; }
//             .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
//             .header h1 { margin: 0; color: #1e293b; font-size: 24px; }
//             .company { font-size: 14px; color: #64748b; text-align: right; }
//             .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #f1f5f9; padding: 20px; border-radius: 8px; }
//             .info-item h3 { margin: 0 0 5px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
//             .info-item p { margin: 0; font-weight: 600; color: #0f172a; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h1>Customer Ledger</h1>
//             <div class="company">
//               <strong>Butt & Malik Traders</strong><br>
//               Generated on ${new Date().toLocaleDateString()}
//             </div>
//           </div>
          
//           <div class="info-grid">
//             <div class="info-item">
//               <h3>Customer</h3>
//               <p>${selectedCustomer.name}</p>
//             </div>
//             <div class="info-item">
//               <h3>Contact</h3>
//               <p>${selectedCustomer.phone || 'N/A'}</p>
//             </div>
//             <div class="info-item">
//               <h3>Location</h3>
//               <p>${selectedCustomer.city || 'N/A'}</p>
//             </div>
//           </div>
//           ${ledgerHTML}
//         </body>
//       </html>
//     `);
//     popup.document.close();
//   };

//   let renderRunningBalance = 0;

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
//       {/* Background Ambient Glows */}
//       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
//       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

//       {/* Notification Toast */}
//       {notification && (
//         <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${
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

//       {/* NEW: Confirmation Modal */}
//       {confirmationModal.isOpen && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-scale-in border border-slate-100 relative overflow-hidden">
//             {/* Modal Ambient Glow */}
//             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500"></div>
            
//             <div className="text-center relative z-10">
//               <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
//                 <AlertTriangle size={32} className="text-rose-500" />
//               </div>
              
//               <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmationModal.title}</h3>
//               <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
//                 {confirmationModal.message}
//               </p>
              
//               <div className="flex gap-3">
//                 <button
//                   onClick={closeConfirmation}
//                   className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     if (confirmationModal.onConfirm) confirmationModal.onConfirm();
//                     closeConfirmation();
//                   }}
//                   className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
//                 >
//                   <Trash2 size={16} /> Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="relative z-10 mb-8">
//         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
//               <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
//                 <Users size={24} />
//               </span>
//               Customer Management
//             </h1>
//             <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Track sales, receivables, and transaction history</p>
//           </div>
//           <button 
//             onClick={() => setShowForm(!showForm)} 
//             className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
//           >
//             <Plus size={18} /> {showForm ? "Close Form" : "Add Customer"}
//           </button>
//         </div>
//       </div>

//       {/* Add Customer Form */}
//       {showForm && (
//         <div className="relative z-10 mb-8 animate-slide-in">
//           <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
//             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
//             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
//               <h3 className="text-lg font-bold text-slate-800">New Customer</h3>
//             </div>
//             <div className="p-6">
//               <div className="grid md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label>
//                   <input 
//                     placeholder="e.g. John Doe" 
//                     value={form.name} 
//                     onChange={e => setForm({...form, name: e.target.value})} 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone</label>
//                   <input 
//                     placeholder="0300-1234567" 
//                     value={form.phone} 
//                     onChange={e => setForm({...form, phone: e.target.value})} 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">City</label>
//                   <input 
//                     placeholder="Lahore" 
//                     value={form.city} 
//                     onChange={e => setForm({...form, city: e.target.value})} 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-3 mt-6">
//                 <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all">
//                   Save Customer
//                 </button>
//                 <button onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all">
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
//             type="text" 
//             placeholder="Search customers..." 
//             className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
//             value={searchTerm} 
//             onChange={e => setSearchTerm(e.target.value)} 
//           />
//         </div>
//       </div>

//       {/* Customers Grid */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
//         {filtered.length === 0 ? (
//           <div className="col-span-full bg-white border border-slate-200 rounded-3xl shadow-lg p-12 text-center">
//             <Users className="mx-auto text-slate-300 mb-4" size={64} />
//             <p className="text-slate-500 font-medium">No customers found</p>
//           </div>
//         ) : (
//           filtered.map((customer) => {
//             const balance = calculateBalance(customer);
//             return (
//               <div key={customer.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group">
//                 <div className="flex justify-between items-start mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
//                       <Users size={20} className="text-blue-600" />
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-slate-800 text-lg leading-tight">{customer.name}</h3>
//                       <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {customer.city || "No City"}</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors"><Trash2 size={16} /></button>
//                   </div>
//                 </div>

//                 <div className="space-y-3 mb-5">
//                   <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
//                     <span className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> Phone</span>
//                     <span className="font-medium">{customer.phone || "N/A"}</span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
//                     <span className="flex items-center gap-2"><FileText size={14} className="text-blue-500" /> Transactions</span>
//                     <span className="font-medium">{customer.ledger?.length || 0}</span>
//                   </div>
//                 </div>

//                 <div className={`p-4 rounded-2xl mb-5 border ${balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}>
//                   <div className="flex items-center justify-between">
//                     <span className={`text-xs font-bold uppercase tracking-wider ${balance >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>Net Balance</span>
//                     {balance >= 0 ? <TrendingUp className="text-blue-500" size={18} /> : <TrendingDown className="text-emerald-500" size={18} />}
//                   </div>
//                   <div className={`text-2xl font-extrabold mt-1 ${balance >= 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
//                     Rs {Math.abs(balance).toLocaleString()}
//                   </div>
//                   <div className={`text-[10px] font-bold mt-1 uppercase ${balance >= 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
//                     {balance >= 0 ? 'Receivable (Asset)' : 'Advance (Paid)'}
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <button 
//                     onClick={() => {
//                       setSelectedCustomer(customer);
//                       setShowLedger(true);
//                       renderRunningBalance = 0; // Reset
//                     }}
//                     className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm"
//                   >
//                     <Eye size={16} /> Ledger
//                   </button>
//                   <button 
//                     onClick={() => {
//                       setSelectedCustomer(customer);
//                       setShowPaymentModal(true);
//                     }}
//                     className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md hover:shadow-lg"
//                   >
//                     <Wallet size={16} /> Receive
//                   </button>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* Ledger Modal */}
//       {showLedger && selectedCustomer && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20 overflow-hidden animate-scale-in">
//             <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
//                   <FileText size={24} />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-slate-800">{selectedCustomer.name}</h2>
//                   <p className="text-slate-500 text-sm font-medium">Transaction Ledger</p>
//                 </div>
//               </div>
              
//               <div className="flex gap-2">
//                 <button 
//                    onClick={() => setShowEntryModal(true)}
//                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
//                  >
//                    <Plus size={14} /> Add Manual Entry
//                  </button>
//                  <button onClick={() => { setShowLedger(false); setEditingEntry(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
//                   <X size={24} className="text-slate-500" />
//                  </button>
//               </div>
//             </div>

//             <div className="p-6 flex-1 overflow-y-auto bg-white">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
//                   <p className="font-bold text-slate-700 mt-1">{selectedCustomer.phone || 'N/A'}</p>
//                 </div>
//                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <p className="text-xs text-slate-400 font-bold uppercase">City</p>
//                   <p className="font-bold text-slate-700 mt-1">{selectedCustomer.city || 'N/A'}</p>
//                 </div>
//                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <p className="text-xs text-slate-400 font-bold uppercase">Total Transactions</p>
//                   <p className="font-bold text-slate-700 mt-1">{selectedCustomer.ledger?.length || 0}</p>
//                 </div>
//               </div>

//               <div className="border border-slate-200 rounded-2xl overflow-hidden">
//                 <table className="w-full text-sm text-left">
//                   <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
//                     <tr>
//                       <th className="p-4">Date</th>
//                       <th className="p-4">Description</th>
//                       <th className="p-4 text-right">Weight</th>
//                       <th className="p-4 text-right">Rate</th>
//                       <th className="p-4 text-right text-rose-600">Debit (Sale)</th>
//                       <th className="p-4 text-right text-emerald-600">Credit (Recv)</th>
//                       <th className="p-4 text-right text-slate-700">Balance</th>
//                       <th className="p-4 text-center">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {selectedCustomer.ledger && selectedCustomer.ledger.length > 0 ? (
//                       getSortedLedger(selectedCustomer.ledger).map((entry, idx) => {
//                         // Calculate running balance per row
//                         renderRunningBalance += (entry.debit || 0) - (entry.credit || 0);

//                         return (
//                           <tr key={entry.id || idx} className="group hover:bg-slate-50/50 transition-colors">
//                             {editingEntry === entry.id ? (
//                               <>
//                                 <td className="p-2"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
//                                 <td className="p-2"><input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
//                                 <td className="p-2"><input type="number" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
//                                 <td className="p-2"><input type="number" value={editForm.rate} onChange={(e) => setEditForm({...editForm, rate: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
//                                 <td className="p-2"><input type="number" value={editForm.debit} onChange={(e) => setEditForm({...editForm, debit: e.target.value})} className="w-full border border-rose-200 rounded p-1 text-right text-rose-600" /></td>
//                                 <td className="p-2"><input type="number" value={editForm.credit} onChange={(e) => setEditForm({...editForm, credit: e.target.value})} className="w-full border border-emerald-200 rounded p-1 text-right text-emerald-600" /></td>
//                                 <td className="p-2 text-right text-slate-400 italic">Updating...</td>
//                                 <td className="p-2 text-center">
//                                   <div className="flex justify-center gap-1">
//                                     <button onClick={() => handleSaveEdit(entry.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={14} /></button>
//                                     <button onClick={() => setEditingEntry(null)} className="p-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"><X size={14} /></button>
//                                   </div>
//                                 </td>
//                               </>
//                             ) : (
//                               <>
//                                 <td className="p-4 text-slate-600 font-medium">{entry.date}</td>
//                                 <td className="p-4 text-slate-800 font-medium">{entry.description}</td>
//                                 <td className="p-4 text-right text-slate-600">{entry.weight || '-'}</td>
//                                 <td className="p-4 text-right text-slate-600">{entry.rate || '-'}</td>
//                                 <td className="p-4 text-right font-bold text-rose-600">{entry.debit > 0 ? `Rs ${entry.debit.toLocaleString()}` : '-'}</td>
//                                 <td className="p-4 text-right font-bold text-emerald-600">{entry.credit > 0 ? `Rs ${entry.credit.toLocaleString()}` : '-'}</td>
//                                 <td className="p-4 text-right font-bold text-slate-700">
//                                   {Math.abs(renderRunningBalance).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{renderRunningBalance >= 0 ? 'REC' : 'ADV'}</span>
//                                 </td>
//                                 <td className="p-4 text-center">
//                                   <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                     <button onClick={() => handleEditEntry(entry)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"><Edit2 size={14} /></button>
//                                     <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"><Trash2 size={14} /></button>
//                                   </div>
//                                 </td>
//                               </>
//                             )}
//                           </tr>
//                         );
//                       })
//                     ) : (
//                       <tr><td colSpan="8" className="p-8 text-center text-slate-400">No ledger entries found.</td></tr>
//                     )}
//                   </tbody>
//                   <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
//                     <tr>
//                       <td colSpan="4" className="p-4 text-right text-slate-600 uppercase text-xs tracking-wider">Totals</td>
//                       <td className="p-4 text-right text-rose-700">
//                         Rs {selectedCustomer.ledger?.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString()}
//                       </td>
//                       <td className="p-4 text-right text-emerald-700">
//                         Rs {selectedCustomer.ledger?.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString()}
//                       </td>
//                       <td colSpan="2"></td>
//                     </tr>
//                     <tr className={calculateBalance(selectedCustomer) >= 0 ? "bg-blue-50" : "bg-emerald-50"}>
//                       <td colSpan="6" className="p-4 text-right text-slate-700 uppercase text-xs tracking-wider">Net Balance</td>
//                       <td colSpan="2" className={`p-4 text-right text-lg font-extrabold ${calculateBalance(selectedCustomer) >= 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
//                         Rs {Math.abs(calculateBalance(selectedCustomer)).toLocaleString()}
//                         <span className="text-xs font-medium ml-2 opacity-80">
//                           {calculateBalance(selectedCustomer) >= 0 ? '(RECEIVABLE)' : '(ADVANCE)'}
//                         </span>
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </div>

//             <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
//               <button
//                 onClick={printLedger}
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
//               >
//                 <Printer size={18} /> Print Ledger
//               </button>
//               <button
//                 onClick={() => setShowLedger(false)}
//                 className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-all"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Manual Entry Modal */}
//       {showEntryModal && selectedCustomer && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
//             <div className="bg-slate-800 p-6 text-white flex justify-between items-start">
//               <div>
//                 <h3 className="text-xl font-bold">Add Ledger Entry</h3>
//                 <p className="text-slate-300 text-sm mt-1">Manual Adjustment / Opening Balance</p>
//               </div>
//               <button onClick={() => setShowEntryModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
//                 <X size={20} />
//               </button>
//             </div>
            
//             <div className="p-6 space-y-5">
              
//               {/* Type Selection */}
//               <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
//                  <button 
//                     onClick={() => setEntryForm({...entryForm, type: "debit"})}
//                     className={`py-2 rounded-lg text-sm font-bold transition-all ${entryForm.type === "debit" ? "bg-white shadow-sm text-rose-700" : "text-slate-500 hover:bg-white/50"}`}
//                  >
//                     Debit (Receivable)
//                  </button>
//                  <button 
//                     onClick={() => setEntryForm({...entryForm, type: "credit"})}
//                     className={`py-2 rounded-lg text-sm font-bold transition-all ${entryForm.type === "credit" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500 hover:bg-white/50"}`}
//                  >
//                     Credit (Received)
//                  </button>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (PKR)</label>
//                 <div className="relative">
//                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                   <input 
//                     type="number" 
//                     value={entryForm.amount} 
//                     onChange={e => setEntryForm({...entryForm, amount: e.target.value})} 
//                     className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 outline-none transition-all ${entryForm.type === 'debit' ? 'focus:ring-rose-500/20 focus:border-rose-500 border-rose-100' : 'focus:ring-emerald-500/20 focus:border-emerald-500 border-emerald-100'}`}
//                     placeholder="0.00"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
//                 <div className="relative">
//                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                   <input 
//                     type="date" 
//                     value={entryForm.date} 
//                     onChange={e => setEntryForm({...entryForm, date: e.target.value})} 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
//                 <input 
//                   type="text" 
//                   placeholder="e.g. Opening Balance" 
//                   value={entryForm.description} 
//                   onChange={e => setEntryForm({...entryForm, description: e.target.value})} 
//                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium"
//                 />
//               </div>

//               <button 
//                 onClick={handleAddEntry} 
//                 className={`w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${entryForm.type === 'debit' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
//               >
//                 <CheckCircle size={18} /> {entryForm.type === 'debit' ? 'Add Debit Entry' : 'Add Credit Entry'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Receive Payment Modal */}
//       {showPaymentModal && selectedCustomer && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start">
//               <div>
//                 <h3 className="text-xl font-bold">Receive Payment</h3>
//                 <p className="text-blue-100 text-sm mt-1">From {selectedCustomer.name}</p>
//               </div>
//               <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
//                 <X size={20} />
//               </button>
//             </div>
            
//             <div className="p-6 space-y-5">
//               <div>
//                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (PKR)</label>
//                 <div className="relative">
//                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                   <input 
//                     type="number" 
//                     value={paymentForm.amount} 
//                     onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
//                     placeholder="0.00"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
//                 <div className="relative">
//                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                   <input 
//                     type="date" 
//                     value={paymentForm.date} 
//                     onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Note / Description</label>
//                 <input 
//                   type="text" 
//                   placeholder="e.g. Cash Received" 
//                   value={paymentForm.description} 
//                   onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} 
//                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
//                 />
//               </div>

//               <button 
//                 onClick={handleReceivePayment} 
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2"
//               >
//                 <CheckCircle size={18} /> Confirm Receipt
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  Phone, 
  MapPin, 
  Eye, 
  Trash2, 
  Search, 
  X, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Save, 
  Printer,
  CheckCircle,
  AlertCircle,
  Wallet,
  Calendar,
  DollarSign,
  AlertTriangle,
  ArrowLeftRight,
  Link as LinkIcon
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Fetch suppliers to check for dual roles
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [matchingSupplier, setMatchingSupplier] = useState(null); // Store linked supplier if found
  const [showLedger, setShowLedger] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showContraModal, setShowContraModal] = useState(false); // Contra Modal
  
  // Manual Entry Modal State
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryForm, setEntryForm] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "Opening Balance",
    type: "debit" // Default: Debit (Receivable) for customers
  });

  const [paymentForm, setPaymentForm] = useState({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
  const [contraForm, setContraForm] = useState({ amount: "", date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [notification, setNotification] = useState(null);

  // Confirmation Modal
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [custRes, suppRes] = await Promise.all([
        fetch(`${API_URL}/customers`),
        fetch(`${API_URL}/suppliers`)
      ]);
      
      const custData = await custRes.json();
      const suppData = await suppRes.json();
      
      setCustomers(Array.isArray(custData) ? custData : []);
      setSuppliers(Array.isArray(suppData) ? suppData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const requestConfirmation = (title, message, onConfirm, variant = "danger") => {
    setConfirmationModal({ isOpen: true, title, message, onConfirm, variant });
  };

  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      showNotification("Please enter customer name", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(result.message, "success");
        setForm({ name: "", phone: "", city: "" });
        setShowForm(false);
        fetchData();
      } else {
        showNotification(result.error || "Failed to add customer", "error");
      }
    } catch (error) {
      showNotification("Failed to add customer", "error");
    }
  };

  const handleDelete = (id) => {
    requestConfirmation(
      "Delete Customer?",
      "Are you sure you want to delete this customer? This action cannot be undone.",
      async () => {
        try {
          const response = await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
          const result = await response.json();
          if (response.ok) {
            showNotification(result.message, "success");
            fetchData();
          } else {
            showNotification(result.error || "Failed to delete customer", "error");
          }
        } catch (error) {
          showNotification("Failed to delete customer", "error");
        }
      }
    );
  };

  const handleReceivePayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers/${selectedCustomer.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(result.message, "success");
        setPaymentForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
        setShowPaymentModal(false);
        refreshSelectedCustomer();
      } else {
        showNotification(result.error || "Failed to process payment", "error");
      }
    } catch (error) {
      showNotification("Failed to process payment", "error");
    }
  };

  const handleAddEntry = async () => {
    if (!entryForm.amount || parseFloat(entryForm.amount) <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers/${selectedCustomer.id}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryForm)
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setEntryForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "Opening Balance", type: "debit" });
        setShowEntryModal(false);
        refreshSelectedCustomer();
      } else {
        showNotification(result.error || "Failed to add entry", "error");
      }
    } catch (error) {
      showNotification("Failed to add entry", "error");
    }
  };

  // --- CONTRA SETTLEMENT LOGIC ---
  const handleContraSettlement = async () => {
    if (!contraForm.amount || parseFloat(contraForm.amount) <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }
    if (!matchingSupplier) {
      showNotification("No matching supplier found for contra", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Credit the Customer (Reduce Receivable)
      const custRes = await fetch(`${API_URL}/customers/${selectedCustomer.id}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: contraForm.date,
          description: `Contra: Offset against Supplier (${matchingSupplier.name})`,
          amount: contraForm.amount,
          type: 'credit' // Credit reduces customer balance (Receivable)
        })
      });

      // 2. Debit the Supplier (Reduce Payable)
      const suppRes = await fetch(`${API_URL}/suppliers/${matchingSupplier.id}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: contraForm.date,
          description: `Contra: Offset against Customer (${selectedCustomer.name})`,
          amount: contraForm.amount,
          type: 'debit' // Debit reduces supplier balance (Payable)
        })
      });

      if (custRes.ok && suppRes.ok) {
        showNotification("Contra settlement successful!", "success");
        setContraForm({ amount: "", date: new Date().toISOString().split('T')[0] });
        setShowContraModal(false);
        refreshSelectedCustomer();
      } else {
        showNotification("Partial error during settlement. Check ledgers.", "warning");
      }
    } catch (error) {
      showNotification("Failed to process contra settlement", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedCustomer = async () => {
    await fetchData();
    const updatedCustomer = await fetch(`${API_URL}/customers/${selectedCustomer.id}`);
    const customerData = await updatedCustomer.json();
    setSelectedCustomer(customerData);
    
    // Also update supplier view if needed
    if (matchingSupplier) {
        const updatedSupplier = await fetch(`${API_URL}/suppliers/${matchingSupplier.id}`);
        const supplierData = await updatedSupplier.json();
        setMatchingSupplier(supplierData);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry.id);
    setEditForm({
      date: entry.date,
      description: entry.description,
      weight: entry.weight,
      rate: entry.rate,
      debit: entry.debit || 0,
      credit: entry.credit || 0
    });
  };

  const handleSaveEdit = async (ledgerId) => {
    try {
      const response = await fetch(`${API_URL}/customers/ledger/${ledgerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setEditingEntry(null);
        refreshSelectedCustomer();
      } else {
        showNotification(result.error || "Failed to update entry", "error");
      }
    } catch (error) {
      showNotification("Failed to update entry", "error");
    }
  };

  const handleDeleteEntry = (ledgerId) => {
    requestConfirmation(
      "Delete Entry?",
      "Are you sure you want to remove this ledger entry?",
      async () => {
        try {
          const response = await fetch(`${API_URL}/customers/ledger/${ledgerId}`, { method: 'DELETE' });
          const result = await response.json();
          if (response.ok) {
            showNotification(result.message, "success");
            refreshSelectedCustomer();
          } else {
            showNotification(result.error || "Failed to delete entry", "error");
          }
        } catch (error) {
          showNotification("Failed to delete entry", "error");
        }
      }
    );
  };

  // --- HELPERS ---
  const calculateCustomerBalance = (customer) => {
    if (!customer?.ledger) return 0;
    const totalDebit = customer.ledger.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = customer.ledger.reduce((sum, e) => sum + (e.credit || 0), 0);
    return totalDebit - totalCredit; // Positive = Receivable
  };

  const calculateSupplierBalance = (supplier) => {
    if (!supplier?.ledger) return 0;
    const totalDebit = supplier.ledger.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = supplier.ledger.reduce((sum, e) => sum + (e.credit || 0), 0);
    return totalCredit - totalDebit; // Positive = Payable
  };

  const findLinkedSupplier = (customer) => {
    return suppliers.find(s => s.name.trim().toLowerCase() === customer.name.trim().toLowerCase());
  };

  const openLedger = (customer) => {
    setSelectedCustomer(customer);
    const linked = findLinkedSupplier(customer);
    setMatchingSupplier(linked); 
    setShowLedger(true);
    renderRunningBalance = 0;
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSortedLedger = (ledger) => {
    if (!ledger) return [];
    return [...ledger].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA - dateB !== 0) return dateA - dateB;
      return (a.id || 0) - (b.id || 0);
    });
  };

  const printLedger = () => {
    if (!selectedCustomer) return;
    const ledger = getSortedLedger(selectedCustomer.ledger);
    let totalDebit = 0, totalCredit = 0;
    let runningBalance = 0;

    let ledgerHTML = `
      <table style="width:100%; border-collapse:collapse; margin-top:20px; font-family: Arial, sans-serif; font-size: 12px;">
        <thead style="background:#f1f5f9;">
          <tr>
            <th style="padding:10px;border:1px solid #e2e8f0;">Date</th>
            <th style="padding:10px;border:1px solid #e2e8f0;">Description</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Weight</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Rate</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Debit</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Credit</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Balance</th>
          </tr>
        </thead>
        <tbody>
    `;

    ledger.forEach(entry => {
      totalDebit += entry.debit || 0;
      totalCredit += entry.credit || 0;
      runningBalance += (entry.debit || 0) - (entry.credit || 0);

      ledgerHTML += `
        <tr>
          <td style="padding:8px;border:1px solid #e2e8f0;">${entry.date}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;">${entry.description}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.weight || '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.rate || '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:#ef4444;">${entry.debit ? entry.debit.toLocaleString() : '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:#10b981;">${entry.credit ? entry.credit.toLocaleString() : '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;">${Math.abs(runningBalance).toLocaleString()} ${runningBalance >= 0 ? 'Dr' : 'Cr'}</td>
        </tr>
      `;
    });

    const balance = totalDebit - totalCredit;
    ledgerHTML += `
        </tbody>
        <tfoot style="background:#f8fafc;font-weight:bold;">
          <tr>
            <td colspan="4" style="padding:10px;text-align:right;">Totals</td>
            <td style="padding:10px;text-align:right;color:#ef4444;">${totalDebit.toLocaleString()}</td>
            <td style="padding:10px;text-align:right;color:#10b981;">${totalCredit.toLocaleString()}</td>
            <td></td>
          </tr>
          <tr>
            <td colspan="6" style="padding:12px;text-align:right;">Closing Balance</td>
            <td style="padding:12px;text-align:right;">Rs ${Math.abs(balance).toLocaleString()} ${balance >= 0 ? '(Recv)' : '(Adv)'}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const popup = window.open('', '_blank', 'width=900,height=700');
    popup.document.write(`<html><head><title>${selectedCustomer.name}</title></head><body style="padding:40px;font-family:sans-serif;"><h1>${selectedCustomer.name}</h1>${ledgerHTML}</body></html>`);
    popup.document.close();
  };

  let renderRunningBalance = 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${
          notification.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : (notification.type === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200")
        }`}>
          {notification.type === "success" ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className={notification.type === "warning" ? "text-amber-500" : "text-rose-500"} />}
          <p className="font-bold text-sm">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="hover:bg-slate-200/50 p-1 rounded-lg transition-colors ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-scale-in border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500"></div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmationModal.title}</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">{confirmationModal.message}</p>
              <div className="flex gap-3">
                <button onClick={closeConfirmation} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all shadow-sm">Cancel</button>
                <button onClick={() => { if (confirmationModal.onConfirm) confirmationModal.onConfirm(); closeConfirmation(); }} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                <Users size={24} />
              </span>
              Customer Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Track sales, receivables, and transaction history</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-200 transition-all transform hover:scale-105">
            <Plus size={18} /> {showForm ? "Close Form" : "Add Customer"}
          </button>
        </div>
      </div>

      {/* Add Customer Form */}
      {showForm && (
        <div className="relative z-10 mb-8 animate-slide-in">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">New Customer</h3>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label><input placeholder="e.g. John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone</label><input placeholder="0300-1234567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">City</label><input placeholder="Lahore" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all">Save Customer</button>
                <button onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative z-10 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Search customers..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl shadow-lg p-12 text-center">
            <Users className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-500 font-medium">No customers found</p>
          </div>
        ) : (
          filtered.map((customer) => {
            const balance = calculateCustomerBalance(customer);
            const linkedSupplier = findLinkedSupplier(customer); // Check for matching supplier

            return (
              <div key={customer.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
                      <Users size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{customer.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                         <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {customer.city || "No City"}</p>
                         {linkedSupplier && (
                           <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-bold flex items-center gap-1">
                             <LinkIcon size={8} /> Dual Role
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> Phone</span>
                    <span className="font-medium">{customer.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><FileText size={14} className="text-blue-500" /> Transactions</span>
                    <span className="font-medium">{customer.ledger?.length || 0}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl mb-5 border ${balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${balance >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>Net Balance</span>
                    {balance >= 0 ? <TrendingUp className="text-blue-500" size={18} /> : <TrendingDown className="text-emerald-500" size={18} />}
                  </div>
                  <div className={`text-2xl font-extrabold mt-1 ${balance >= 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
                    Rs {Math.abs(balance).toLocaleString()}
                  </div>
                  <div className={`text-[10px] font-bold mt-1 uppercase ${balance >= 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {balance >= 0 ? 'Receivable (Asset)' : 'Advance (Paid)'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => openLedger(customer)}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm"
                  >
                    <Eye size={16} /> Ledger
                  </button>
                  <button 
                    onClick={() => { setSelectedCustomer(customer); setShowPaymentModal(true); }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    <Wallet size={16} /> Receive
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ledger Modal */}
      {showLedger && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20 overflow-hidden animate-scale-in">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedCustomer.name}
                    {matchingSupplier && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg border border-purple-200 font-bold flex items-center gap-1"><LinkIcon size={10} /> Dual Profile</span>}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Transaction Ledger</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setShowEntryModal(true)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
                   <Plus size={14} /> Add Manual Entry
                 </button>
                 <button onClick={() => { setShowLedger(false); setEditingEntry(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={24} className="text-slate-500" />
                 </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-white">
              {/* Stats Grid - Modified to show Dual Role Info */}
              <div className={`grid grid-cols-1 ${matchingSupplier ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-6`}>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Customer Balance</p>
                  <p className={`font-bold mt-1 ${calculateCustomerBalance(selectedCustomer) >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                    Rs {Math.abs(calculateCustomerBalance(selectedCustomer)).toLocaleString()} {calculateCustomerBalance(selectedCustomer) >= 0 ? '(Recv)' : '(Adv)'}
                  </p>
                </div>
                
                {matchingSupplier && (
                  <>
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <p className="text-xs text-purple-400 font-bold uppercase">Supplier Balance</p>
                      <p className={`font-bold mt-1 ${calculateSupplierBalance(matchingSupplier) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Rs {Math.abs(calculateSupplierBalance(matchingSupplier)).toLocaleString()} {calculateSupplierBalance(matchingSupplier) >= 0 ? '(Payable)' : '(Paid)'}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-white flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Net Business Position</p>
                        <p className="font-bold mt-1 text-lg">
                           {/* Net = (Cust Recv) - (Supp Payable) */}
                           Rs {Math.abs(calculateCustomerBalance(selectedCustomer) - calculateSupplierBalance(matchingSupplier)).toLocaleString()} 
                           <span className="text-xs font-normal opacity-70 ml-1">
                             {(calculateCustomerBalance(selectedCustomer) - calculateSupplierBalance(matchingSupplier)) >= 0 ? ' (Receivable)' : ' (Payable)'}
                           </span>
                        </p>
                      </div>
                      <button 
                        onClick={() => { setContraForm({ amount: "", date: new Date().toISOString().split('T')[0] }); setShowContraModal(true); }}
                        className="mt-2 w-full bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded-lg font-bold transition-all border border-white/10 flex items-center justify-center gap-1"
                      >
                        <ArrowLeftRight size={12} /> Settle Contra
                      </button>
                    </div>
                  </>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Transactions</p>
                  <p className="font-bold text-slate-700 mt-1">{selectedCustomer.ledger?.length || 0}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-right">Weight</th>
                      <th className="p-4 text-right">Rate</th>
                      <th className="p-4 text-right text-rose-600">Debit (Sale)</th>
                      <th className="p-4 text-right text-emerald-600">Credit (Recv)</th>
                      <th className="p-4 text-right text-slate-700">Balance</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCustomer.ledger && selectedCustomer.ledger.length > 0 ? (
                      getSortedLedger(selectedCustomer.ledger).map((entry, idx) => {
                        renderRunningBalance += (entry.debit || 0) - (entry.credit || 0);
                        return (
                          <tr key={entry.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                            {editingEntry === entry.id ? (
                              <>
                                <td className="p-2"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
                                <td className="p-2"><input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
                                <td className="p-2"><input type="number" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
                                <td className="p-2"><input type="number" value={editForm.rate} onChange={(e) => setEditForm({...editForm, rate: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
                                <td className="p-2"><input type="number" value={editForm.debit} onChange={(e) => setEditForm({...editForm, debit: e.target.value})} className="w-full border border-rose-200 rounded p-1 text-right text-rose-600" /></td>
                                <td className="p-2"><input type="number" value={editForm.credit} onChange={(e) => setEditForm({...editForm, credit: e.target.value})} className="w-full border border-emerald-200 rounded p-1 text-right text-emerald-600" /></td>
                                <td className="p-2 text-right text-slate-400 italic">Updating...</td>
                                <td className="p-2 text-center">
                                  <div className="flex justify-center gap-1">
                                    <button onClick={() => handleSaveEdit(entry.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={14} /></button>
                                    <button onClick={() => setEditingEntry(null)} className="p-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"><X size={14} /></button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-4 text-slate-600 font-medium">{entry.date}</td>
                                <td className="p-4 text-slate-800 font-medium">{entry.description}</td>
                                <td className="p-4 text-right text-slate-600">{entry.weight || '-'}</td>
                                <td className="p-4 text-right text-slate-600">{entry.rate || '-'}</td>
                                <td className="p-4 text-right font-bold text-rose-600">{entry.debit > 0 ? `Rs ${entry.debit.toLocaleString()}` : '-'}</td>
                                <td className="p-4 text-right font-bold text-emerald-600">{entry.credit > 0 ? `Rs ${entry.credit.toLocaleString()}` : '-'}</td>
                                <td className="p-4 text-right font-bold text-slate-700">
                                  {Math.abs(renderRunningBalance).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{renderRunningBalance >= 0 ? 'REC' : 'ADV'}</span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditEntry(entry)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"><Trash2 size={14} /></button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="8" className="p-8 text-center text-slate-400">No ledger entries found.</td></tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <tr>
                      <td colSpan="4" className="p-4 text-right text-slate-600 uppercase text-xs tracking-wider">Totals</td>
                      <td className="p-4 text-right text-rose-700">Rs {selectedCustomer.ledger?.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString()}</td>
                      <td className="p-4 text-right text-emerald-700">Rs {selectedCustomer.ledger?.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString()}</td>
                      <td colSpan="2"></td>
                    </tr>
                    <tr className={calculateCustomerBalance(selectedCustomer) >= 0 ? "bg-blue-50" : "bg-emerald-50"}>
                      <td colSpan="6" className="p-4 text-right text-slate-700 uppercase text-xs tracking-wider">Net Balance</td>
                      <td colSpan="2" className={`p-4 text-right text-lg font-extrabold ${calculateCustomerBalance(selectedCustomer) >= 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
                        Rs {Math.abs(calculateCustomerBalance(selectedCustomer)).toLocaleString()}
                        <span className="text-xs font-medium ml-2 opacity-80">{calculateCustomerBalance(selectedCustomer) >= 0 ? '(RECEIVABLE)' : '(ADVANCE)'}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={printLedger} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <Printer size={18} /> Print Ledger
              </button>
              <button onClick={() => setShowLedger(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showEntryModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-start">
              <div><h3 className="text-xl font-bold">Add Ledger Entry</h3><p className="text-slate-300 text-sm mt-1">Manual Adjustment / Opening Balance</p></div>
              <button onClick={() => setShowEntryModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                 <button onClick={() => setEntryForm({...entryForm, type: "debit"})} className={`py-2 rounded-lg text-sm font-bold transition-all ${entryForm.type === "debit" ? "bg-white shadow-sm text-rose-700" : "text-slate-500 hover:bg-white/50"}`}>Debit (Receivable)</button>
                 <button onClick={() => setEntryForm({...entryForm, type: "credit"})} className={`py-2 rounded-lg text-sm font-bold transition-all ${entryForm.type === "credit" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500 hover:bg-white/50"}`}>Credit (Received)</button>
              </div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (PKR)</label><div className="relative"><DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="number" value={entryForm.amount} onChange={e => setEntryForm({...entryForm, amount: e.target.value})} className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 outline-none transition-all ${entryForm.type === 'debit' ? 'focus:ring-rose-500/20 focus:border-rose-500 border-rose-100' : 'focus:ring-emerald-500/20 focus:border-emerald-500 border-emerald-100'}`} placeholder="0.00" /></div></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="date" value={entryForm.date} onChange={e => setEntryForm({...entryForm, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium" /></div></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label><input type="text" placeholder="e.g. Opening Balance" value={entryForm.description} onChange={e => setEntryForm({...entryForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium" /></div>
              <button onClick={handleAddEntry} className={`w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${entryForm.type === 'debit' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}><CheckCircle size={18} /> {entryForm.type === 'debit' ? 'Add Debit Entry' : 'Add Credit Entry'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start">
              <div><h3 className="text-xl font-bold">Receive Payment</h3><p className="text-blue-100 text-sm mt-1">From {selectedCustomer.name}</p></div>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (PKR)</label><div className="relative"><DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="0.00" /></div></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" /></div></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Note / Description</label><input type="text" placeholder="e.g. Cash Received" value={paymentForm.description} onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" /></div>
              <button onClick={handleReceivePayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2"><CheckCircle size={18} /> Confirm Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* Contra Modal - NEW */}
      {showContraModal && selectedCustomer && matchingSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in border border-purple-200">
            <div className="bg-purple-700 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><ArrowLeftRight size={20} /> Contra Settlement</h3>
                <p className="text-purple-100 text-sm mt-1">Offset Customer vs Supplier Balance</p>
              </div>
              <button onClick={() => setShowContraModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-xs text-purple-800 leading-relaxed">
                This action will <strong>Credit</strong> (reduce receivable) for <strong>{selectedCustomer.name}</strong> and <strong>Debit</strong> (reduce payable) for <strong>{matchingSupplier.name}</strong> simultaneously.
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Offset Amount (PKR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={contraForm.amount} 
                    onChange={e => setContraForm({...contraForm, amount: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <input 
                  type="date" 
                  value={contraForm.date} 
                  onChange={e => setContraForm({...contraForm, date: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                />
              </div>

              <button 
                onClick={handleContraSettlement} 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Processing..." : <><CheckCircle size={18} /> Confirm Offset</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}