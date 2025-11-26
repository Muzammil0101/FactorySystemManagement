"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3, PieChart, List, CheckCircle, AlertCircle, X, Wallet, Package, ArrowRightLeft, Edit2, Check, X as CloseIcon } from 'lucide-react';

const API_BASE = 'http://localhost:4000/api';

export default function ProfitLossDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [bySupplier, setBySupplier] = useState([]);
  const [byCustomer, setByCustomer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [connected, setConnected] = useState(false);
  const [notification, setNotification] = useState(null);

  // Manual Cash Flow States
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [manualCash, setManualCash] = useState(0);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const testConnection = async () => {
    try {
      const res = await fetch(`${API_BASE}/profit-loss/summary`);
      setConnected(res.ok);
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    testConnection();
    fetchBalanceSheet();
    fetchByCategory();
    fetchBySupplier();
    fetchByCustomer();
  }, []);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/profit-loss/balance-sheet`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBalanceSheet(data);
      setManualCash(data.cash_in_hand || 0);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      showNotification('Error fetching data. Ensure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateCashInHand = async () => {
    try {
      const res = await fetch(`${API_BASE}/profit-loss/cash-in-hand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(manualCash) })
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      setIsEditingCash(false);
      fetchBalanceSheet(); // Refresh data to recalculate totals
      showNotification('Cash in hand updated successfully', 'success');
    } catch (error) {
      console.error('Error updating cash:', error);
      showNotification('Failed to update cash in hand', 'error');
    }
  };

  const fetchByCategory = async () => {
    try {
      const res = await fetch(`${API_BASE}/profit-loss/by-category`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setByCategory(data);
    } catch (error) {
      console.error('Error fetching by category:', error);
    }
  };

  const fetchBySupplier = async () => {
    try {
      const res = await fetch(`${API_BASE}/profit-loss/by-supplier`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBySupplier(data);
    } catch (error) {
      console.error('Error fetching by supplier:', error);
    }
  };

  const fetchByCustomer = async () => {
    try {
      const res = await fetch(`${API_BASE}/profit-loss/by-customer`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setByCustomer(data);
    } catch (error) {
      console.error('Error fetching by customer:', error);
    }
  };

  // Helper to calculate totals for the balance sheet
  const calculateTotals = () => {
    if (!balanceSheet) return { col1: 0, col2: 0, profit: 0 };

    const col1Total = 
      (balanceSheet.cash_in_hand || 0) + 
      (balanceSheet.stock_value || 0) + 
      (balanceSheet.customers?.reduce((sum, c) => sum + c.balance, 0) || 0);

    const col2Total = 
      (balanceSheet.suppliers?.reduce((sum, s) => sum + s.balance, 0) || 0);

    return {
      col1: col1Total,
      col2: col2Total,
      profit: col1Total - col2Total
    };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-slate-100 min-h-screen pt-20 px-4 pb-10 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          notification.type === "success" 
            ? "bg-gradient-to-r from-emerald-500 to-green-600" 
            : "bg-gradient-to-r from-red-500 to-rose-600"
        }`}>
          {notification.type === "success" ? <CheckCircle className="text-white" size={24} /> : <AlertCircle className="text-white" size={24} />}
          <p className="text-white font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="text-white hover:bg-white/20 p-1 rounded-lg ml-2"><X size={18} /></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <BarChart3 className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Business Dashboard</h1>
              <p className="text-slate-500 font-medium">Profit & Loss Statement</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-semibold text-slate-600">
              {connected ? 'System Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          {[
            { id: 'summary', label: 'Summary Report', icon: ArrowRightLeft },
            { id: 'category', label: 'By Category', icon: List },
            { id: 'supplier', label: 'By Supplier', icon: Package },
            { id: 'customer', label: 'By Customer', icon: List },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- MAIN SUMMARY VIEW (Balance Sheet Style) --- */}
        {activeTab === 'summary' && balanceSheet && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: Assets / Inflows */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="text-emerald-600" />
                  Assets / Receivables
                </h2>
                <span className="text-sm font-medium text-slate-400">Column 1</span>
              </div>
              
              <div className="p-0 flex-grow">
                <table className="w-full">
                  <tbody className="text-sm">
                    {/* Row 1: Cash Flow (Manual) */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                        Cash Flow (In Hand)
                        {!isEditingCash && (
                          <button onClick={() => setIsEditingCash(true)} className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit2 size={14} />
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                        {isEditingCash ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={manualCash}
                              onChange={(e) => setManualCash(e.target.value)}
                              className="w-32 border border-slate-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={updateCashInHand} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                              <Check size={16} />
                            </button>
                            <button onClick={() => { setIsEditingCash(false); setManualCash(balanceSheet.cash_in_hand); }} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                              <CloseIcon size={16} />
                            </button>
                          </div>
                        ) : (
                          balanceSheet.cash_in_hand?.toLocaleString()
                        )}
                      </td>
                    </tr>

                    {/* Row 2: Stock Value */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-700">
                        Remaining Stock Value
                        <div className="text-xs text-slate-400 font-normal">
                          {balanceSheet.stock_weight} kg remaining
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                        {balanceSheet.stock_value?.toLocaleString()}
                      </td>
                    </tr>

                    {/* Row 3+: Customers */}
                    {balanceSheet.customers?.map((cust, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-600">{cust.name}</td>
                        <td className="px-6 py-4 text-right font-mono text-slate-800">
                          {cust.balance?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Empty state filler */}
                    {(!balanceSheet.customers || balanceSheet.customers.length === 0) && (
                      <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400 italic">No customer balances</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Column 1 Footer */}
              <div className="bg-slate-50 p-5 border-t border-slate-200 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Total (Col 1)</span>
                  <span className="text-2xl font-bold text-slate-800">{totals.col1?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Liabilities / Outflows */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <TrendingDown className="text-rose-600" />
                  Liabilities / Payables
                </h2>
                <span className="text-sm font-medium text-slate-400">Column 2</span>
              </div>

              <div className="p-0 flex-grow">
                <table className="w-full">
                  <tbody className="text-sm">
                    {/* Suppliers List */}
                    {balanceSheet.suppliers?.map((sup, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-600">{sup.name}</td>
                        <td className="px-6 py-4 text-right font-mono text-slate-800">
                          {sup.balance?.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                     {/* Empty state filler */}
                     {(!balanceSheet.suppliers || balanceSheet.suppliers.length === 0) && (
                      <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400 italic">No supplier balances</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Column 2 Footer */}
              <div className="bg-slate-50 p-5 border-t border-slate-200 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Total (Col 2)</span>
                  <span className="text-2xl font-bold text-slate-800">{totals.col2?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* FINAL PROFIT CALCULATION */}
            <div className="lg:col-span-2 mt-4">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-2xl font-bold opacity-90">Net Profit Calculation</h3>
                  <p className="text-slate-400 mt-1">Formula: (Column 1 Total) - (Column 2 Total)</p>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-slate-400">Calculation</div>
                    <div className="font-mono text-lg text-slate-300">
                      {totals.col1?.toLocaleString()} - {totals.col2?.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className={`px-8 py-4 rounded-2xl font-mono text-4xl font-bold ${totals.profit >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}>
                    {totals.profit?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- OTHER TABS (Category, Supplier, Customer) --- */}
        {activeTab === 'category' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-700">Profitability by Product Category</h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Cost</th>
                  <th className="px-6 py-3 text-right">Revenue</th>
                  <th className="px-6 py-3 text-right">Profit</th>
                  <th className="px-6 py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.category}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{item.cost?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{item.revenue?.toLocaleString()}</td>
                    <td className={`px-6 py-4 text-right font-bold ${item.profit_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.profit_loss?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">{item.margin_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'supplier' && (
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
             <h3 className="font-bold text-slate-700">Supplier Performance</h3>
           </div>
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-medium">
               <tr>
                 <th className="px-6 py-3">Supplier</th>
                 <th className="px-6 py-3 text-right">Total Cost</th>
                 <th className="px-6 py-3 text-right">Quantity</th>
                 <th className="px-6 py-3 text-right">Avg Rate</th>
               </tr>
             </thead>
             <tbody>
               {bySupplier.map((item, idx) => (
                 <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                   <td className="px-6 py-4 font-medium text-slate-900">{item.supplier}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.total_cost?.toLocaleString()}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.total_quantity}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.avg_rate_per_unit}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
        )}

        {activeTab === 'customer' && (
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
             <h3 className="font-bold text-slate-700">Customer Sales Report</h3>
           </div>
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-medium">
               <tr>
                 <th className="px-6 py-3">Customer</th>
                 <th className="px-6 py-3 text-right">Total Revenue</th>
                 <th className="px-6 py-3 text-right">Quantity</th>
                 <th className="px-6 py-3 text-right">Avg Sales Rate</th>
               </tr>
             </thead>
             <tbody>
               {byCustomer.map((item, idx) => (
                 <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                   <td className="px-6 py-4 font-medium text-slate-900">{item.customer}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.total_revenue?.toLocaleString()}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.total_quantity}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.avg_rate_per_unit}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
        )}

      </div>
    </div>
  );
}