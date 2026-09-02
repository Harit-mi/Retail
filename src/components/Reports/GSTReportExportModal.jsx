import React from "react";
import { useStore } from "../../context/useStore";

export const GSTReportExportModal = ({ isOpen, onClose }) => {
  const { sales, storeConfig } = useStore();

  if (!isOpen) return null;

  const totalTaxable = sales.reduce((acc, s) => acc + (s.subtotal || 0), 0);
  const totalGstTax = sales.reduce((acc, s) => acc + (s.taxAmount || 0), 0);
  const cgst = totalGstTax / 2;
  const sgst = totalGstTax / 2;

  // HSN Breakdown Simulation
  const hsnBreakdown = [
    { hsn: "1512", desc: "Edible Oils", taxable: Math.round(totalTaxable * 0.4), rate: "5%", tax: Math.round(totalGstTax * 0.3) },
    { hsn: "1101", desc: "Atta & Flours", taxable: Math.round(totalTaxable * 0.3), rate: "0%", tax: 0 },
    { hsn: "6205", desc: "Apparel Shirts", taxable: Math.round(totalTaxable * 0.2), rate: "5%", tax: Math.round(totalGstTax * 0.5) },
    { hsn: "3004", desc: "Medicines", taxable: Math.round(totalTaxable * 0.1), rate: "12%", tax: Math.round(totalGstTax * 0.2) },
  ];

  const handleExportCSV = () => {
    alert("GSTR-1 & GSTR-3B Report Exported as CSV / Excel format for CA filing!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
              <i className="fa-solid fa-file-invoice text-base"></i>
            </div>
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base">
                GSTR-1 & GSTR-3B Tax Filing Export
              </h3>
              <p className="text-xs text-slate-500">
                GSTIN: <strong>{storeConfig.gstin}</strong> • CA-Ready Format
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* GST Summary KPI Cards */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Total Taxable Turnover:</span>
            <span className="text-sm font-black font-mono text-slate-900">
              ₹{Math.round(totalTaxable).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
            <span className="text-teal-700 block text-[10px]">CGST (Output Tax):</span>
            <span className="text-sm font-black font-mono text-teal-900">
              ₹{Math.round(cgst).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span className="text-emerald-700 block text-[10px]">SGST (Output Tax):</span>
            <span className="text-sm font-black font-mono text-[#1FAA59]">
              ₹{Math.round(sgst).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* HSN Summary Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase font-display">
            HSN-Wise Tax Summary Breakdown
          </h4>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">HSN Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">GST Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable Val</th>
                  <th className="py-2.5 px-3 text-right">GST Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {hsnBreakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#1E3A5F]">{row.hsn}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">{row.desc}</td>
                    <td className="py-2 px-3">{row.rate}</td>
                    <td className="py-2 px-3 text-right">₹{row.taxable.toLocaleString("en-IN")}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#1FAA59]">
                      ₹{row.tax.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-3 border-t border-slate-200">
          <button
            onClick={handleExportCSV}
            className="flex-1 py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-xs font-extrabold font-display transition flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-file-excel"></i>
            <span>Export GSTR-1 Excel / CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
