"use client";
import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [customerLedger, setCustomerLedger] = useState({}); 
  // { customerName: [ {date, weight, amount, type} ] }

  // Auto add customer if not exist
  const autoAddCustomer = (name) => {
    const exists = customers.find(c => c.name === name);
    if (!exists) {
      const newCustomer = {
        id: Date.now(),
        name,
        phone: "",
        city: "",
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
  };

  // Add entry to ledger
  const addLedgerEntry = (customer, entry) => {
    setCustomerLedger(prev => ({
      ...prev,
      [customer]: [...(prev[customer] || []), entry]
    }));
  };

  return (
    <AppContext.Provider value={{
      customers,
      setCustomers,
      customerLedger,
      addLedgerEntry,
      autoAddCustomer
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);