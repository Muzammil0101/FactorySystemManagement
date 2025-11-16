// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { Plus, Truck, Phone, MapPin, Eye, Trash2, Search } from "lucide-react";

// export default function SuppliersPage() {
//   const [suppliers, setSuppliers] = useState([
//     { id: 1, name: "Hassan Traders", phone: "0300-9876543", city: "Karachi" },
//     { id: 2, name: "Al-Faisal Imports", phone: "0311-1122334", city: "Lahore" },
//   ]);
  
//   const [form, setForm] = useState({ name: "", phone: "", city: "" });
//   const [showForm, setShowForm] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const handleAdd = () => {
//     if (!form.name) {
//       alert("Please enter supplier name");
//       return;
//     }
//     setSuppliers([...suppliers, { id: Date.now(), ...form }]);
//     setForm({ name: "", phone: "", city: "" });
//     setShowForm(false);
//   };

//   const handleDelete = (id) => {
//     if (confirm("Are you sure you want to delete this supplier?")) {
//       setSuppliers(suppliers.filter((s) => s.id !== id));
//     }
//   };

//   const filteredSuppliers = suppliers.filter((s) =>
//     s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     s.phone.includes(searchTerm) ||
//     s.city.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b border-slate-200">
//         <div className="max-w-7xl mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="bg-green-100 p-3 rounded-lg">
//                 <Truck className="text-green-600" size={28} />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-slate-800">Suppliers</h1>
//                 <p className="text-slate-500 mt-1">
//                   Manage your supplier database
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setShowForm(!showForm)}
//               className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
//             >
//               <Plus size={20} />
//               Add Supplier
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Stats Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-slate-500 text-sm font-medium">
//                 Total Suppliers
//               </p>
//               <p className="text-3xl font-bold text-slate-800 mt-1">
//                 {suppliers.length}
//               </p>
//             </div>
//             <div className="bg-green-50 p-4 rounded-lg">
//               <Truck className="text-green-600" size={32} />
//             </div>
//           </div>
//         </div>

//         {/* Add Supplier Form */}
//         {showForm && (
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
//             <h3 className="text-lg font-semibold text-slate-800 mb-4">
//               Add New Supplier
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Supplier Name *
//                 </label>
//                 <input
//                   placeholder="Enter supplier name"
//                   className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   <Phone size={16} className="inline mr-1" />
//                   Phone Number
//                 </label>
//                 <input
//                   placeholder="03XX-XXXXXXX"
//                   className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//                   value={form.phone}
//                   onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   <MapPin size={16} className="inline mr-1" />
//                   City
//                 </label>
//                 <input
//                   placeholder="Enter city"
//                   className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//                   value={form.city}
//                   onChange={(e) => setForm({ ...form, city: e.target.value })}
//                 />
//               </div>
//             </div>
//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={handleAdd}
//                 className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
//               >
//                 Add Supplier
//               </button>
//               <button
//                 onClick={() => setShowForm(false)}
//                 className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Search Bar */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
//           <div className="relative">
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
//               size={20}
//             />
//             <input
//               type="text"
//               placeholder="Search by name, phone, or city..."
//               className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Supplier Table */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-200">
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                     Sr
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                     Phone
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                     City
//                   </th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-200">
//                 {filteredSuppliers.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-12 text-center">
//                       <Truck className="mx-auto text-slate-300 mb-3" size={48} />
//                       <p className="text-slate-500 font-medium">
//                         {searchTerm
//                           ? "No suppliers found matching your search"
//                           : "No suppliers added yet"}
//                       </p>
//                       <p className="text-slate-400 text-sm mt-1">
//                         {!searchTerm && "Click 'Add Supplier' to get started"}
//                       </p>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredSuppliers.map((s, index) => (
//                     <tr
//                       key={s.id}
//                       className="hover:bg-slate-50 transition-colors"
//                     >
//                       <td className="px-6 py-4 text-sm text-slate-600 font-medium">
//                         {index + 1}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-slate-800 font-semibold">
//                         {s.name}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-slate-600">
//                         <div className="flex items-center gap-2">
//                           <Phone size={14} className="text-slate-400" />
//                           {s.phone || "-"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-slate-600">
//                         <div className="flex items-center gap-2">
//                           <MapPin size={14} className="text-slate-400" />
//                           {s.city || "-"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           <Link
//                             href={`/suppliers/ledger/${s.id}?name=${encodeURIComponent(
//                               s.name
//                             )}`}
//                             className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
//                           >
//                             <Eye size={14} />
//                             View Ledger
//                           </Link>
//                           <button
//                             onClick={() => handleDelete(s.id)}
//                             className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
//                             title="Delete supplier"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-6 text-center text-sm text-slate-500">
//           <p>
//             Showing {filteredSuppliers.length} of {suppliers.length} suppliers
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

