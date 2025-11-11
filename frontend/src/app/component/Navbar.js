"use client";

const Navbar = () => {
  return (
    <div className="w-full bg-white shadow p-4 flex justify-between items-center">
      <h3 className="text-lg font-semibold">Dashboard</h3>
      <div className="flex gap-3 items-center">
        <span className="font-medium text-gray-600">Welcome, Admin</span>
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;