
// "use client";
// import { useState } from "react";
// import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Eye } from "lucide-react";
// import * as XLSX from 'xlsx';

// const API_URL = "http://localhost:4000/api";

// export default function ExcelImportPage() {
//   const [importData, setImportData] = useState([]);
//   const [preview, setPreview] = useState([]);
//   const [showPreview, setShowPreview] = useState(false);
//   const [notification, setNotification] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [importStats, setImportStats] = useState(null);

//   const showNotification = (message, type = "success") => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   // Parse Excel/XLSX file
//   const parseExcelFile = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
      
//       reader.onload = (e) => {
//         try {
//           const data = new Uint8Array(e.target.result);
//           const workbook = XLSX.read(data, { type: 'array' });
          
//           // Get first sheet
//           const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
//           // Convert to JSON
//           const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
//           // Parse rows
//           const parsed = [];
          
//           // Start from row 1 (skip header row 0)
//           for (let i = 1; i < jsonData.length; i++) {
//             const row = jsonData[i];
            
//             if (!row || row.length < 3) continue; // Skip empty rows
            
//             const sr = row[0] || '';
//             const date = row[1] || '';
//             const description = row[2] || '';
//             const weight = row[3] || 0;
//             const rate = row[4] || 0;
//             const debit = row[5] || 0;
//             const credit = row[6] || 0;
//             const balance = row[7] || 0;
            
//             // Determine transaction type and party
//             let type = '';
//             let supplier = '';
//             let customer = '';
            
//             const descLower = String(description).toLowerCase();
            
//             // Purchase transactions (Stock In)
//             if (descLower.includes('u pvc') || descLower.includes('ubc') || 
//                 descLower.includes('siliver') || descLower.includes('silver')) {
//               type = 'purchase';
              
//               if (descLower.includes('chanti mall')) {
//                 supplier = 'Chanti Mall';
//               } else if (descLower.includes('daba mix')) {
//                 supplier = 'UBC Daba Mix Lot';
//               } else if (descLower.includes('siliver') || descLower.includes('silver')) {
//                 supplier = 'Siliver Ghat';
//               } else {
//                 supplier = String(description).split(' ').slice(0, 3).join(' ');
//               }
//             }
//             // Sale/Return transactions (Stock Out)
//             else if (descLower.includes('return') || descLower.includes('returan')) {
//               type = 'sale';
              
//               if (descLower.includes('mall shoper')) {
//                 customer = 'Mall Shoper';
//               } else if (descLower.includes('bilal')) {
//                 customer = 'Bilal Sab';
//               } else {
//                 customer = String(description).split(' ').slice(1, 4).join(' ');
//               }
//             }
//             // Payment/Banking transactions
//             else if (descLower.includes('cash') || descLower.includes('bank') || 
//                      descLower.includes('cheque') || descLower.includes('transfer') ||
//                      descLower.includes('mbl') || descLower.includes('ubl')) {
//               type = 'payment';
              
//               // Extract bank/party name for payment
//               if (descLower.includes('mughal')) {
//                 supplier = 'Mughal Matel';
//               } else if (descLower.includes('given')) {
//                 supplier = String(description);
//               }
//             }
//             else {
//               type = 'other';
//             }
            
//             // Format date if it's an Excel serial number
//             let formattedDate = date;
//             if (typeof date === 'number') {
//               const excelDate = XLSX.SSF.parse_date_code(date);
//               formattedDate = `${excelDate.m}/${excelDate.d}/${excelDate.y}`;
//             }
            
//             parsed.push({
//               sr: String(sr),
//               date: String(formattedDate),
//               description: String(description),
//               weight: parseFloat(weight) || 0,
//               rate: parseFloat(rate) || 0,
//               debit: parseFloat(debit) || 0,
//               credit: parseFloat(credit) || 0,
//               balance: parseFloat(balance) || 0,
//               type,
//               supplier,
//               customer
//             });
//           }
          
//           resolve(parsed);
//         } catch (error) {
//           reject(error);
//         }
//       };
      
//       reader.onerror = () => reject(new Error('Failed to read file'));
//       reader.readAsArrayBuffer(file);
//     });
//   };

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       setLoading(true);
//       showNotification("Parsing Excel file...", "success");
      