//new
"use client";
import { useState, useEffect } from "react";
import { Plus, Truck, Phone, MapPin, Eye, Trash2, Search, DollarSign, X, Calendar, FileText, TrendingUp, TrendingDown } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });

  useEffect(() => {
    const saved = localStorage.getItem("suppliers");
    if (saved) {
      setSuppliers(JSON.parse(saved));
    }
  }, []);

  const saveSuppliers = (data) => {
    localStorage.setItem("suppliers", JSON.stringify(data));
    setSuppliers(data);
  };

  const handleAdd = () => {
    if (!form.name.trim()) {
      alert("Please enter supplier name");
      return;
    }

    const newSupplier = { id: Date.now(), ...form, ledger: [] };
    const updated = [...suppliers, newSupplier];
    saveSuppliers(updated);

    setForm({ name: "", phone: "", city: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    const updated = suppliers.filter(s => s.id !== id);
    saveSuppliers(updated);
  };

  const handleMakePayment = () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const updated = suppliers.map(s => {
      if (s.id === selectedSupplier.id) {
        const newEntry = {
          id: Date.now(),
          date: paymentForm.date,
          description: paymentForm.description || "Payment Made",
          weight: "-",
          rate: "-",
          debit: parseFloat(paymentForm.amount),
          credit: 0
        };
        return { ...s, ledger: [...(s.ledger || []), newEntry] };
      }
      return s;
    });

    saveSuppliers(updated);
    setSelectedSupplier(updated.find(s => s.id === selectedSupplier.id));
    setPaymentForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
    setShowPaymentModal(false);
  };

  const calculateBalance = (supplier) => {
    const ledger = supplier.ledger || [];
    const totalDebit = ledger.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = ledger.reduce((sum, e) => sum + (e.credit || 0), 0);
    return totalCredit - totalDebit; // For suppliers: credit (what we owe) - debit (what we paid)
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.includes(searchTerm)) ||
    (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const printLedger = () => {
    if (!selectedSupplier) return;
    
    const ledger = selectedSupplier.ledger || [];
    let totalDebit = 0, totalCredit = 0;
    
    let ledgerHTML = `
      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        <thead style="background:#f1f5f9;">
          <tr>
            <th style="padding:12px;border:1px solid #e2e8f0;text-align:left;">Date</th>
            <th style="padding:12px;border:1px solid #e2e8f0;text-align:left;">Description</th>
            <th style="padding:12px;border:1px solid #e2e8f0;text-align:right;">Weight</th>
            <th style="padding:12px;border:1px solid #e2e8f0;text-align:right;">Rate</th>
            <th style="padding:12px;border:1px solid #e2e8f0;text-align:right;">Debit</th>
            <th style="padding:12px;border:1px solid #e2e8f0;text-align:right;">Credit</th>
          </tr>
        </thead>
        <tbody>
    `;

    ledger.forEach(entry => {
      totalDebit += entry.debit || 0;
      totalCredit += entry.credit || 0;
      ledgerHTML += `
        <tr>
          <td style="padding:10px;border:1px solid #e2e8f0;">${entry.date}</td>
          <td style="padding:10px;border:1px solid #e2e8f0;">${entry.description}</td>
          <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">${entry.weight}</td>
          <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">${entry.rate}</td>
          <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;color:#dc2626;">${entry.debit || '-'}</td>
          <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;color:#16a34a;">${entry.credit || '-'}</td>
        </tr>
      `;
    });

    const balance = totalCredit - totalDebit;
    ledgerHTML += `
        </tbody>
        <tfoot style="background:#f8fafc;font-weight:600;">
          <tr>
            <td colspan="4" style="padding:12px;text-align:right;border:1px solid #e2e8f0;">Total</td>
            <td style="padding:12px;text-align:right;color:#dc2626;border:1px solid #e2e8f0;">${totalDebit.toFixed(2)}</td>
            <td style="padding:12px;text-align:right;color:#16a34a;border:1px solid #e2e8f0;">${totalCredit.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="5" style="padding:12px;text-align:right;border:1px solid #e2e8f0;">Balance</td>
            <td style="padding:12px;text-align:right;color:${balance>=0?'#dc2626':'#16a34a'};border:1px solid #e2e8f0;font-size:16px;">
              ${Math.abs(balance).toFixed(2)} ${balance>=0?'(Payable)':'(Paid)'}
            </td>
          </tr>
        </tfoot>
      </table>
    `;

    const popup = window.open('', '_blank', 'width=900,height=700');
    popup.document.write(`
      <html>
        <head>
          <title>Ledger - ${selectedSupplier.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:30px; background:#fff; }
            h1 { color:#1e293b; border-bottom:3px solid #10b981; padding-bottom:10px; }
            .info { background:#f8fafc; padding:15px; border-radius:8px; margin:20px 0; }
            .info p { margin:5px 0; color:#475569; }
          </style>
        </head>
        <body>
          <h1>Supplier Ledger</h1>
          <div class="info">
            <p><strong>Supplier Name:</strong> ${selectedSupplier.name}</p>
            <p><strong>Phone:</strong> ${selectedSupplier.phone || 'N/A'}</p>
            <p><strong>City:</strong> ${selectedSupplier.city || 'N/A'}</p>
            <p><strong>Print Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          ${ledgerHTML}
          <div style="margin-top:30px;text-align:center;">
            <button onclick="window.print()" style="padding:12px 30px;background:#10b981;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:500;">
              Print Ledger
            </button>
          </div>
        </body>
      </html>
    `);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
              <Truck className="text-white" size={32} />
            </div>
            Supplier Management
          </h1>
          <p className="text-slate-600 mt-2 ml-1">Manage your suppliers and track payments</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus size={20} /> Add Supplier
        </button>
      </div>

      {/* Add Supplier Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-8 border border-white/50">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">New Supplier Details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <input 
              placeholder="Supplier Name *" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white/70 backdrop-blur-sm"
            />
            <input 
              placeholder="Phone Number" 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})} 
              className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white/70 backdrop-blur-sm"
            />
            <input 
              placeholder="City" 
              value={form.city} 
              onChange={e => setForm({...form, city: e.target.value})} 
              className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white/70 backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleAdd} 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Add Supplier
            </button>
            <button 
              onClick={() => setShowForm(false)} 
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-8 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg mb-6 border border-white/50">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, phone, or city..." 
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white/70"
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/50">
            <Truck className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-500 text-lg">No suppliers found</p>
          </div>
        ) : (
          filtered.map((supplier) => {
            const balance = calculateBalance(supplier);
            return (
              <div key={supplier.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 overflow-hidden group">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Truck size={20} />
                    {supplier.name}
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    {supplier.phone && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <Phone size={16} className="text-emerald-500" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.city && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <MapPin size={16} className="text-emerald-500" />
                        <span>{supplier.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-600">
                      <FileText size={16} className="text-emerald-500" />
                      <span>{supplier.ledger?.length || 0} Transactions</span>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className={`p-4 rounded-xl mb-4 ${balance >= 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Balance</span>
                      {balance >= 0 ? <TrendingDown className="text-red-600" size={20} /> : <TrendingUp className="text-green-600" size={20} />}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                      ${Math.abs(balance).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {balance >= 0 ? 'Payable' : 'Paid'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowLedger(true);
                      }}
                      className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowPaymentModal(true);
                      }}
                      className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
                    >
                      <DollarSign size={16} /> Pay
                    </button>
                    <button 
                      onClick={() => handleDelete(supplier.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ledger Modal */}
      {showLedger && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Supplier Ledger</h2>
                <p className="text-emerald-100 mt-1">{selectedSupplier.name}</p>
              </div>
              <button 
                onClick={() => setShowLedger(false)}
                className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Supplier Info */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-semibold text-slate-800">{selectedSupplier.phone || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-600">City</p>
                  <p className="font-semibold text-slate-800">{selectedSupplier.city || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-600">Total Transactions</p>
                  <p className="font-semibold text-slate-800">{selectedSupplier.ledger?.length || 0}</p>
                </div>
              </div>

              {/* Ledger Table */}
              {selectedSupplier.ledger && selectedSupplier.ledger.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-slate-700">Date</th>
                        <th className="p-4 text-left text-sm font-semibold text-slate-700">Description</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-700">Weight</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-700">Rate</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-700">Debit</th>
                        <th className="p-4 text-right text-sm font-semibold text-slate-700">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSupplier.ledger.map((entry, idx) => (
                        <tr key={entry.id || idx} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="p-4 text-sm text-slate-700">{entry.date}</td>
                          <td className="p-4 text-sm text-slate-700">{entry.description}</td>
                          <td className="p-4 text-sm text-slate-700 text-right">{entry.weight}</td>
                          <td className="p-4 text-sm text-slate-700 text-right">{entry.rate}</td>
                          <td className="p-4 text-sm font-semibold text-red-600 text-right">{entry.debit || '-'}</td>
                          <td className="p-4 text-sm font-semibold text-green-600 text-right">{entry.credit || '-'}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                        <td colSpan="4" className="p-4 text-right text-slate-700">Total</td>
                        <td className="p-4 text-right text-red-600">
                          {selectedSupplier.ledger.reduce((sum, e) => sum + (e.debit || 0), 0).toFixed(2)}
                        </td>
                        <td className="p-4 text-right text-green-600">
                          {selectedSupplier.ledger.reduce((sum, e) => sum + (e.credit || 0), 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td colSpan="5" className="p-4 text-right text-slate-700">Balance</td>
                        <td className={`p-4 text-right text-lg ${calculateBalance(selectedSupplier) >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                          ${Math.abs(calculateBalance(selectedSupplier)).toFixed(2)} {calculateBalance(selectedSupplier) >= 0 ? '(Payable)' : '(Paid)'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500">No transactions yet</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={printLedger}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Print Ledger
              </button>
              <button 
                onClick={() => setShowLedger(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Make Payment</h2>
                  <p className="text-orange-100 mt-1">{selectedSupplier.name}</p>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount *</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount" 
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={paymentForm.date}
                    onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <input 
                    type="text" 
                    placeholder="Payment description (optional)" 
                    value={paymentForm.description}
                    onChange={e => setPaymentForm({...paymentForm, description: e.target.value})}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleMakePayment}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Make Payment
                </button>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}