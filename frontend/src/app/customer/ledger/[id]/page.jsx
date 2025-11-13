"use client";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CustomerLedger() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const [entries, setEntries] = useState([
    {
      date: "2025-11-01",
      description: "Cement bags purchase",
      weight: 10,
      rate: 1200,
      debit: 12000,
      credit: 0,
    },
    {
      date: "2025-11-05",
      description: "Payment received",
      weight: 0,
      rate: 0,
      debit: 0,
      credit: 8000,
    },
  ]);

  const [form, setForm] = useState({
    date: "",
    description: "",
    weight: "",
    rate: "",
    credit: "",
  });

  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!form.date || !form.description) {
      alert("Please fill in date and description");
      return;
    }

    // If weight and rate are given, calculate debit
    const debit =
      form.weight && form.rate
        ? Number(form.weight) * Number(form.rate)
        : 0;

    // If credit is entered, ignore debit
    setEntries([
      ...entries,
      {
        date: form.date,
        description: form.description,
        weight: Number(form.weight) || 0,
        rate: Number(form.rate) || 0,
        debit: form.credit ? 0 : debit,
        credit: Number(form.credit) || 0,
      },
    ]);

    setForm({
      date: "",
      description: "",
      weight: "",
      rate: "",
      credit: "",
    });
    setShowForm(false);
  };

  const handleDelete = (index) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  const balance = totalDebit - totalCredit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/customer"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Customer Ledger</h1>
              </div>
              <p className="text-slate-500 mt-1">
                {name} • Customer ID: #{id}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              New Entry
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Debit</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  Rs. {totalDebit.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <TrendingUp className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Credit</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  Rs. {totalCredit.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingDown className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Net Balance</p>
                <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Rs. {Math.abs(balance).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {balance >= 0 ? 'Receivable' : 'Payable'}
                </p>
              </div>
              <div className={`${balance >= 0 ? 'bg-red-50' : 'bg-green-50'} p-3 rounded-lg`}>
                <DollarSign className={balance >= 0 ? 'text-red-600' : 'text-green-600'} size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <input
                  placeholder="Enter description"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                <input
                  placeholder="0"
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rate (Rs.)</label>
                <input
                  placeholder="0"
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Credit (Rs.)</label>
                <input
                  placeholder="Payment amount"
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.credit}
                  onChange={(e) => setForm({ ...form, credit: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Entry
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Sr
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-red-600 uppercase tracking-wider">
                    Debit
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-green-600 uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {entries.map((e, index) => {
                  const runningBalance = entries
                    .slice(0, index + 1)
                    .reduce((sum, x) => sum + (x.debit - x.credit), 0);

                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(e.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                        {e.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-right">
                        {e.weight > 0 ? `${e.weight} kg` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-right">
                        {e.rate > 0 ? `Rs. ${e.rate.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-semibold text-right">
                        {e.debit > 0 ? `Rs. ${e.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold text-right">
                        {e.credit > 0 ? `Rs. ${e.credit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right">
                        <span className={runningBalance >= 0 ? 'text-red-600' : 'text-green-600'}>
                          Rs. {Math.abs(runningBalance).toLocaleString()}
                          <span className="text-xs ml-1">
                            {runningBalance >= 0 ? 'Dr' : 'Cr'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-sm font-bold text-slate-800">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">
                    Rs. {totalDebit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">
                    Rs. {totalCredit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right">
                    <span className={balance >= 0 ? 'text-red-600' : 'text-green-600'}>
                      Rs. {Math.abs(balance).toLocaleString()}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Professional Ledger System • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}