"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Truck, 
  Phone, 
  MapPin, 
  Eye, 
  Trash2, 
  Search, 
  X, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Wallet, 
  Calendar, 
  Banknote, 
  Printer, 
  AlertTriangle, 
  ArrowLeftRight, 
  Link as LinkIcon,
  Download,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Filter,
  Scale,
  Tag,
  Merge // Added for Merge Icon
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [matchingCustomer, setMatchingCustomer] = useState(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showContraModal, setShowContraModal] = useState(false);
  
  const [sortOption, setSortOption] = useState("name"); 
  const [visibleCount, setVisibleCount] = useState(9);
  const itemsPerPage = 9;

  const [ledgerStartDate, setLedgerStartDate] = useState("");
  const [ledgerEndDate, setLedgerEndDate] = useState("");

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryForm, setEntryForm] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "Opening Balance",
    type: "credit",
    attachment: null
  });

  const [paymentForm, setPaymentForm] = useState({ 
    amount: "", 
    date: new Date().toISOString().split('T')[0], 
    description: "",
    attachment: null
  });
  
  const [contraForm, setContraForm] = useState({ 
    amount: "", 
    date: new Date().toISOString().split('T')[0],
    description: "",
    weight: "",
    rate: ""
  });

  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [notification, setNotification] = useState(null);
  
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppRes, custRes] = await Promise.all([
        fetch(`${API_URL}/suppliers`),
        fetch(`${API_URL}/customers`)
      ]);
      
      const suppData = await suppRes.json();
      const custData = await custRes.json();
      
      setSuppliers(Array.isArray(suppData) ? suppData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [searchTerm, sortOption]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      showNotification("Please enter supplier name", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setForm({ name: "", phone: "", city: "" });
        setShowForm(false);
        fetchData();
      } else {
        showNotification(result.error || "Failed to add supplier", "error");
      }
    } catch (error) {
      showNotification("Failed to add supplier", "error");
    }
  };

  const confirmDelete = (supplier) => {
    setDeleteModal({ show: true, id: supplier.id, name: supplier.name });
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const response = await fetch(`${API_URL}/suppliers/${deleteModal.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setDeleteModal({ show: false, id: null, name: "" });
        fetchData();
      } else {
        showNotification(result.error || "Failed to delete supplier", "error");
      }
    } catch (error) {
      showNotification("Failed to delete supplier", "error");
    }
  };

  const handleAddEntry = async () => {
    if (!entryForm.amount || parseFloat(entryForm.amount) <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: entryForm.amount,
            date: entryForm.date,
            description: entryForm.description,
            type: entryForm.type
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setEntryForm({ 
            amount: "", 
            date: new Date().toISOString().split('T')[0], 
            description: "Opening Balance", 
            type: "credit",
            attachment: null
        });
        setShowEntryModal(false);
        refreshSelectedSupplier();
      } else {
        showNotification(result.error || "Failed to add entry", "error");
      }
    } catch (error) {
      showNotification("Failed to add entry", "error");
    }
  };

  const handleContraSettlement = async () => {
    if (!contraForm.amount || parseFloat(contraForm.amount) <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }
    if (!matchingCustomer) {
      showNotification("No matching customer found for contra", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contra/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: matchingCustomer.id,
          supplierId: selectedSupplier.id,
          amount: contraForm.amount,
          date: contraForm.date,
          description: contraForm.description,
          weight: contraForm.weight,
          rate: contraForm.rate
        })
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("Contra settlement successful!", "success");
        setContraForm({ 
          amount: "", 
          date: new Date().toISOString().split('T')[0],
          description: "",
          weight: "",
          rate: ""
        });
        setShowContraModal(false);
        refreshSelectedSupplier();
      } else {
        showNotification(result.error || "Failed to process contra settlement", "error");
      }
    } catch (error) {
      showNotification("Failed to process contra settlement", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedSupplier = async () => {
    await fetchData();
    const updatedSupplier = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}`);
    const supplierData = await updatedSupplier.json();
    setSelectedSupplier(supplierData);
    
    if (matchingCustomer) {
      const updatedCustomer = await fetch(`${API_URL}/customers/${matchingCustomer.id}`);
      const custData = await updatedCustomer.json();
      setMatchingCustomer(custData);
    }
  };

  const handleMakePayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/suppliers/${selectedSupplier.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: paymentForm.amount,
            date: paymentForm.date,
            description: paymentForm.description
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setPaymentForm({ 
            amount: "", 
            date: new Date().toISOString().split('T')[0], 
            description: "",
            attachment: null
        });
        setShowPaymentModal(false);
        refreshSelectedSupplier();
      } else {
        showNotification(result.error || "Failed to process payment", "error");
      }
    } catch (error) {
      showNotification("Failed to process payment", "error");
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry.id);
    setEditForm({
      date: entry.date,
      description: entry.description,
      weight: entry.weight,
      rate: entry.rate,
      debit: entry.debit || 0,
      credit: entry.credit || 0
    });
  };

  const handleSaveEdit = async (ledgerId) => {
    try {
      const response = await fetch(`${API_URL}/suppliers/ledger/${ledgerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        setEditingEntry(null);
        refreshSelectedSupplier();
      } else {
        showNotification(result.error || "Failed to update entry", "error");
      }
    } catch (error) {
      showNotification("Failed to update entry", "error");
    }
  };

  const handleDeleteEntry = async (ledgerId) => {
    if (!confirm("Are you sure you want to delete this ledger entry?")) return;

    try {
      const response = await fetch(`${API_URL}/suppliers/ledger/${ledgerId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok) {
        showNotification(result.message, "success");
        refreshSelectedSupplier();
      } else {
        showNotification(result.error || "Failed to delete entry", "error");
      }
    } catch (error) {
      showNotification("Failed to delete entry", "error");
    }
  };

  const calculateSupplierBalance = (supplier) => {
    if (!supplier?.ledger) return 0;
    const totalDebit = supplier.ledger.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = supplier.ledger.reduce((sum, e) => sum + (e.credit || 0), 0);
    return totalCredit - totalDebit; 
  };

  const calculateCustomerBalance = (customer) => {
    if (!customer?.ledger) return 0;
    const totalDebit = customer.ledger.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = customer.ledger.reduce((sum, e) => sum + (e.credit || 0), 0);
    return totalDebit - totalCredit; 
  };

  const findLinkedCustomer = (supplier) => {
    return customers.find(c => c.name.trim().toLowerCase() === supplier.name.trim().toLowerCase());
  };

  const openLedger = (supplier) => {
    setSelectedSupplier(supplier);
    const linked = findLinkedCustomer(supplier);
    setMatchingCustomer(linked);
    setLedgerStartDate("");
    setLedgerEndDate("");
    setShowLedger(true);
  };

  const processedSuppliers = useMemo(() => {
    let result = suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm)) ||
      (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    result.sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "high-balance") {
        return calculateSupplierBalance(b) - calculateSupplierBalance(a);
      } else if (sortOption === "low-balance") {
        return calculateSupplierBalance(a) - calculateSupplierBalance(b);
      }
      return 0;
    });

    return result;
  }, [suppliers, searchTerm, sortOption]);

  const currentSuppliers = processedSuppliers.slice(0, visibleCount);

  const getSortedLedger = (ledger) => {
    if (!ledger) return [];
    return [...ledger].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const dateDiff = dateA - dateB;
      if (dateDiff !== 0) return dateDiff;
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    });
  };

  // --- LEDGER FILTERING ---
  const getFilteredLedgerWithOpening = () => {
    if (!selectedSupplier?.ledger) return { filtered: [], openingBalance: 0 };

    const sorted = getSortedLedger(selectedSupplier.ledger);
    let openingBalance = 0;
    let filtered = sorted;

    if (ledgerStartDate) {
      const start = new Date(ledgerStartDate);
      const previousEntries = sorted.filter(e => new Date(e.date) < start);
      previousEntries.forEach(e => {
        openingBalance += (e.credit || 0) - (e.debit || 0);
      });
      filtered = filtered.filter(e => new Date(e.date) >= start);
    }

    if (ledgerEndDate) {
      const end = new Date(ledgerEndDate);
      filtered = filtered.filter(e => new Date(e.date) <= end);
    }

    return { filtered, openingBalance };
  };

  const { filtered: ledgerViewData, openingBalance: ledgerOpeningBalance } = getFilteredLedgerWithOpening();

  // --- STANDARD EXPORT ---
  const exportLedgerToCSV = () => {
    if (!selectedSupplier) return;
    
    let csvContent = "Date,Description,Weight,Rate,Debit,Credit,Balance\n";
    let runningBalance = ledgerOpeningBalance;

    if (ledgerStartDate) {
         csvContent += `${ledgerStartDate},Opening Balance Before Date,,,,-,${runningBalance}\n`;
    }

    ledgerViewData.forEach(entry => {
        runningBalance += (entry.credit || 0) - (entry.debit || 0);
        csvContent += `${entry.date},"${entry.description}",${entry.weight || ''},${entry.rate || ''},${entry.debit || 0},${entry.credit || 0},${runningBalance}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Ledger_${selectedSupplier.name}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- STANDARD PRINT ---
  const printLedger = () => {
    if (!selectedSupplier) return;
    
    let totalDebit = 0, totalCredit = 0;
    let runningBalance = ledgerOpeningBalance;

    let ledgerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align:center; margin-bottom:5px;">${selectedSupplier.name} - Ledger</h2>
        <p style="text-align:center; font-size:12px; color:#666; margin-top:0;">
            ${ledgerStartDate ? `From: ${ledgerStartDate}` : ''} 
            ${ledgerEndDate ? ` To: ${ledgerEndDate}` : ''}
        </p>
        <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size: 12px;">
        <thead style="background:#f1f5f9;">
          <tr>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:left;">Date</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:left;">Description</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Weight</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Rate</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Debit</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Credit</th>
            <th style="padding:10px;border:1px solid #e2e8f0;text-align:right;">Balance</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (ledgerStartDate) {
         ledgerHTML += `
            <tr style="background-color:#fffbeb; font-weight:bold;">
                <td style="padding:8px;border:1px solid #e2e8f0;">${ledgerStartDate}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;" colspan="5">Opening Balance (Before selected range)</td>
                <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${Math.abs(ledgerOpeningBalance).toLocaleString()} ${ledgerOpeningBalance >= 0 ? 'Payable' : 'Adv'}</td>
            </tr>
         `;
    }

    ledgerViewData.forEach(entry => {
      totalDebit += entry.debit || 0;
      totalCredit += entry.credit || 0;
      runningBalance += (entry.credit || 0) - (entry.debit || 0);

      ledgerHTML += `
        <tr>
          <td style="padding:8px;border:1px solid #e2e8f0;">${entry.date}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;">${entry.description}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.weight || '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.rate || '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:#ef4444;">${entry.debit ? entry.debit.toLocaleString() : '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:#10b981;">${entry.credit ? entry.credit.toLocaleString() : '-'}</td>
          <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;color:${runningBalance >= 0 ? '#334155' : '#10b981'};">
            ${Math.abs(runningBalance).toLocaleString()} ${runningBalance >= 0 ? 'Payable' : 'Adv'}
          </td>
        </tr>
      `;
    });

    const balance = runningBalance; 
    ledgerHTML += `
        </tbody>
        <tfoot style="background:#f8fafc;font-weight:bold;">
          <tr>
            <td colspan="4" style="padding:10px;text-align:right;border:1px solid #e2e8f0;">View Totals</td>
            <td style="padding:10px;text-align:right;color:#ef4444;border:1px solid #e2e8f0;">${totalDebit.toLocaleString()}</td>
            <td style="padding:10px;text-align:right;color:#10b981;border:1px solid #e2e8f0;">${totalCredit.toLocaleString()}</td>
            <td style="padding:10px;text-align:right;border:1px solid #e2e8f0;"></td>
          </tr>
          <tr>
            <td colspan="6" style="padding:12px;text-align:right;border:1px solid #e2e8f0;">Closing Balance</td>
            <td style="padding:12px;text-align:right;color:${balance >= 0 ? '#e11d48' : '#10b981'};border:1px solid #e2e8f0;font-size:14px;">
              Rs. ${Math.abs(balance).toLocaleString()} ${balance >= 0 ? '(Payable)' : '(Advance)'}
            </td>
          </tr>
        </tfoot>
      </table>
      </div>
    `;

    const popup = window.open('', '_blank', 'width=900,height=700');
    popup.document.write(`<html><head><title>Supplier Ledger - ${selectedSupplier.name}</title></head><body>${ledgerHTML}</body></html>`);
    popup.document.close();
  };

  // --- NEW: PROFESSIONAL CONSOLIDATED PRINT ---
  const printConsolidatedLedger = () => {
    if (!selectedSupplier || !matchingCustomer) return;

    // 1. Combine Data
    const suppLedger = selectedSupplier.ledger || [];
    const custLedger = matchingCustomer.ledger || [];

    // Map to a common format
    // Perspective: NET PAYABLE TO PARTY (Positive = We Owe Them)
    // Supp Credit (Purchase) -> +
    // Supp Debit (Payment) -> -
    // Cust Debit (Sale to them) -> - (Reduces what we owe them, or Increases what they owe us)
    // Cust Credit (Receipt from them) -> + (Reduces what they owe us, or Increases what we owe them)
    
    const combined = [
        ...suppLedger.map(e => ({ ...e, source: 'SUPP', type: e.credit > 0 ? 'PURCHASE' : 'PAYMENT', netEffect: (e.credit || 0) - (e.debit || 0) })),
        ...custLedger.map(e => ({ ...e, source: 'CUST', type: e.debit > 0 ? 'SALE' : 'RECEIPT', netEffect: (e.credit || 0) - (e.debit || 0) }))
    ];

    // Sort by Date
    combined.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningNet = 0;
    let totalPurchases = 0;
    let totalSales = 0;

    let rowsHTML = combined.map(entry => {
        runningNet += entry.netEffect;
        
        if (entry.source === 'SUPP' && entry.credit > 0) totalPurchases += entry.credit;
        if (entry.source === 'CUST' && entry.debit > 0) totalSales += entry.debit;

        // Color coding for Source
        const rowBg = entry.source === 'SUPP' ? '' : 'background-color:#f0f9ff;'; 
        const typeLabel = entry.source === 'SUPP' 
            ? (entry.credit > 0 ? 'Purchase (Credit)' : 'Payment (Debit)')
            : (entry.debit > 0 ? 'Sale (Debit)' : 'Receipt (Credit)');

        return `
            <tr style="${rowBg}">
                <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">${entry.date}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;">
                    <span style="font-weight:bold;display:block;font-size:10px;color:#64748b;">${typeLabel}</span>
                    ${entry.description}
                </td>
                <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.weight || '-'}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${entry.rate || '-'}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:${entry.netEffect >= 0 ? '#10b981' : '#ef4444'};">
                    ${entry.netEffect > 0 ? '+' : ''}${Math.abs(entry.netEffect).toLocaleString()}
                </td>
                <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;font-weight:bold;">
                    ${Math.abs(runningNet).toLocaleString()} <span style="font-size:9px;">${runningNet >= 0 ? 'Payable' : 'Receivable'}</span>
                </td>
            </tr>
        `;
    }).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 30px;">
            <div style="text-align:center; margin-bottom:20px;">
                <h1 style="margin:0; font-size:24px;">Consolidated Party Statement</h1>
                <h2 style="margin:5px 0 0 0; color:#475569;">${selectedSupplier.name}</h2>
                <p style="font-size:12px; color:#64748b;">Combined Ledger (Supplier & Customer Roles)</p>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:12px; background:#f8fafc; padding:15px; border-radius:8px;">
                <div>
                    <strong>Total Purchases (Payable):</strong> Rs. ${totalPurchases.toLocaleString()}
                </div>
                <div>
                    <strong>Total Sales (Receivable):</strong> Rs. ${totalSales.toLocaleString()}
                </div>
                <div>
                    <strong>Net Position:</strong> <span style="font-weight:bold; font-size:14px; color:${runningNet >= 0 ? '#ef4444' : '#10b981'}">
                        Rs. ${Math.abs(runningNet).toLocaleString()} ${runningNet >= 0 ? '(We Owe)' : '(They Owe)'}
                    </span>
                </div>
            </div>

            <table style="width:100%; border-collapse:collapse; font-size: 12px;">
                <thead style="background:#1e293b; color:white;">
                    <tr>
                        <th style="padding:10px;text-align:left;">Date</th>
                        <th style="padding:10px;text-align:left;">Description / Type</th>
                        <th style="padding:10px;text-align:right;">Weight</th>
                        <th style="padding:10px;text-align:right;">Rate</th>
                        <th style="padding:10px;text-align:right;">Movement</th>
                        <th style="padding:10px;text-align:right;">Net Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>
            
            <div style="margin-top:30px; font-size:10px; color:#94a3b8; text-align:center;">
                * Positive movement indicates increase in amount payable to party. Negative indicates decrease.
            </div>
        </div>
    `;

    const popup = window.open('', '_blank', 'width=900,height=800');
    popup.document.write(`<html><head><title>Consolidated Statement - ${selectedSupplier.name}</title></head><body>${html}</body></html>`);
    popup.document.close();
  };

  let renderRunningBalance = ledgerOpeningBalance;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 pb-6 relative font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 transform transition-all duration-300 animate-slide-in ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-rose-50 text-rose-700 border-rose-200"
        }`}>
          {notification.type === "success" ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-rose-500" />}
          <p className="font-bold text-sm">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="hover:bg-slate-200/50 p-1 rounded-lg transition-colors ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-200 text-white">
                <Truck size={24} />
              </span>
              Supplier Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Manage suppliers and track payment ledgers</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-emerald-200 transition-all transform hover:scale-105"
          >
            <Plus size={18} /> {showForm ? "Close Form" : "Add Supplier"}
          </button>
        </div>
      </div>

      {/* Add Supplier Form */}
      {showForm && (
        <div className="relative z-10 mb-8 animate-slide-in">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">New Supplier</h3>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label>
                  <input 
                    placeholder="e.g. Ali Traders" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input 
                    placeholder="0300-1234567" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">City</label>
                  <input 
                    placeholder="Lahore" 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all">
                  Save Supplier
                </button>
                <button onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Sort Bar */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search suppliers..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium placeholder:text-slate-400"
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="relative min-w-[200px]">
             <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                 <Filter size={16} />
             </div>
             <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full pl-10 pr-8 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none cursor-pointer font-medium"
             >
                 <option value="name">Sort by Name</option>
                 <option value="high-balance">Highest Payable</option>
                 <option value="low-balance">Highest Advance</option>
             </select>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mb-8">
        {currentSuppliers.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl shadow-lg p-12 text-center">
            <Truck className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-500 font-medium">No suppliers found</p>
          </div>
        ) : (
          currentSuppliers.map((supplier) => {
            const balance = calculateSupplierBalance(supplier);
            const linkedCustomer = findLinkedCustomer(supplier);

            return (
              <div key={supplier.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                      <Truck size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{supplier.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {supplier.city || "No City"}</p>
                          {linkedCustomer && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-bold flex items-center gap-1">
                              <LinkIcon size={8} /> Dual Role
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => confirmDelete(supplier)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><Phone size={14} className="text-emerald-500" /> Phone</span>
                    <span className="font-medium">{supplier.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><FileText size={14} className="text-emerald-500" /> Transactions</span>
                    <span className="font-medium">{supplier.ledger?.length || 0}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl mb-5 border ${balance >= 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${balance >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Current Balance</span>
                    {balance >= 0 ? <TrendingDown className="text-rose-500" size={18} /> : <TrendingUp className="text-emerald-500" size={18} />}
                  </div>
                  <div className={`text-2xl font-extrabold mt-1 ${balance >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    Rs. {Math.abs(balance).toLocaleString()}
                  </div>
                  <div className={`text-[10px] font-bold mt-1 uppercase ${balance >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {balance >= 0 ? 'Payable Amount' : 'Advance / Paid'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => openLedger(supplier)}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm"
                  >
                    <Eye size={16} /> Ledger
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    <Wallet size={16} /> Pay
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Show More / Show Less Controls */}
      <div className="flex justify-center items-center gap-4 relative z-10">
          {visibleCount < processedSuppliers.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + itemsPerPage)}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                  <ChevronDown size={20} /> Show More
              </button>
          )}
          
          {visibleCount > itemsPerPage && (
              <button 
                onClick={() => setVisibleCount(itemsPerPage)}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                  <ChevronUp size={20} /> Show Less
              </button>
          )}
      </div>

      {/* Ledger Modal */}
      {showLedger && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20 overflow-hidden animate-scale-in">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedSupplier.name}
                    {matchingCustomer && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg border border-purple-200 font-bold flex items-center gap-1"><LinkIcon size={10} /> Dual Profile</span>}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Transaction Ledger</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                  <button 
                    onClick={() => setShowEntryModal(true)}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Plus size={14} /> Add Manual Entry
                  </button>
                  <button onClick={() => { setShowLedger(false); setEditingEntry(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={24} className="text-slate-500" />
                  </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-white">
              {/* Stats Grid */}
              <div className={`grid grid-cols-1 ${matchingCustomer ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-6`}>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Supplier Balance</p>
                  <p className={`font-bold mt-1 ${calculateSupplierBalance(selectedSupplier) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Rs. {Math.abs(calculateSupplierBalance(selectedSupplier)).toLocaleString()} {calculateSupplierBalance(selectedSupplier) >= 0 ? '(Payable)' : '(Paid)'}
                  </p>
                </div>

                {matchingCustomer && (
                  <>
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <p className="text-xs text-purple-400 font-bold uppercase">Customer Balance</p>
                      <p className={`font-bold mt-1 ${calculateCustomerBalance(matchingCustomer) >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                        Rs. {Math.abs(calculateCustomerBalance(matchingCustomer)).toLocaleString()} {calculateCustomerBalance(matchingCustomer) >= 0 ? '(Receivable)' : '(Advance)'}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-white flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Net Business Position</p>
                        <p className="font-bold mt-1 text-lg">
                           {/* Net = (Cust Recv) - (Supp Payable) */}
                           Rs. {Math.abs(calculateCustomerBalance(matchingCustomer) - calculateSupplierBalance(selectedSupplier)).toLocaleString()} 
                           <span className="text-xs font-normal opacity-70 ml-1">
                             {(calculateCustomerBalance(matchingCustomer) - calculateSupplierBalance(selectedSupplier)) >= 0 ? ' (Receivable)' : ' (Payable)'}
                           </span>
                        </p>
                      </div>
                      <button 
                        onClick={() => { setContraForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "", weight: "", rate: "" }); setShowContraModal(true); }}
                        className="mt-2 w-full bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded-lg font-bold transition-all border border-white/10 flex items-center justify-center gap-1"
                      >
                        <ArrowLeftRight size={12} /> Settle Contra
                      </button>
                    </div>
                  </>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase">Transactions</p>
                  <p className="font-bold text-slate-700 mt-1">{selectedSupplier.ledger?.length || 0}</p>
                </div>
              </div>

              {/* Date Filters for Ledger */}
              <div className="flex flex-wrap gap-4 items-end mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                   <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">From</label>
                       <input 
                         type="date" 
                         value={ledgerStartDate} 
                         onChange={(e) => setLedgerStartDate(e.target.value)}
                         className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                       />
                   </div>
                   <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">To</label>
                       <input 
                         type="date" 
                         value={ledgerEndDate} 
                         onChange={(e) => setLedgerEndDate(e.target.value)}
                         className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                       />
                   </div>
                   <div className="flex-1 text-right self-center">
                       {ledgerStartDate && (
                           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                               Opening Bal: Rs. {ledgerOpeningBalance.toLocaleString()}
                           </span>
                       )}
                   </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-right">Weight</th>
                      <th className="p-4 text-right">Rate</th>
                      <th className="p-4 text-right text-rose-600">Debit (Paid)</th>
                      <th className="p-4 text-right text-emerald-600">Credit (Buy)</th>
                      <th className="p-4 text-right text-slate-700">Balance</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Opening Balance Row if Filtered */}
                    {ledgerStartDate && (
                        <tr className="bg-yellow-50/50">
                            <td className="p-4 text-slate-600 font-bold text-xs">{ledgerStartDate}</td>
                            <td className="p-4 text-slate-600 font-bold italic" colSpan={5}>Opening Balance (Before selected range)</td>
                            <td className="p-4 text-right font-bold text-slate-700">
                                {Math.abs(ledgerOpeningBalance).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{ledgerOpeningBalance >= 0 ? 'PYBL' : 'ADV'}</span>
                            </td>
                            <td></td>
                        </tr>
                    )}

                    {ledgerViewData.length > 0 ? (
                      ledgerViewData.map((entry, idx) => {
                        // Calculate running balance per row based on opening balance
                        renderRunningBalance += (entry.credit || 0) - (entry.debit || 0);
                        
                        return (
                          <tr key={entry.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                            {editingEntry === entry.id ? (
                              <>
                                <td className="p-2"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
                                <td className="p-2"><input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border border-slate-200 rounded p-1" /></td>
                                <td className="p-2"><input type="number" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
                                <td className="p-2"><input type="number" value={editForm.rate} onChange={(e) => setEditForm({...editForm, rate: e.target.value})} className="w-full border border-slate-200 rounded p-1 text-right" /></td>
                                <td className="p-2"><input type="number" value={editForm.debit} onChange={(e) => setEditForm({...editForm, debit: e.target.value})} className="w-full border border-rose-200 rounded p-1 text-right text-rose-600" /></td>
                                <td className="p-2"><input type="number" value={editForm.credit} onChange={(e) => setEditForm({...editForm, credit: e.target.value})} className="w-full border border-emerald-200 rounded p-1 text-right text-emerald-600" /></td>
                                <td className="p-2 text-right text-slate-400 italic">Updating...</td>
                                <td className="p-2 text-center">
                                  <div className="flex justify-center gap-1">
                                    <button onClick={() => handleSaveEdit(entry.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={14} /></button>
                                    <button onClick={() => setEditingEntry(null)} className="p-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"><X size={14} /></button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-4 text-slate-600 font-medium">{entry.date}</td>
                                <td className="p-4 text-slate-800 font-medium">{entry.description}</td>
                                <td className="p-4 text-right text-slate-600">{entry.weight || '-'}</td>
                                <td className="p-4 text-right text-slate-600">{entry.rate || '-'}</td>
                                <td className="p-4 text-right font-bold text-rose-600">{entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-'}</td>
                                <td className="p-4 text-right font-bold text-emerald-600">{entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-'}</td>
                                <td className="p-4 text-right font-bold text-slate-700">
                                  {Math.abs(renderRunningBalance).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{renderRunningBalance >= 0 ? 'PYBL' : 'ADV'}</span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditEntry(entry)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"><Trash2 size={14} /></button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="8" className="p-8 text-center text-slate-400">No ledger entries found in this range.</td></tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <tr>
                      <td colSpan="4" className="p-4 text-right text-slate-600 uppercase text-xs tracking-wider">View Totals</td>
                      <td className="p-4 text-right text-rose-700">
                        Rs. {ledgerViewData.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right text-emerald-700">
                        Rs. {ledgerViewData.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString()}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                    <tr className={renderRunningBalance >= 0 ? "bg-rose-50" : "bg-emerald-50"}>
                      <td colSpan="6" className="p-4 text-right text-slate-700 uppercase text-xs tracking-wider">Net Balance (End of Period)</td>
                      <td colSpan="2" className={`p-4 text-right text-lg font-extrabold ${renderRunningBalance >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        Rs. {Math.abs(renderRunningBalance).toLocaleString()}
                        <span className="text-xs font-medium ml-2 opacity-80">
                          {renderRunningBalance >= 0 ? '(PAYABLE)' : '(PAID)'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              {matchingCustomer && (
                <button
                  onClick={printConsolidatedLedger}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2"
                >
                  <Merge size={18} /> Consolidated Print
                </button>
              )}
              <button
                onClick={exportLedgerToCSV}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
              >
                  <Download size={18} /> Export CSV
              </button>
              <button
                onClick={printLedger}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Printer size={18} /> Print Ledger
              </button>
              <button
                onClick={() => setShowLedger(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showEntryModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Add Ledger Entry</h3>
                <p className="text-slate-300 text-sm mt-1">Manual Adjustment / Opening Balance</p>
              </div>
              <button onClick={() => setShowEntryModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                 <button 
                    onClick={() => setEntryForm({...entryForm, type: "credit"})}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${entryForm.type === "credit" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500 hover:bg-white/50"}`}
                 >
                    Credit (Payable)
                 </button>
                 <button 
                    onClick={() => setEntryForm({...entryForm, type: "debit"})}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${entryForm.type === "debit" ? "bg-white shadow-sm text-rose-700" : "text-slate-500 hover:bg-white/50"}`}
                 >
                    Debit (Paid)
                 </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (PKR)</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={entryForm.amount} 
                    onChange={e => setEntryForm({...entryForm, amount: e.target.value})} 
                    className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 outline-none transition-all ${entryForm.type === 'credit' ? 'focus:ring-emerald-500/20 focus:border-emerald-500 border-emerald-100' : 'focus:ring-rose-500/20 focus:border-rose-500 border-rose-100'}`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    value={entryForm.date} 
                    onChange={e => setEntryForm({...entryForm, date: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Opening Balance" 
                  value={entryForm.description} 
                  onChange={e => setEntryForm({...entryForm, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium"
                />
              </div>

              {/* Attachment UI */}
              <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Attachment (Optional)</label>
                  <div className="relative">
                      <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="file"
                        onChange={(e) => setEntryForm({...entryForm, attachment: e.target.files[0]})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-600 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-medium file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                      />
                  </div>
              </div>

              <button 
                onClick={handleAddEntry} 
                className={`w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${entryForm.type === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
              >
                <CheckCircle size={18} /> {entryForm.type === 'credit' ? 'Add Credit Entry' : 'Add Debit Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Record Payment</h3>
                <p className="text-emerald-100 text-sm mt-1">To {selectedSupplier.name}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (PKR)</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={paymentForm.amount} 
                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    value={paymentForm.date} 
                    onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Note / Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cash Payment" 
                  value={paymentForm.description} 
                  onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>

              {/* Attachment UI */}
              <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Payment Proof (Optional)</label>
                  <div className="relative">
                      <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="file"
                        onChange={(e) => setPaymentForm({...paymentForm, attachment: e.target.files[0]})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                      />
                  </div>
              </div>

              <button 
                onClick={handleMakePayment} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle size={18} /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contra Modal */}
      {showContraModal && selectedSupplier && matchingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in border border-purple-200">
            <div className="bg-purple-700 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><ArrowLeftRight size={20} /> Contra Settlement</h3>
                <p className="text-purple-100 text-sm mt-1">Offset / Barter Settlement</p>
              </div>
              <button onClick={() => setShowContraModal(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-800">
                This will reduce the <strong>Payable</strong> and <strong>Receivable</strong> simultaneously.
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Settlement Amount (PKR)</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={contraForm.amount} 
                    onChange={e => setContraForm({...contraForm, amount: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Weight & Rate Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Weight (Opt)</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="number" 
                      value={contraForm.weight} 
                      onChange={e => setContraForm({...contraForm, weight: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                      placeholder="e.g. 50 kg"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Rate (Opt)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="number" 
                      value={contraForm.rate} 
                      onChange={e => setContraForm({...contraForm, rate: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                      placeholder="e.g. 2500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Reason / Item Details</label>
                <input 
                  type="text" 
                  value={contraForm.description} 
                  onChange={e => setContraForm({...contraForm, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="e.g. Sold Wheat 50kg @ 2500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={contraForm.date} 
                  onChange={e => setContraForm({...contraForm, date: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                />
              </div>

              <button 
                onClick={handleContraSettlement} 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Processing..." : <><CheckCircle size={18} /> Confirm Offset</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-white/20">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete supplier "{deleteModal.name}"?</h3>
              <p className="text-xs text-red-500 font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => setDeleteModal({ show: false, id: null, name: "" })}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Deleting..." : <><Trash2 size={16} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}