//       const parsed = await parseExcelFile(file);
//       setImportData(parsed);
//       setPreview(parsed.slice(0, 15)); // Show first 15 rows
//       setShowPreview(true);
//       showNotification(`Successfully parsed ${parsed.length} rows!`, "success");
//     } catch (error) {
//       console.error("Error parsing file:", error);
//       showNotification("Error parsing file. Please check the format.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processImport = async () => {
//     if (importData.length === 0) {
//       showNotification("No data to import!", "error");
//       return;
//     }

//     setLoading(true);
//     let successCount = 0;
//     let errorCount = 0;
//     let skippedCount = 0;
//     const errors = [];

//     try {
//       for (const row of importData) {
//         try {
//           // Skip payment/transfer/other rows
//           if (row.type === 'payment' || row.type === 'other') {
//             skippedCount++;
//             continue;
//           }

//           // Import purchases (Stock In)
//           if (row.type === 'purchase' && row.weight > 0) {
//             const stockInData = {
//               date: row.date,
//               description: row.description,
//               weight: row.weight,
//               rate: row.rate,
//               amount: row.debit || (row.weight * row.rate),
//               supplier: row.supplier || 'Unknown Supplier'
//             };

//             const res = await fetch(`${API_URL}/stock/stock-in`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(stockInData)
//             });

//             if (res.ok) {
//               successCount++;
//             } else {
//               const errorText = await res.text();
//               errorCount++;
//               errors.push(`Row ${row.sr}: ${errorText}`);
//             }
//           }
          
//           // Import sales (Stock Out)
//           else if (row.type === 'sale' && row.weight > 0) {
//             const stockOutData = {
//               date: row.date,
//               description: row.description,
//               weight: row.weight,
//               rate: row.rate,
//               amount: row.credit || (row.weight * row.rate),
//               customer: row.customer || 'Unknown Customer'
//             };

//             const res = await fetch(`${API_URL}/stock/stock-out`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(stockOutData)
//             });

//             if (res.ok) {
//               successCount++;
//             } else {
//               const errorText = await res.text();
//               errorCount++;
//               errors.push(`Row ${row.sr}: ${errorText}`);
//             }
//           } else {
//             skippedCount++;
//           }
//         } catch (error) {
//           errorCount++;
//           errors.push(`Row ${row.sr}: ${error.message}`);
//         }
//       }

//       setImportStats({ successCount, errorCount, skippedCount, errors });
      
//       if (errorCount === 0) {
//         showNotification(`Successfully imported ${successCount} transactions! (${skippedCount} payment/other entries skipped)`, "success");
//       } else {
//         showNotification(`Imported ${successCount} transactions with ${errorCount} errors. Check details below.`, "error");
//       }
//     } catch (error) {
//       console.error("Import error:", error);
//       showNotification("Import failed. Please try again.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-10 -m-3">
//       {/* Notification Toast */}
//       {notification && (
//         <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${
//           notification.type === "success" 
//             ? "bg-gradient-to-r from-green-500 to-emerald-500" 
//             : "bg-gradient-to-r from-red-500 to-rose-500"
//         }`}>
//           {notification.type === "success" ? <CheckCircle className="text-white" size={24} /> : <AlertCircle className="text-white" size={24} />}
//           <p className="text-white font-medium">{notification.message}</p>
//           <button onClick={() => setNotification(null)} className="text-white hover:bg-white/20 p-1 rounded-lg ml-2">
//             <X size={18} />
//           </button>
//         </div>
//       )}

//       {/* Header */}
//       <div className="text-center mb-8">
//         <div className="flex justify-center mb-4">
//           <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-3xl shadow-lg">
//             <FileSpreadsheet className="text-white" size={40} />
//           </div>
//         </div>
//         <h1 className="text-4xl font-bold text-slate-800">Import Excel Data</h1>
//         <p className="text-slate-600 mt-2">Upload your XLSX/XLS/CSV file to import transactions</p>
//       </div>

