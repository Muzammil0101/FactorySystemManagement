"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3, PieChart, List, CheckCircle, AlertCircle, X } from 'lucide-react';

const API_BASE = 'http://localhost:4000/api';

export default function ProfitLossDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [bySupplier, setBySupplier] = useState([]);
  const [byCustomer, setByCustomer] = useState([]);
  const [detailed, setDetailed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [connected, setConnected] = useState(false);
  const [notification, setNotification] = useState(null);

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
    fetchSummary();
    fetchByCategory();
    fetchBySupplier();
    fetchByCustomer();
    fetchDetailed();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/profit-loss/summary`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      showNotification('Error fetching summary. Make sure backend is running.', 'error');
    } finally {
      setLoading(false);
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
      setByCategory([]);
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
      setBySupplier([]);
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
      setByCustomer([]);
    }
  };

  const fetchDetailed = async () => {
    try {
      const res = await fetch(`${API_BASE}/profit-loss/detailed-report`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setDetailed(data);
    } catch (error) {
      console.error('Error fetching detailed report:', error);
      setDetailed(null);
    }
  };

  const fetchByDateRange = async () => {
    if (!dateRange.start || !dateRange.end) {
      showNotification('Please select both start and end dates', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/profit-loss/by-date-range?start_date=${dateRange.start}&end_date=${dateRange.end}`
      );
      const data = await res.json();
      setSummary(data);
      setActiveTab('summary');
      showNotification('Date range filtered successfully', 'success');
    } catch (error) {
      console.error('Error fetching by date range:', error);
      showNotification('Error filtering by date range', 'error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, subtext, trend }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
          <Icon className="text-white" size={24} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-full inline-block ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend >= 0 ? '📈 Profitable' : '📉 Loss'}
        </div>
      )}
    </div>
  );

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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-lg">
              <BarChart3 className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800">Profit & Loss Dashboard</h1>
          <p className="text-slate-600 mt-2">Monitor your business profitability</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full shadow-lg ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-semibold text-slate-700 bg-white/50 px-3 py-1 rounded-full">
              {connected ? '✅ Connected to Backend' : '❌ Backend Not Connected'}
            </span>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 mb-6 border border-white/50">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} />
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} />
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-semibold"
              />
            </div>
            <button
              onClick={fetchByDateRange}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Filter'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={BarChart3}
              label="Total Cost"
              value={`PKR ${summary.total_cost?.toLocaleString()}`}
              subtext="Total purchases"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={`PKR ${summary.total_revenue?.toLocaleString()}`}
              subtext="Total sales"
            />
            <StatCard
              icon={summary.profit_loss >= 0 ? TrendingUp : TrendingDown}
              label="Profit/Loss"
              value={`PKR ${summary.profit_loss?.toLocaleString()}`}
              subtext={`Margin: ${summary.profit_margin_percent}%`}
              trend={summary.profit_loss}
            />
            <StatCard
              icon={PieChart}
              label="Profit Margin"
              value={`${summary.profit_margin_percent}%`}
              subtext={summary.status === 'profitable' ? '✅ Profitable' : '❌ Loss'}
            />
          </div>
        )}

        {/* Detailed Report */}
        {detailed && activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <BarChart3 className="text-white" size={20} />
                </div>
                Purchases
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Transactions:</span>
                  <span className="font-bold text-slate-900">{detailed.purchases.transaction_count}</span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Total Amount:</span>
                  <span className="font-bold text-slate-900">PKR {detailed.purchases.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Total Weight:</span>
                  <span className="font-bold text-slate-900">{detailed.purchases.total_weight?.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Avg Rate:</span>
                  <span className="font-bold text-slate-900">PKR {detailed.purchases.avg_rate?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <TrendingUp className="text-white" size={20} />
                </div>
                Sales
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Transactions:</span>
                  <span className="font-bold text-slate-900">{detailed.sales.transaction_count}</span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Total Amount:</span>
                  <span className="font-bold text-slate-900">PKR {detailed.sales.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Total Weight:</span>
                  <span className="font-bold text-slate-900">{detailed.sales.total_weight?.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Avg Rate:</span>
                  <span className="font-bold text-slate-900">PKR {detailed.sales.avg_rate?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="bg-green-500 p-2 rounded-lg">
                  <PieChart className="text-white" size={20} />
                </div>
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Profit/Loss:</span>
                  <span className={`font-bold ${detailed.summary.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    PKR {detailed.summary.profit_loss?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Margin %:</span>
                  <span className="font-bold text-slate-900">{detailed.summary.profit_margin_percent}%</span>
                </div>
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-slate-700 font-medium">Status:</span>
                  <span className="font-bold text-slate-900 capitalize">{detailed.summary.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-lg border border-white/50">
          {[
            { id: 'summary', label: '📊 Summary', icon: BarChart3 },
            { id: 'category', label: '🏷️ By Category', icon: List },
            { id: 'supplier', label: '🏭 By Supplier', icon: BarChart3 },
            { id: 'customer', label: '👥 By Customer', icon: List },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-bold text-sm rounded-2xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* By Category */}
        {activeTab === 'category' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/50">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <List size={24} />
                Profit/Loss by Category
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700">Category</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Cost</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Revenue</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Profit/Loss</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition-colors border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-900 font-semibold">{item.category}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">PKR {item.cost?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">PKR {item.revenue?.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-right font-bold ${item.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        PKR {item.profit_loss?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">{item.margin_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* By Supplier */}
        {activeTab === 'supplier' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/50">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 size={24} />
                Purchases by Supplier
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700">Supplier</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Total Cost</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Quantity (kg)</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Avg Rate/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {bySupplier.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition-colors border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-900 font-semibold">{item.supplier}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">PKR {item.total_cost?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">{item.total_quantity?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">PKR {item.avg_rate_per_unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* By Customer */}
        {activeTab === 'customer' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/50">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <List size={24} />
                Sales by Customer
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700">Customer</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Total Revenue</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Quantity (kg)</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Avg Rate/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {byCustomer.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition-colors border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-900 font-semibold">{item.customer}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">PKR {item.total_revenue?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">{item.total_quantity?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">PKR {item.avg_rate_per_unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}