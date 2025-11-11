import "./globals.css";
import Sidebar from "./component/sidebar";
import Navbar from "./component/Navbar";

export const metadata = {
  title: "Butt & Malik Traders System",
  description: "Inventory and Profit/Loss Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen">
          <Navbar />
          <main className="p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}