//       {/* File Upload Section */}
//       <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50 mb-8">
//         <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 transition-all">
//           <FileSpreadsheet className="mx-auto text-slate-400 mb-4" size={64} />
//           <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Your Excel File</h3>
//           <p className="text-slate-600 mb-6">Supports .xlsx, .xls, and .csv formats</p>
//           <label className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl cursor-pointer inline-flex items-center gap-3 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
//             <Upload size={24} />
//             <span className="font-semibold">Choose Excel File</span>
//             <input 
//               type="file" 
//               accept=".xlsx,.xls,.csv" 
//               onChange={handleFileUpload} 
//               className="hidden" 
//             />
//           </label>
//         </div>
//       </div>

//       {/* Data Preview */}
//       {showPreview && (
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-8">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
//                 <Eye className="text-emerald-600" size={24} />
//                 Data Preview
//               </h3>
//               <p className="text-sm text-slate-600 mt-1">
//                 Found {importData.length} rows • 
//                 Purchases: {importData.filter(r => r.type === 'purchase').length} • 
//                 Sales: {importData.filter(r => r.type === 'sale').length} • 
//                 Payments: {importData.filter(r => r.type === 'payment').length}
//               </p>
//             </div>
//             <button 
//               onClick={processImport}
//               disabled={loading}
//               className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                   Importing...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle size={20} />
//                   Import All Data
//                 </>
//               )}
//             </button>
//           </div>

//           <div className="overflow-x-auto rounded-xl border border-slate-200">
//             <table className="w-full text-sm">
//               <thead className="bg-slate-100">
//                 <tr>
//                   <th className="p-3 text-left font-semibold text-slate-700">Sr</th>
//                   <th className="p-3 text-left font-semibold text-slate-700">Date</th>
//                   <th className="p-3 text-left font-semibold text-slate-700">Description</th>
//                   <th className="p-3 text-center font-semibold text-slate-700">Type</th>
//                   <th className="p-3 text-right font-semibold text-slate-700">Weight</th>
//                   <th className="p-3 text-right font-semibold text-slate-700">Rate</th>
//                   <th className="p-3 text-right font-semibold text-slate-700">Amount</th>
//                   <th className="p-3 text-left font-semibold text-slate-700">Party</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {preview.map((row, idx) => (
//                   <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
//                     <td className="p-3 text-slate-600">{row.sr}</td>
//                     <td className="p-3 text-slate-600">{row.date}</td>
//                     <td className="p-3 font-medium text-slate-800">{row.description}</td>
//                     <td className="p-3 text-center">
//                       <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
//                         row.type === 'purchase' ? 'bg-green-100 text-green-700' :
//                         row.type === 'sale' ? 'bg-red-100 text-red-700' :
//                         row.type === 'payment' ? 'bg-blue-100 text-blue-700' :
//                         'bg-slate-100 text-slate-700'
//                       }`}>
//                         {row.type === 'purchase' ? '📥 Stock In' :
//                          row.type === 'sale' ? '📤 Stock Out' :
//                          row.type === 'payment' ? '💰 Payment' : 'Other'}
//                       </span>
//                     </td>
//                     <td className="p-3 text-right font-medium text-slate-700">{row.weight.toFixed(2)}</td>
//                     <td className="p-3 text-right text-slate-600">{row.rate.toFixed(2)}</td>
//                     <td className="p-3 text-right font-semibold text-slate-800">
//                       {row.type === 'purchase' ? row.debit.toFixed(2) : row.credit.toFixed(2)}
//                     </td>
//                     <td className="p-3 text-xs text-slate-600">
//                       {row.supplier || row.customer || '-'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           {importData.length > 15 && (
//             <p className="text-center text-slate-500 mt-4 text-sm">
//               Showing first 15 rows of {importData.length} total rows
//             </p>
//           )}
//         </div>
//       )}

//       {/* Import Statistics */}
//       {importStats && (
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
//           <h3 className="text-xl font-bold text-slate-800 mb-4">Import Results</h3>
          
//           <div className="grid md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-green-50 border border-green-200 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <CheckCircle className="text-green-600" size={24} />
//                 <span className="font-semibold text-green-800">Successful</span>
//               </div>
//               <p className="text-4xl font-bold text-green-700">{importStats.successCount}</p>
//               <p className="text-xs text-green-600 mt-1">Transactions imported</p>
//             </div>
            
