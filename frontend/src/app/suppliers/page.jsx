"use client";
import { useState, useEffect } from "react";
import { Plus, Truck, Phone, MapPin, Eye, Trash2, Search, X, FileText, TrendingUp, TrendingDown, Edit2, Save } from "lucide-react";

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

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/suppliers`);
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      alert("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) {
      alert("Please enter supplier name");
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
        alert(result.message);
        setForm({ name: "", phone: "", city: "" });
        setShowForm(false);
        fetchSuppliers();
      } else {
        alert(result.error || "Failed to add supplier");
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      alert("Failed to add supplier");
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
        alert(result.message);
        fetchSuppliers();
      } else {
        alert(result.error || "Failed to delete supplier");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Failed to delete supplier");
    }
  };

  const handleMakePayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert("Please enter a valid amount");
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
        alert(result.message);
        setPaymentForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "" });
        setShowPaymentModal(false);
        fetchSuppliers();
        
        const updatedSupplier = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`);
        const supplierData = await updatedSupplier.json();
        setSelectedSupplier(supplierData);
      } else {
        alert(result.error || "Failed to process payment");
      }
    } catch (error) {
      console.error("Error making payment:", error);
      alert("Failed to process payment");
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
        alert(result.message);
        setEditingEntry(null);
        fetchSuppliers();
        
        const updatedSupplier = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`);
        const supplierData = await updatedSupplier.json();
        setSelectedSupplier(supplierData);
      } else {
        alert(result.error || "Failed to update entry");
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update entry");
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
        alert(result.message);
        fetchSuppliers();
        
        const updatedSupplier = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`);
        const supplierData = await updatedSupplier.json();
        setSelectedSupplier(supplierData);
      } else {
        alert(result.error || "Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-8">
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

                  <div className={`p-4 rounded-xl mb-4 ${balance >= 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Balance</span>
                      {balance >= 0 ? <TrendingDown className="text-red-600" size={20} /> : <TrendingUp className="text-green-600" size={20} />}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                      ₨{Math.abs(balance).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {balance >= 0 ? 'Payable' : 'Paid'}
                    </div>
                  </div>

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
                      <span>₨</span> Pay
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

      {showLedger && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Supplier Ledger</h2>
                <p className="text-emerald-100 mt-1">{selectedSupplier.name}</p>
              </div>
              <button 
                onClick={() => {
                  setShowLedger(false);
                  setEditingEntry(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
                        <th className="p-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSupplier.ledger.map((entry, idx) => (
                        <tr key={entry.id || idx} className="border-t border-slate-200 hover:bg-slate-50">
                          {editingEntry === entry.id ? (
                            <>
                              <td className="p-2">
                                <input 
                                  type="date"
                                  value={editForm.date}
                                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                  className="w-full border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="text"
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  className="w-full border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="text"
                                  value={editForm.weight}
                                  onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                                  className="w-full border rounded px-2 py-1 text-sm text-right"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="text"
                                  value={editForm.rate}
                                  onChange={(e) => setEditForm({...editForm, rate: e.target.value})}
                                  className="w-full border rounded px-2 py-1 text-sm text-right"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="number"
                                  value={editForm.debit}
                                  onChange={(e) => setEditForm({...editForm, debit: e.target.value})}
                                  className="w-full border rounded px-2 py-1 text-sm text-right"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="number"
                                  value={editForm.credit}
                                  onChange={(e) => setEditForm({...editForm, credit: e.target.value})}
                                  className="w-full border rounded px-2 py-1 text-sm text-right"
                                />
                              </td>
                              <td className="p-2">
                                <div className="flex justify-center gap-1">
                                  <button 
                                    onClick={() => handleSaveEdit(entry.id)}
                                    className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded transition-all"
                                  >
                                    <Save size={14} />
                                  </button>
                                  <button 
                                    onClick={() => setEditingEntry(null)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 text-sm text-slate-700">{entry.date}</td>
                              <td className="p-4 text-sm text-slate-700">{entry.description}</td>
                              <td className="p-4 text-sm text-slate-700 text-right">{entry.weight}</td>
                              <td className="p-4 text-sm text-slate-700 text-right">{entry.rate}</td>
                              <td className="p-4 text-sm font-semibold text-red-600 text-right">{entry.debit || '-'}</td>
                              <td className="p-4 text-sm font-semibold text-green-600 text-right">{entry.credit || '-'}</td>
                              <td className="p-4">
                                <div className="flex justify-center gap-1">
                                  <button 
                                    onClick={() => handleEditEntry(entry)}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded transition-all"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
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
                        <td></td>
                      </tr>
                      <tr className="bg-slate-50 font-bold border-t border-slate-300">
                        <td colSpan="5" className="p-4 text-right text-slate-700">Balance</td>
                        <td colSpan="2" className={`p-4 text-right ${calculateBalance(selectedSupplier) >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                          ₨{Math.abs(calculateBalance(selectedSupplier)).toFixed(2)} {calculateBalance(selectedSupplier) >= 0 ? '(Payable)' : '(Paid)'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-slate-500 mt-4">No ledger entries found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Make Payment to {selectedSupplier.name}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 hover:text-slate-800">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input 
                type="number" 
                placeholder="Amount" 
                value={paymentForm.amount} 
                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input 
                type="date" 
                value={paymentForm.date} 
                onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} 
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input 
                type="text" 
                placeholder="Description" 
                value={paymentForm.description} 
                onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} 
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button 
                onClick={handleMakePayment} 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-full py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Pay ₨{paymentForm.amount || '0'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}