"use client";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Truck, 
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
  CheckCircle,
  AlertCircle,
  Wallet,
  Calendar,
  DollarSign
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [notification, setNotification] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/suppliers`);
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showNotification("Failed to load suppliers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      showNotification("Please enter supplier name", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setForm({ name: "", phone: "", city: "" });
        setShowForm(false);
        fetchSuppliers();
      } else {
        showNotification(result.error || "Failed to add supplier", "error");
      }
    } catch (error) {
      showNotification("Failed to add supplier", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        fetchSuppliers();
      } else {
        showNotification(result.error || "Failed to delete supplier", "error");
      }
    } catch (error) {
      showNotification("Failed to delete supplier", "error");
    }
  };

  const handleMakePayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setPaymentForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
        setShowPaymentModal(false);
        fetchSuppliers();
        
        // Refresh selected supplier data if ledger is open
        const updatedSupplier = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`);
        const supplierData = await updatedSupplier.json();
        setSelectedSupplier(supplierData);
      } else {
        showNotification(result.error || "Failed to process payment", "error");
      }
    } catch (error) {
      showNotification("Failed to process payment", "error");
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
      const response = await fetch(`${API_URL}/suppliers/ledger/${ledgerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setEditingEntry(null);
        fetchSuppliers();
        
        const updatedSupplier = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`);
        const supplierData = await updatedSupplier.json();
        setSelectedSupplier(supplierData);
      } else {
        showNotification(result.error || "Failed to update entry", "error");
      }
    } catch (error) {
      showNotification("Failed to update entry", "error");
    }
  };

  const handleDeleteEntry = async (ledgerId) => {
    if (!confirm("Are you sure you want to delete this ledger entry?")) return;

    try {
      const response = await fetch(`${API_URL}/suppliers/ledger/${ledgerId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        fetchSuppliers();
        
        const updatedSupplier = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`);
        const supplierData = await updatedSupplier.json();
        setSelectedSupplier(supplierData);
      } else {
        showNotification(result.error || "Failed to delete entry", "error");
      }
    } catch (error) {
      showNotification("Failed to delete entry", "error");
    }
  };

  const calculateBalance = (supplier) => {
    const ledger = supplier.ledger || [];
    const totalDebit = ledger.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = ledger.reduce((sum, e) => sum + (e.credit || 0), 0);
    return totalCredit - totalDebit;
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.includes(searchTerm)) ||
    (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

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

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-200 text-white">
                <Truck size={24} />
              </span>
              Supplier Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Manage suppliers and track payment ledgers</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-emerald-200 transition-all transform hover:scale-105"
          >
            <Plus size={18} /> {showForm ? "Close Form" : "Add Supplier"}
          </button>
        </div>
      </div>

      {/* Add Supplier Form */}
      {showForm && (
        <div className="relative z-10 mb-8 animate-slide-in">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">New Supplier</h3>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label>
                  <input 
                    placeholder="e.g. Ali Traders" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input 
                    placeholder="0300-1234567" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">City</label>
                  <input 
                    placeholder="Lahore" 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all">
                  Save Supplier
                </button>
                <button onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all">
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
            type="text" 
            placeholder="Search suppliers..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium placeholder:text-slate-400"
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl shadow-lg p-12 text-center">
            <Truck className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-500 font-medium">No suppliers found</p>
          </div>
        ) : (
          filtered.map((supplier) => {
            const balance = calculateBalance(supplier);
            return (
              <div key={supplier.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                      <Truck size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{supplier.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {supplier.city || "No City"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(supplier.id)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><Phone size={14} className="text-emerald-500" /> Phone</span>
                    <span className="font-medium">{supplier.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><FileText size={14} className="text-emerald-500" /> Transactions</span>
                    <span className="font-medium">{supplier.ledger?.length || 0}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl mb-5 border ${balance >= 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${balance >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Current Balance</span>
                    {balance >= 0 ? <TrendingDown className="text-rose-500" size={18} /> : <TrendingUp className="text-emerald-500" size={18} />}
                  </div>
                  <div className={`text-2xl font-extrabold mt-1 ${balance >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    ₨{Math.abs(balance).toLocaleString()}
                  </div>
                  <div className={`text-[10px] font-bold mt-1 uppercase ${balance >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {balance >= 0 ? 'Payable Amount' : 'Advance / Paid'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowLedger(true);
                    }}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm"
                  >
                    <Eye size={16} /> Ledger
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    <Wallet size={16} /> Pay
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ledger Modal */}
      {showLedger && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20 overflow-hidden animate-scale-in">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedSupplier.name}</h2>
                  <p className="text-slate-500 text-sm font-medium">Transaction Ledger</p>
                </div>
              </div>
              <button onClick={() => { setShowLedger(false); setEditingEntry(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
                  <p className="font-bold text-slate-700 mt-1">{selectedSupplier.phone || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">City</p>
                  <p className="font-bold text-slate-700 mt-1">{selectedSupplier.city || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Total Transactions</p>
                  <p className="font-bold text-slate-700 mt-1">{selectedSupplier.ledger?.length || 0}</p>
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
                      <th className="p-4 text-right text-rose-600">Debit</th>
                      <th className="p-4 text-right text-emerald-600">Credit</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSupplier.ledger && selectedSupplier.ledger.length > 0 ? (
                      selectedSupplier.ledger.map((entry, idx) => (
                        <tr key={entry.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                          {editingEntry === entry.id ? (
                            <>
                              <td className="p-2"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
                              <td className="p-2"><input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
                              <td className="p-2"><input type="number" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
                              <td className="p-2"><input type="number" value={editForm.rate} onChange={(e) => setEditForm({...editForm, rate: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
                              <td className="p-2"><input type="number" value={editForm.debit} onChange={(e) => setEditForm({...editForm, debit: e.target.value})} className="w-full border border-rose-200 rounded p-1 text-right text-rose-600" /></td>
                              <td className="p-2"><input type="number" value={editForm.credit} onChange={(e) => setEditForm({...editForm, credit: e.target.value})} className="w-full border border-emerald-200 rounded p-1 text-right text-emerald-600" /></td>
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
                              <td className="p-4 text-right text-slate-600">{entry.weight}</td>
                              <td className="p-4 text-right text-slate-600">{entry.rate}</td>
                              <td className="p-4 text-right font-bold text-rose-600">{entry.debit > 0 ? `₨${entry.debit.toLocaleString()}` : '-'}</td>
                              <td className="p-4 text-right font-bold text-emerald-600">{entry.credit > 0 ? `₨${entry.credit.toLocaleString()}` : '-'}</td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditEntry(entry)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-400">No ledger entries found.</td></tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <tr>
                      <td colSpan="4" className="p-4 text-right text-slate-600 uppercase text-xs tracking-wider">Totals</td>
                      <td className="p-4 text-right text-rose-700">
                        ₨{selectedSupplier.ledger?.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right text-emerald-700">
                        ₨{selectedSupplier.ledger?.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr className={calculateBalance(selectedSupplier) >= 0 ? "bg-rose-50" : "bg-emerald-50"}>
                      <td colSpan="5" className="p-4 text-right text-slate-700 uppercase text-xs tracking-wider">Net Balance</td>
                      <td colSpan="2" className={`p-4 text-right text-lg font-extrabold ${calculateBalance(selectedSupplier) >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        ₨{Math.abs(calculateBalance(selectedSupplier)).toLocaleString()}
                        <span className="text-xs font-medium ml-2 opacity-80">
                          {calculateBalance(selectedSupplier) >= 0 ? '(PAYABLE)' : '(PAID)'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Record Payment</h3>
                <p className="text-emerald-100 text-sm mt-1">To {selectedSupplier.name}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (PKR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={paymentForm.amount} 
                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    value={paymentForm.date} 
                    onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Note / Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cash Payment" 
                  value={paymentForm.description} 
                  onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>

              <button 
                onClick={handleMakePayment} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle size={18} /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}