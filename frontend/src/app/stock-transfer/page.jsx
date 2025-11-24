"use client";
import { useState, useEffect } from "react";
import { Package, Calendar, ArrowRight, RefreshCw, CheckCircle, AlertCircle, X, Lock, ClipboardList, Flag } from "lucide-react";

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
  const [checklistOpen, setChecklistOpen] = useState(false);
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
      
      const categoriesWithStock = data.filter(cat => cat.currentStock > 0);
      
      setCategories(categoriesWithStock);
      
      setTransferData(categoriesWithStock.map(cat => ({
        description: cat.name,
        weight: cat.currentStock,
        rate: 0,
        amount: 0,
        supplier: "Opening Balance",
        transferEnabled: false
      })));
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification("Error loading data", "error");
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
    updated[index].amount = (parseFloat(value) * updated[index].weight).toFixed(2);
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
      showNotification("Please select items and enter rates to transfer", "error");
      return;
    }

    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of itemsToTransfer) {
        try {
          const res = await fetch(`${API_URL}/stock/stock-in`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: transferDate,
              description: item.description,
              weight: item.weight,
              rate: item.rate,
              amount: item.amount,
              supplier: item.supplier,
              isTransfer: true,
              fromMonth: currentMonth,
              toMonth: transferDate.slice(0, 7)
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
        // Record closure in history
        const newClosure = {
          month: currentMonth,
          closureDate: new Date().toISOString().split('T')[0],
          itemsTransferred: successCount,
          totalWeight: itemsToTransfer.reduce((sum, item) => sum + parseFloat(item.weight), 0),
          totalAmount: itemsToTransfer.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
        };
        
        const updated = [...closureHistory, newClosure];
        setClosureHistory(updated);
        localStorage.setItem('closureHistory', JSON.stringify(updated));

        showNotification(`✅ Month ${currentMonth} successfully closed! Transferred ${successCount} items`, "success");
        
        // Reset
        setClosureChecklist({
          invoicesReceived: false,
          physicalCountDone: false,
          discrepanciesResolved: false,
        });
        await fetchCategoriesWithStock();
      } else {
        showNotification(`⚠️ Transferred ${successCount} items, ${errorCount} failed`, "error");
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
    .reduce((sum, item) => sum + parseFloat(item.weight), 0);
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
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-10">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          notification.type === "success" 
            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
            : "bg-gradient-to-r from-red-500 to-rose-500"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle className="text-white" size={24} />
          ) : (
            <AlertCircle className="text-white" size={24} />
          )}
          <p className="text-white font-medium">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-all ml-2"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-lg">
            <RefreshCw className="text-white" size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-800">Month-End Stock Transfer</h1>
        <p className="text-slate-600 mt-2">Close current month & carry forward remaining stock</p>
      </div>

      {/* Month Selection */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 mb-6 border border-white/50">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Lock className="text-indigo-600" size={18} />
              Current Month to Close
            </label>
            <input 
              type="month" 
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold"
            />
            <p className="text-xs text-slate-500 mt-2">Select the month you want to close</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={18} />
              Transfer Date (Opening Balance Date)
            </label>
            <input 
              type="date" 
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold"
            />
            <p className="text-xs text-slate-500 mt-2">Suggested: 5-7 days after month end</p>
          </div>
        </div>
      </div>

      {/* Closure Checklist */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setChecklistOpen(!checklistOpen)}>
          <div className="flex items-center gap-3">
            <ClipboardList className="text-amber-600" size={24} />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Pre-Closure Checklist</h3>
              <p className="text-sm text-amber-700">All items must be checked before closing month</p>
            </div>
          </div>
          <Flag className={`text-amber-600 transform transition-transform ${checklistOpen ? 'rotate-90' : ''}`} size={20} />
        </div>

        {checklistOpen && (
          <div className="space-y-3 pt-4 border-t border-amber-300">
            <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
              <input 
                type="checkbox"
                checked={closureChecklist.invoicesReceived}
                onChange={() => handleChecklistChange('invoicesReceived')}
                className="w-5 h-5 rounded text-amber-600 focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-slate-700 font-medium">All supplier invoices received & verified</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
              <input 
                type="checkbox"
                checked={closureChecklist.physicalCountDone}
                onChange={() => handleChecklistChange('physicalCountDone')}
                className="w-5 h-5 rounded text-amber-600 focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-slate-700 font-medium">Physical stock count completed</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
              <input 
                type="checkbox"
                checked={closureChecklist.discrepanciesResolved}
                onChange={() => handleChecklistChange('discrepanciesResolved')}
                className="w-5 h-5 rounded text-amber-600 focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-slate-700 font-medium">All discrepancies resolved & documented</span>
            </label>

            {allChecklistsComplete() && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 mt-4">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-green-700 font-medium">✅ Ready to close month!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Card */}
      {totalSelectedItems > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm opacity-90">Items Selected</p>
              <p className="text-3xl font-bold">{totalSelectedItems}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Total Weight</p>
              <p className="text-3xl font-bold">{totalSelectedWeight.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Total Amount</p>
              <p className="text-3xl font-bold">${totalSelectedAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stock Items */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border border-white/50 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package size={24} />
            Remaining Stock Items
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            Select items and enter rates to transfer to {getNextMonth()}
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-3" size={32} />
              <p className="text-slate-600">Loading stock data...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-lg">No remaining stock to transfer</p>
              <p className="text-slate-400 text-sm mt-2">All stock has been sold or transferred</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transferData.map((item, index) => (
                <div 
                  key={index}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    item.transferEnabled 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      <input 
                        type="checkbox"
                        checked={item.transferEnabled}
                        onChange={() => toggleTransfer(index)}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex-1 grid md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                        <p className="font-bold text-slate-800">{item.description}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
                        <p className="font-semibold text-indigo-700">{item.weight.toFixed(2)}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Rate *</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleRateChange(index, e.target.value)}
                          disabled={!item.transferEnabled}
                          placeholder="0.00"
                          className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
                        <p className="font-semibold text-green-700 text-lg">
                          ${item.amount || '0.00'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Supplier</label>
                        <p className="text-sm text-slate-700">{item.supplier}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Button */}
      {categories.length > 0 && (
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleTransferAll}
            disabled={loading || totalSelectedItems === 0 || !allChecklistsComplete()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={24} />
                Processing...
              </>
            ) : (
              <>
                <Lock size={24} />
                Close Month & Transfer {totalSelectedItems} Item{totalSelectedItems !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Closure History */}
      {closureHistory.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/50">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Month Closure History
          </h3>
          <div className="space-y-3">
            {closureHistory.slice().reverse().map((closure, idx) => (
              <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">Month {closure.month}</p>
                    <p className="text-sm text-slate-600">Closed on {closure.closureDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-700">{closure.itemsTransferred} items transferred</p>
                    <p className="font-semibold text-green-700">{closure.totalWeight.toFixed(2)} kg • ${closure.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle size={20} />
          Best Practice: 5-7 Days Grace Period
        </h4>
        <ul className="text-sm text-blue-800 space-y-2 ml-6">
          <li>• Complete pre-closure checklist to ensure accuracy</li>
          <li>• Set transfer date 5-7 days after month end (not immediately)</li>
          <li>• This allows time for delayed invoices & last-minute adjustments</li>
          <li>• System records closure date for audit trail</li>
          <li>• After closure, add past transactions as "Adjustments" in Stock Management</li>
          <li>• All closures are tracked in history for reference</li>
        </ul>
      </div>
    </div>
  );
}