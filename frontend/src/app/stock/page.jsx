"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function StockPage() {
  const [stockIn, setStockIn] = useState([]);
  const [stockOut, setStockOut] = useState([]);
  const [formIn, setFormIn] = useState({
    date: "",
    description: "",
    weight: "",
    rate: "",
    amount: "",
    customer: "",
  });
  const [formOut, setFormOut] = useState({
    date: "",
    description: "",
    weight: "",
    rate: "",
    amount: "",
    customer: "",
  });

  const totalIn = stockIn.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  const totalOut = stockOut.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  const currentStock = totalIn - totalOut;

  // handle auto amount calculation and value change
  const handleChange = (e, type) => {
    const { name, value } = e.target;
    const form = type === "in" ? { ...formIn } : { ...formOut };
    form[name] = value;

    if (name === "weight" || name === "rate") {
      const weight = name === "weight" ? value : form.weight;
      const rate = name === "rate" ? value : form.rate;
      form.amount = weight && rate ? (weight * rate).toFixed(2) : "";
    }

    type === "in" ? setFormIn(form) : setFormOut(form);
  };

  // add new entry
  const handleAdd = (e, type) => {
    e.preventDefault();
    const form = type === "in" ? formIn : formOut;

    if (!form.date || !form.description || !form.weight || !form.rate || !form.customer) {
      alert("Please fill all required fields!");
      return;
    }

    const newItem = { ...form, id: Date.now() };
    if (type === "in") {
      setStockIn([...stockIn, newItem]);
      setFormIn({ date: "", description: "", weight: "", rate: "", amount: "", customer: "" });
    } else {
      if (parseFloat(form.weight) > currentStock) {
        alert("Not enough stock available to remove!");
        return;
      }
      setStockOut([...stockOut, newItem]);
      setFormOut({ date: "", description: "", weight: "", rate: "", amount: "", customer: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        📦 Stock Management System
      </h1>

      {/* TOTAL STOCK DISPLAY */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white shadow-md rounded-2xl p-6 mb-8 text-center max-w-md mx-auto border border-gray-100"
      >
        <h2 className="text-lg text-gray-600 font-medium">Current Stock</h2>
        <p className="text-4xl font-bold text-blue-600 mt-2">{currentStock} kg</p>
        <p className="text-sm text-gray-500 mt-1">
          (In: {totalIn} kg | Out: {totalOut} kg)
        </p>
      </motion.div>

      {/* FORMS SIDE BY SIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* STOCK IN */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white shadow-md rounded-2xl p-6 border-t-4 border-green-500"
        >
          <h3 className="text-xl font-semibold text-green-600 mb-4 text-center">
            ➕ Stock In
          </h3>

          <form onSubmit={(e) => handleAdd(e, "in")} className="space-y-3">
            <input
              type="date"
              name="date"
              value={formIn.date}
              onChange={(e) => handleChange(e, "in")}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="description"
              value={formIn.description}
              onChange={(e) => handleChange(e, "in")}
              placeholder="Description"
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="customer"
              value={formIn.customer}
              onChange={(e) => handleChange(e, "in")}
              placeholder="Supplier Name"
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                name="weight"
                value={formIn.weight}
                onChange={(e) => handleChange(e, "in")}
                placeholder="Weight"
                className="border border-gray-300 rounded-lg p-2"
                required
              />
              <input
                type="number"
                name="rate"
                value={formIn.rate}
                onChange={(e) => handleChange(e, "in")}
                placeholder="Rate"
                className="border border-gray-300 rounded-lg p-2"
                required
              />
              <input
                type="number"
                name="amount"
                value={formIn.amount}
                readOnly
                placeholder="Amount"
                className="border border-gray-200 rounded-lg p-2 bg-gray-100"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white w-full py-2 rounded-lg hover:bg-green-600 transition"
            >
              Add Stock In
            </button>
          </form>
        </motion.div>

        {/* STOCK OUT */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white shadow-md rounded-2xl p-6 border-t-4 border-red-500"
        >
          <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
            ➖ Stock Out
          </h3>

          <form onSubmit={(e) => handleAdd(e, "out")} className="space-y-3">
            <input
              type="date"
              name="date"
              value={formOut.date}
              onChange={(e) => handleChange(e, "out")}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="description"
              value={formOut.description}
              onChange={(e) => handleChange(e, "out")}
              placeholder="Description"
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="customer"
              value={formOut.customer}
              onChange={(e) => handleChange(e, "out")}
              placeholder="Customer Name"
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                name="weight"
                value={formOut.weight}
                onChange={(e) => handleChange(e, "out")}
                placeholder="Weight"
                className="border border-gray-300 rounded-lg p-2"
                required
              />
              <input
                type="number"
                name="rate"
                value={formOut.rate}
                onChange={(e) => handleChange(e, "out")}
                placeholder="Rate"
                className="border border-gray-300 rounded-lg p-2"
                required
              />
              <input
                type="number"
                name="amount"
                value={formOut.amount}
                readOnly
                placeholder="Amount"
                className="border border-gray-200 rounded-lg p-2 bg-gray-100"
              />
            </div>
            <button
              type="submit"
              className="bg-red-500 text-white w-full py-2 rounded-lg hover:bg-red-600 transition"
            >
              Add Stock Out
            </button>
          </form>
        </motion.div>
      </div>

      {/* STOCK TABLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IN TABLE */}
        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <h4 className="text-lg font-semibold text-green-600 bg-green-50 p-3 border-b">
            Stock In Details
          </h4>
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Weight</th>
                <th className="p-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stockIn.length > 0 ? (
                stockIn.map((s, i) => (
                  <tr key={s.id} className="border-b hover:bg-green-50">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{s.date}</td>
                    <td className="p-2">{s.description}</td>
                    <td className="p-2">{s.weight}</td>
                    <td className="p-2">{s.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-4">
                    No stock in records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* OUT TABLE */}
        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <h4 className="text-lg font-semibold text-red-600 bg-red-50 p-3 border-b">
            Stock Out Details
          </h4>
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Weight</th>
                <th className="p-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stockOut.length > 0 ? (
                stockOut.map((s, i) => (
                  <tr key={s.id} className="border-b hover:bg-red-50">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{s.date}</td>
                    <td className="p-2">{s.description}</td>
                    <td className="p-2">{s.weight}</td>
                    <td className="p-2">{s.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-4">
                    No stock out records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}