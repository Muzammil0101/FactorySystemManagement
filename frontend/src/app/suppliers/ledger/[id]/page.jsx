"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SupplierLedgerPage({ params }) {
  const { id } = params;
  const searchParams = useSearchParams();
  const supplierName = searchParams.get("name") || "Supplier";

  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: "",
    description: "",
    weight: "",
    rate: "",
    debit: "",
    credit: "",
  });

  const calculateBalance = () => {
    let balance = 0;
    return entries.map((e) => {
      balance += parseFloat(e.debit || 0) - parseFloat(e.credit || 0);
      return { ...e, balance: balance.toFixed(2) };
    });
  };

  const handleAdd = () => {
    const amount = parseFloat(form.weight || 0) * parseFloat(form.rate || 0);
    const newEntry = {
      sr: entries.length + 1,
      date: form.date,
      description: form.description,
      weight: form.weight,
      rate: form.rate,
      debit: form.debit || amount,
      credit: form.credit || 0,
    };
    setEntries([...entries, newEntry]);
    setForm({ date: "", description: "", weight: "", rate: "", debit: "", credit: "" });
  };

  const dataWithBalance = calculateBalance();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Ledger - {supplierName}
      </h2>

      {/* Add Entry Form */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3 flex-wrap">
        <input
          type="date"
          className="border rounded p-2 w-40"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          placeholder="Description"
          className="border rounded p-2 w-40"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Weight"
          type="number"
          className="border rounded p-2 w-24"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
        />
        <input
          placeholder="Rate"
          type="number"
          className="border rounded p-2 w-24"
          value={form.rate}
          onChange={(e) => setForm({ ...form, rate: e.target.value })}
        />
        <input
          placeholder="Debit"
          type="number"
          className="border rounded p-2 w-24"
          value={form.debit}
          onChange={(e) => setForm({ ...form, debit: e.target.value })}
        />
        <input
          placeholder="Credit"
          type="number"
          className="border rounded p-2 w-24"
          value={form.credit}
          onChange={(e) => setForm({ ...form, credit: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Entry
        </button>
      </div>

      {/* Ledger Table */}
      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2">Sr</th>
            <th className="p-2">Date</th>
            <th className="p-2">Description</th>
            <th className="p-2">Weight</th>
            <th className="p-2">Rate</th>
            <th className="p-2">Debit</th>
            <th className="p-2">Credit</th>
            <th className="p-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {dataWithBalance.map((e) => (
            <tr key={e.sr} className="border-t hover:bg-gray-50">
              <td className="p-2 text-center">{e.sr}</td>
              <td className="p-2">{e.date}</td>
              <td className="p-2">{e.description}</td>
              <td className="p-2 text-right">{e.weight}</td>
              <td className="p-2 text-right">{e.rate}</td>
              <td className="p-2 text-right">{e.debit}</td>
              <td className="p-2 text-right">{e.credit}</td>
              <td className="p-2 text-right font-semibold">{e.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}