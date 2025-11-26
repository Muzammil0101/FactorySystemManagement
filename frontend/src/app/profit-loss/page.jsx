"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  List, 
  AlertCircle, 
  X, 
  Wallet, 
  Package, 
  ArrowRightLeft, 
  Edit2, 
  Check, 
  X as CloseIcon, 
  Filter, 
  RefreshCcw,
  DollarSign,
  PieChart
} from 'lucide-react';

const API_BASE = 'http://localhost:4000/api';

export default function ProfitLossDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  
  // Data States
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [bySupplier, setBySupplier] = useState([]);
  const [byCustomer, setByCustomer] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [manualCash, setManualCash] = useState(0);

  // Date Filter States
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getQueryString = () => {
    if (dateRange.start && dateRange.end) {
      return `?start_date=${dateRange.start}&end_date=${dateRange.end}`;
    }
    return '';
  };

  const fetchBalanceSheet = useCallback(async () => {
    try {
      setLoading(true);
      const query = getQueryString();
      const res = await fetch(`${API_BASE}/profit-loss/balance-sheet${query}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBalanceSheet(data);
      if (!isEditingCash) {
        setManualCash(data.cash_in_hand || 0);
      }
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      showNotification('Error fetching data. Ensure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [dateRange, isEditingCash]);

  const fetchByCategory = useCallback(async () => {
    try {
      const query = getQueryString();
      const res = await fetch(`${API_BASE}/profit-loss/by-category${query}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setByCategory(data);
    } catch (error) {
      console.error('Error fetching by category:', error);
    }
  }, [dateRange]);

  const fetchBySupplier = useCallback(async () => {
    try {
      const query = getQueryString();
      const res = await fetch(`${API_BASE}/profit-loss/by-supplier${query}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBySupplier(data);
    } catch (error) {
      console.error('Error fetching by supplier:', error);
    }
  }, [dateRange]);

  const fetchByCustomer = useCallback(async () => {
    try {
      const query = getQueryString();
      const res = await fetch(`${API_BASE}/profit-loss/by-customer${query}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setByCustomer(data);
    } catch (error) {
      console.error('Error fetching by customer:', error);
    }
  }, [dateRange]);

  const fetchAllData = () => {
    fetchBalanceSheet();
    fetchByCategory();
    fetchBySupplier();
    fetchByCustomer();
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        const res = await fetch(`${API_BASE}/profit-loss/summary`);
        setConnected(res.ok);
      } catch {
        setConnected(false);
      }
    };
    testConnection();
    fetchAllData();
  }, []);

  const applyFilter = (e) => {
    e.preventDefault();
    fetchAllData();
    showNotification("Date filter applied successfully");
  };

  const clearFilter = () => {
    setDateRange({ start: '', end: '' });
    setTimeout(() => {
        window.location.reload(); 
    }, 100);
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
      fetchBalanceSheet(); 
      showNotification('Cash in hand updated successfully', 'success');
    } catch (error) {
      console.error('Error updating cash:', error);
      showNotification('Failed to update cash in hand', 'error');
    }
  };

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
          {notification.type === "success" ? <CheckCircle className="text-emerald-500" size={20} /> : <AlertCircle className="text-rose-500" size={20} />}
          <p className="text-slate-800 font-medium text-sm">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="text-slate-500 hover:bg-white/50 p-1 rounded-lg ml-2"><X size={16} /></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                <BarChart3 size={24} />
              </span>
              Business Dashboard
            </h1>
            <div className="flex items-center gap-3 mt-2 ml-1">
              <p className="text-slate-500 text-sm font-semibold">Profit & Loss Statement</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${connected ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                {connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Date Filter */}
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-slate-200 flex flex-wrap items-center gap-2">
            <form onSubmit={applyFilter} className="flex items-center gap-2">
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="pl-10 pr-3 py-2 bg-slate-50 border-none rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                />
              </div>
              <span className="text-slate-400 font-bold">-</span>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="pl-10 pr-3 py-2 bg-slate-50 border-none rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-sm"
                title="Apply Filter"
              >
                <Filter size={18} />
              </button>
              {(dateRange.start || dateRange.end) && (
                <button 
                  type="button"
                  onClick={clearFilter}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors"
                  title="Clear"
                >
                  <RefreshCcw size={18} />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex">
          {[
            { id: 'summary', label: 'Summary', icon: ArrowRightLeft },
            { id: 'category', label: 'Categories', icon: PieChart },
            { id: 'supplier', label: 'Suppliers', icon: Package },
            { id: 'customer', label: 'Customers', icon: List },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-12 text-center">
                <div className="animate-spin mx-auto w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-slate-500 font-medium">Analyzing financial data...</p>
            </div>
        )}

        {/* --- MAIN SUMMARY VIEW (Balance Sheet Style) --- */}
        {!loading && activeTab === 'summary' && balanceSheet && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMN 1: Assets / Inflows */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
              <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Assets / Inflow</h2>
                    <p className="text-xs text-slate-500 font-medium">Receivables & Cash</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200 uppercase tracking-wider">Asset</span>
              </div>
              
              <div className="flex-grow">
                <table className="w-full">
                  <tbody className="text-sm">
                    {/* Cash Flow Row */}
                    <tr className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                        Cash In Hand
                        {!isEditingCash && (
                          <button onClick={() => setIsEditingCash(true)} className="text-slate-400 hover:text-blue-500 transition-colors">
                            <Edit2 size={14} />
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 text-lg">
                        {isEditingCash ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={manualCash}
                              onChange={(e) => setManualCash(e.target.value)}
                              className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            />
                            <button onClick={updateCashInHand} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Check size={14} /></button>
                            <button onClick={() => { setIsEditingCash(false); setManualCash(balanceSheet.cash_in_hand); }} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><CloseIcon size={14} /></button>
                          </div>
                        ) : (
                          `₨${balanceSheet.cash_in_hand?.toLocaleString()}`
                        )}
                      </td>
                    </tr>

                    {/* Stock Value Row */}
                    <tr className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700">Stock Value</span>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                          {balanceSheet.stock_weight} kg (At Cost)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 text-lg">
                        ₨{balanceSheet.stock_value?.toLocaleString()}
                      </td>
                    </tr>

                    {/* Customer Balances */}
                    {balanceSheet.customers?.map((cust, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">{cust.name}</span>
                          <span className="text-[10px] text-emerald-600 ml-2 bg-emerald-50 px-1.5 py-0.5 rounded">Receivable</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-600 font-medium">
                          ₨{cust.balance?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    
                    {(!balanceSheet.customers || balanceSheet.customers.length === 0) && (
                      <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400 text-xs italic">No customer receivables</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50/80 p-5 border-t border-slate-100 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assets</span>
                  <span className="text-2xl font-extrabold text-emerald-700">₨{totals.col1?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Liabilities / Outflows */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
              <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Liabilities / Outflow</h2>
                    <p className="text-xs text-slate-500 font-medium">Payables</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded border border-rose-200 uppercase tracking-wider">Liability</span>
              </div>

              <div className="flex-grow">
                <table className="w-full">
                  <tbody className="text-sm">
                    {/* Suppliers List */}
                    {balanceSheet.suppliers?.map((sup, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-rose-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">{sup.name}</span>
                          <span className="text-[10px] text-rose-600 ml-2 bg-rose-50 px-1.5 py-0.5 rounded">Payable</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-600 font-medium">
                          ₨{sup.balance?.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                      {(!balanceSheet.suppliers || balanceSheet.suppliers.length === 0) && (
                      <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400 text-xs italic">No supplier payables</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50/80 p-5 border-t border-slate-100 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Liabilities</span>
                  <span className="text-2xl font-extrabold text-rose-700">₨{totals.col2?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* FINAL PROFIT CALCULATION CARD */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold">Net Business Value</h3>
                  <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                    <Calendar size={14}/>
                    {dateRange.start && dateRange.end 
                        ? `Period: ${dateRange.start} to ${dateRange.end}` 
                        : "Period: All Time Data"
                    }
                  </div>
                </div>
                
                <div className="flex items-center gap-8 relative z-10">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Calculation</div>
                    <div className="font-mono text-lg text-slate-300">
                      <span className="text-emerald-400">Ast</span> - <span className="text-rose-400">Liab</span>
                    </div>
                  </div>
                  
                  <div className={`px-8 py-4 rounded-2xl font-mono text-4xl font-bold border ${totals.profit >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/50'}`}>
                    ₨{totals.profit?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- CATEGORY TAB --- */}
        {!loading && activeTab === 'category' && (
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><PieChart size={18} className="text-blue-600" /> Category Performance</h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Cost</th>
                  <th className="px-6 py-3 text-right">Revenue</th>
                  <th className="px-6 py-3 text-right">Profit</th>
                  <th className="px-6 py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {byCategory.length > 0 ? byCategory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.category}</td>
                    <td className="px-6 py-4 text-right text-slate-600">₨{item.cost?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600">₨{item.revenue?.toLocaleString()}</td>
                    <td className={`px-6 py-4 text-right font-bold ${item.profit_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ₨{item.profit_loss?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.margin_percent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {item.margin_percent}%
                      </span>
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- SUPPLIER TAB --- */}
        {!loading && activeTab === 'supplier' && (
           <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
           <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package size={18} className="text-emerald-600" /> Supplier Analysis</h3>
           </div>
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
               <tr>
                 <th className="px-6 py-3">Supplier</th>
                 <th className="px-6 py-3 text-right">Total Cost</th>
                 <th className="px-6 py-3 text-right">Quantity</th>
                 <th className="px-6 py-3 text-right">Avg Rate</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {bySupplier.length > 0 ? bySupplier.map((item, idx) => (
                 <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-6 py-4 font-medium text-slate-800">{item.supplier}</td>
                   <td className="px-6 py-4 text-right text-slate-600 font-medium">₨{item.total_cost?.toLocaleString()}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.total_quantity}</td>
                   <td className="px-6 py-4 text-right text-slate-600">₨{item.avg_rate_per_unit}</td>
                 </tr>
               )) : (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No data available</td></tr>
               )}
             </tbody>
           </table>
         </div>
        )}

        {/* --- CUSTOMER TAB --- */}
        {!loading && activeTab === 'customer' && (
           <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
           <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><List size={18} className="text-blue-600" /> Customer Sales Report</h3>
           </div>
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
               <tr>
                 <th className="px-6 py-3">Customer</th>
                 <th className="px-6 py-3 text-right">Total Revenue</th>
                 <th className="px-6 py-3 text-right">Quantity</th>
                 <th className="px-6 py-3 text-right">Avg Rate</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {byCustomer.length > 0 ? byCustomer.map((item, idx) => (
                 <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-6 py-4 font-medium text-slate-800">{item.customer}</td>
                   <td className="px-6 py-4 text-right text-emerald-600 font-medium">₨{item.total_revenue?.toLocaleString()}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{item.total_quantity}</td>
                   <td className="px-6 py-4 text-right text-slate-600">₨{item.avg_rate_per_unit}</td>
                 </tr>
               )) : (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No data available</td></tr>
               )}
             </tbody>
           </table>
         </div>
        )}

      </div>
    </div>
  );
}