//             <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <AlertCircle className="text-red-600" size={24} />
//                 <span className="font-semibold text-red-800">Failed</span>
//               </div>
//               <p className="text-4xl font-bold text-red-700">{importStats.errorCount}</p>
//               <p className="text-xs text-red-600 mt-1">Errors encountered</p>
//             </div>

//             <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <Download className="text-blue-600" size={24} />
//                 <span className="font-semibold text-blue-800">Skipped</span>
//               </div>
//               <p className="text-4xl font-bold text-blue-700">{importStats.skippedCount}</p>
//               <p className="text-xs text-blue-600 mt-1">Payment/other entries</p>
//             </div>
//           </div>

//           {importStats.errors.length > 0 && (
//             <div className="mt-4">
//               <h4 className="font-semibold text-slate-800 mb-3">Error Details:</h4>
//               <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-64 overflow-y-auto">
//                 {importStats.errors.map((error, idx) => (
//                   <p key={idx} className="text-sm text-red-700 mb-2 font-mono">{error}</p>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Instructions */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mt-8">
//         <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
//           <FileSpreadsheet className="text-blue-600" size={24} />
//           How It Works:
//         </h3>
//         <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
//           <div>
//             <h4 className="font-semibold mb-2">📊 Excel Format Expected:</h4>
//             <ul className="space-y-1 ml-4">
//               <li>• Column A: Sr (Row number)</li>
//               <li>• Column B: Date</li>
//               <li>• Column C: Description</li>
//               <li>• Column D: Weight</li>
//               <li>• Column E: Rate</li>
//               <li>• Column F: Debit</li>
//               <li>• Column G: Credit</li>
//               <li>• Column H: Balance</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-semibold mb-2">🤖 Auto-Detection:</h4>
//             <ul className="space-y-1 ml-4">
//               <li>• <strong>Stock In:</strong> U PVC, UBC, Silver entries</li>
//               <li>• <strong>Stock Out:</strong> Return/Returan entries</li>
//               <li>• <strong>Payments:</strong> Cash, Bank, Cheque entries (skipped)</li>
//               <li>• <strong>Suppliers/Customers:</strong> Auto-extracted from description</li>
//               <li>• <strong>Categories:</strong> Auto-created from description</li>
//             </ul>
//           </div>
//         </div>
//         <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <p className="text-sm text-yellow-800">
//             <strong>💡 Tip:</strong> Payment/banking entries will be skipped automatically. Only purchase and sale transactions will be imported into stock.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Eye } from "lucide-react";
import * as XLSX from 'xlsx';

const API_URL = "http://localhost:4000/api";

