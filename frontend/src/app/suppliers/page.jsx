"use client";
import { useState } from "react";
import Link from "next/link";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "Hassan Traders", phone: "0300-9876543", city: "Karachi" },
    { id: 2, name: "Al-Faisal Imports", phone: "0311-1122334", city: "Lahore" },
  ]);

  const [form, setForm] = useState({ name: "", phone: "", city: "" });

  const handleAdd = () => {
    if (!form.name) return;
    setSuppliers([...suppliers, { id: Date.now(), ...form }]);
    setForm({ name: "", phone: "", city: "" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Suppliers</h2>

      {/* Add Supplier Form */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3">
        <input
          placeholder="Name"
          className="border rounded p-2 w-1/4"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="border rounded p-2 w-1/4"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="City"
          className="border rounded p-2 w-1/4"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {/* Supplier Table */}
      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-100 text-left text-gray-700">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Phone</th>
            <th className="p-3">City</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.phone}</td>
              <td className="p-3">{s.city}</td>
              <td className="p-3 text-center">
                <Link
                  href={`/suppliers/ledger/${s.id}?name=${encodeURIComponent(
                    s.name
                  )}`}
                  className="text-green-600 hover:underline"
                >
                  View Ledger
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}