export default function ExcelImportPage() {
  const [importData, setImportData] = useState([]);
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importStats, setImportStats] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Parse Excel/XLSX file
  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Parse rows
          const parsed = [];
          
          // Start from row 1 (skip header row 0)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            if (!row || row.length < 3) continue; // Skip empty rows
            
            const sr = row[0] || '';
            const date = row[1] || '';
            const description = row[2] || '';
            const weight = row[3] || 0;
            const rate = row[4] || 0;
            const debit = row[5] || 0;
            const credit = row[6] || 0;
            const balance = row[7] || 0;
            
            // Determine transaction type and party
            let type = '';
            let supplier = '';
            let customer = '';
            
            const descLower = String(description).toLowerCase();
            
            // ALL suppliers are "Bilal Sab" (for purchases/stock in)
            supplier = 'Bilal Sab';
            
            // Payment/Banking transactions - these are payments to supplier (Bilal Sab)
            if (descLower.includes('cash') || descLower.includes('bank') || 
                descLower.includes('cheque') || descLower.includes('transfer') ||
                descLower.includes('mbl') || descLower.includes('ubl') ||
                descLower.includes('meezan') || descLower.includes('mughal')) {
              type = 'payment';
              supplier = 'Bilal Sab';
            }
            // Sale/Return transactions (Stock Out) - customer is "Mall Shoper"
            else if (descLower.includes('return') || descLower.includes('returan') || 
                     descLower.includes('shoper') || descLower.includes('mall shoper')) {
              type = 'sale';
              customer = 'Mall Shoper';
              supplier = ''; // No supplier for sales
            }
            // Purchase transactions (Stock In) - all other items are purchases from Bilal Sab
            else {
              type = 'purchase';
              supplier = 'Bilal Sab';
            }
            
            // Format date if it's an Excel serial number
            let formattedDate = date;
            if (typeof date === 'number') {
              const excelDate = XLSX.SSF.parse_date_code(date);
              formattedDate = `${excelDate.m}/${excelDate.d}/${excelDate.y}`;
            }
            
            parsed.push({
              sr: String(sr),
              date: String(formattedDate),
              description: String(description),
              weight: parseFloat(weight) || 0,
              rate: parseFloat(rate) || 0,
              debit: parseFloat(debit) || 0,
              credit: parseFloat(credit) || 0,
              balance: parseFloat(balance) || 0,
              type,
              supplier,
              customer
            });
          }
          
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      showNotification("Parsing Excel file...", "success");
      
      const parsed = await parseExcelFile(file);
      setImportData(parsed);
      setPreview(parsed.slice(0, 15)); // Show first 15 rows
      setShowPreview(true);
      showNotification(`Successfully parsed ${parsed.length} rows!`, "success");
    } catch (error) {
      console.error("Error parsing file:", error);
      showNotification("Error parsing file. Please check the format.", "error");
    } finally {
      setLoading(false);
    }
  };

  const processImport = async () => {
    if (importData.length === 0) {
      showNotification("No data to import!", "error");
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    try {
      for (const row of importData) {
        try {
          // Skip payment/transfer/other rows
          if (row.type === 'payment' || row.type === 'other') {
            skippedCount++;
            continue;
          }

          // Import purchases (Stock In)
          if (row.type === 'purchase' && row.weight > 0) {
            const stockInData = {
              date: row.date,
              description: row.description,
              weight: row.weight,
              rate: row.rate,
              amount: row.debit || (row.weight * row.rate),
              supplier: row.supplier || 'Unknown Supplier'
            };

            const res = await fetch(`${API_URL}/stock/stock-in`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(stockInData)
            });

            if (res.ok) {
              successCount++;
            } else {
              const errorText = await res.text();
              errorCount++;
              errors.push(`Row ${row.sr}: ${errorText}`);
            }
          }
          
          // Import sales (Stock Out)
          else if (row.type === 'sale' && row.weight > 0) {
            const stockOutData = {
              date: row.date,
              description: row.description,
              weight: row.weight,
              rate: row.rate,
              amount: row.credit || (row.weight * row.rate),
              customer: row.customer || 'Unknown Customer'
            };

            const res = await fetch(`${API_URL}/stock/stock-out`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(stockOutData)
            });

            if (res.ok) {
              successCount++;
            } else {
              const errorText = await res.text();
              errorCount++;
              errors.push(`Row ${row.sr}: ${errorText}`);
            }
          } else {
            skippedCount++;
          }
        } catch (error) {
          errorCount++;
          errors.push(`Row ${row.sr}: ${error.message}`);
        }
      }

      setImportStats({ successCount, errorCount, skippedCount, errors });
      
      if (errorCount === 0) {
        showNotification(`Successfully imported ${successCount} transactions! (${skippedCount} payment/other entries skipped)`, "success");
      } else {
        showNotification(`Imported ${successCount} transactions with ${errorCount} errors. Check details below.`, "error");
      }
    } catch (error) {
      console.error("Import error:", error);
      showNotification("Import failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen pt-24 px-6 pb-10 -m-3">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${
          notification.type === "success" 
            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
            : "bg-gradient-to-r from-red-500 to-rose-500"
        }`}>
          {notification.type === "success" ? <CheckCircle className="text-white" size={24} /> : <AlertCircle className="text-white" size={24} />}
          <p className="text-white font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="text-white hover:bg-white/20 p-1 rounded-lg ml-2">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-3xl shadow-lg">
            <FileSpreadsheet className="text-white" size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-800">Import Excel Data</h1>
        <p className="text-slate-600 mt-2">Upload your XLSX/XLS/CSV file to import transactions</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50 mb-8">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 transition-all">
          <FileSpreadsheet className="mx-auto text-slate-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Your Excel File</h3>
          <p className="text-slate-600 mb-6">Supports .xlsx, .xls, and .csv formats</p>
          <label className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl cursor-pointer inline-flex items-center gap-3 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            <Upload size={24} />
            <span className="font-semibold">Choose Excel File</span>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Data Preview */}
      {showPreview && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Eye className="text-emerald-600" size={24} />
                Data Preview
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Found {importData.length} rows • 
                Purchases: {importData.filter(r => r.type === 'purchase').length} • 
                Sales: {importData.filter(r => r.type === 'sale').length} • 
                Payments: {importData.filter(r => r.type === 'payment').length}
              </p>
            </div>
            <button 
              onClick={processImport}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Import All Data
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-700">Sr</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Description</th>
                  <th className="p-3 text-center font-semibold text-slate-700">Type</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Weight</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Rate</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Amount</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Party</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="p-3 text-slate-600">{row.sr}</td>
                    <td className="p-3 text-slate-600">{row.date}</td>
                    <td className="p-3 font-medium text-slate-800">{row.description}</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        row.type === 'purchase' ? 'bg-green-100 text-green-700' :
                        row.type === 'sale' ? 'bg-red-100 text-red-700' :
                        row.type === 'payment' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {row.type === 'purchase' ? '📥 Stock In' :
                         row.type === 'sale' ? '📤 Stock Out' :
                         row.type === 'payment' ? '💰 Payment' : 'Other'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-slate-700">{row.weight.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-600">{row.rate.toFixed(2)}</td>
                    <td className="p-3 text-right font-semibold text-slate-800">
                      {row.type === 'purchase' ? row.debit.toFixed(2) : row.credit.toFixed(2)}
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {row.supplier || row.customer || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {importData.length > 15 && (
            <p className="text-center text-slate-500 mt-4 text-sm">
              Showing first 15 rows of {importData.length} total rows
            </p>
          )}
        </div>
      )}

      {/* Import Statistics */}
      {importStats && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Import Results</h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={24} />
                <span className="font-semibold text-green-800">Successful</span>
              </div>
              <p className="text-4xl font-bold text-green-700">{importStats.successCount}</p>
              <p className="text-xs text-green-600 mt-1">Transactions imported</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-600" size={24} />
                <span className="font-semibold text-red-800">Failed</span>
              </div>
              <p className="text-4xl font-bold text-red-700">{importStats.errorCount}</p>
              <p className="text-xs text-red-600 mt-1">Errors encountered</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="text-blue-600" size={24} />
                <span className="font-semibold text-blue-800">Skipped</span>
              </div>
              <p className="text-4xl font-bold text-blue-700">{importStats.skippedCount}</p>
              <p className="text-xs text-blue-600 mt-1">Payment/other entries</p>
            </div>
          </div>

          {importStats.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-slate-800 mb-3">Error Details:</h4>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                {importStats.errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-red-700 mb-2 font-mono">{error}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mt-8">
        <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
          <FileSpreadsheet className="text-blue-600" size={24} />
          How It Works:
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">📊 Excel Format Expected:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Column A: Sr (Row number)</li>
              <li>• Column B: Date</li>
              <li>• Column C: Description</li>
              <li>• Column D: Weight</li>
              <li>• Column E: Rate</li>
              <li>• Column F: Debit</li>
              <li>• Column G: Credit</li>
              <li>• Column H: Balance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🤖 Auto-Detection:</h4>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Stock In:</strong> U PVC, UBC, Silver entries</li>
              <li>• <strong>Stock Out:</strong> Return/Returan entries</li>
              <li>• <strong>Payments:</strong> Cash, Bank, Cheque entries (skipped)</li>
              <li>• <strong>Suppliers/Customers:</strong> Auto-extracted from description</li>
              <li>• <strong>Categories:</strong> Auto-created from description</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Payment/banking entries will be skipped automatically. Only purchase and sale transactions will be imported into stock.
          </p>
        </div>
      </div>
    </div>
  );
}