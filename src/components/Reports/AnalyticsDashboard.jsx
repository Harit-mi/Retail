import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import {
  Download,
  Calendar,
  CheckCircle,
  BarChart3,
} from "lucide-react";

export const AnalyticsDashboard = () => {
  const { sales, storeConfig } = useStore();
  const [dateRange, setDateRange] = useState("30"); // '7', '30', '90', 'all'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filter Sales History by Date Range
  const now = new Date();
  const filteredSales = sales.filter((sale) => {
    if (dateRange === "all") return true;
    const saleDate = new Date(sale.timestamp || sale.date || Date.now());
    const diffDays = (now - saleDate) / (1000 * 60 * 60 * 24);
    return diffDays <= Number(dateRange);
  });

  // Calculate High-Level Metrics
  const totalRevenue = filteredSales.reduce(
    (acc, s) => acc + (s.grandTotal || s.total || 0),
    0
  );
  const totalOrders = filteredSales.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Payment Breakdown
  const paymentBreakdown = filteredSales.reduce(
    (acc, s) => {
      const mode = (s.paymentMode || "cash").toLowerCase();
      if (mode === "upi") acc.upi += s.grandTotal || 0;
      else if (mode === "card") acc.card += s.grandTotal || 0;
      else if (mode === "udhar") acc.udhar += s.grandTotal || 0;
      else acc.cash += s.grandTotal || 0;
      return acc;
    },
    { cash: 0, upi: 0, card: 0, udhar: 0 }
  );

  // Aggregate GST Tax Base & HSN Breakdown
  const hsnSummaryMap = {};
  filteredSales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const hsn = item.hsn || "1905";
      if (!hsnSummaryMap[hsn]) {
        hsnSummaryMap[hsn] = {
          hsn,
          name: item.name,
          gst: item.gst || 5,
          qty: 0,
          taxableAmount: 0,
          cgst: 0,
          sgst: 0,
          totalTax: 0,
        };
      }
      const qty = item.qty || 1;
      const price = item.price || 0;
      const itemTotal = price * qty;
      const gstRate = item.gst || 5;

      const taxable = itemTotal / (1 + gstRate / 100);
      const totalTax = itemTotal - taxable;
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;

      hsnSummaryMap[hsn].qty += qty;
      hsnSummaryMap[hsn].taxableAmount += taxable;
      hsnSummaryMap[hsn].cgst += cgst;
      hsnSummaryMap[hsn].sgst += sgst;
      hsnSummaryMap[hsn].totalTax += totalTax;
    });
  });

  const hsnList = Object.values(hsnSummaryMap);

  // Helper: Sanitize string cells to prevent CSV Formula Injection (=, +, -, @)
  const sanitizeCsvCell = (str = "") => {
    const s = String(str).replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(s)) {
      return `'${s}`;
    }
    return s;
  };

  // Export CSV for GSTR-1 / GSTR-3B Tax Filing with Formula Injection Defense
  const exportGstCsv = () => {
    const headers = "HSN Code,Description,GST Rate (%),Qty Sold,Taxable Value (INR),CGST (INR),SGST (INR),Total Tax (INR)\n";
    const rows = hsnList
      .map(
        (h) =>
          `"${sanitizeCsvCell(h.hsn)}","${sanitizeCsvCell(h.name)}",${h.gst},${h.qty},${Math.round(h.taxableAmount)},${Math.round(h.cgst)},${Math.round(h.sgst)},${Math.round(h.totalTax)}`
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `GSTR_Tax_Summary_${storeConfig.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Till Register Header Banner */}
      <div className="bg-[#0F1F35] text-white rounded-xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-black font-display tracking-wide flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#F5A623]" />
            <span>Reports & GST Filing Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            CA-ready GSTR-1 / GSTR-3B tax reports & sales analytics
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Date Range Selector */}
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 text-white font-bold text-xs pl-9 pr-3 py-2.5 rounded-lg border border-white/20 outline-none cursor-pointer"
            >
              <option value="7" className="text-slate-900">Last 7 Days</option>
              <option value="30" className="text-slate-900">Last 30 Days</option>
              <option value="90" className="text-slate-900">Last 90 Days</option>
              <option value="all" className="text-slate-900">All Time</option>
            </select>
          </div>

          <button
            onClick={exportGstCsv}
            className="px-4 py-2.5 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 shadow transition whitespace-nowrap min-h-[42px]"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>Export GST CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#1FAA59] px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>GSTR Summary CSV Exported! Ready for CA filing upload.</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Total Sales Revenue</p>
          <div className="text-2xl font-black font-mono text-[#1E3A5F] mt-1 tabular-nums">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">{totalOrders} completed bills</p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Avg Bill Value</p>
          <div className="text-2xl font-black font-mono text-[#F5A623] mt-1 tabular-nums">
            ₹{Math.round(avgOrderValue).toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Per transaction average</p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">GST Tax Base Collected</p>
          <div className="text-2xl font-black font-mono text-[#1FAA59] mt-1 tabular-nums">
            ₹{Math.round(totalRevenue * 0.05).toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">GSTR-1 tax liability</p>
        </div>
      </div>

      {/* Payment Mix Breakdown */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm font-display">Till Payment Mix Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Cash Payments</span>
            <p className="text-base font-black text-slate-900 mt-0.5">₹{paymentBreakdown.cash.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-[#1FAA59] uppercase font-bold">UPI Payments</span>
            <p className="text-base font-black text-[#1FAA59] mt-0.5">₹{paymentBreakdown.upi.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-sky-50 p-3 rounded-lg border border-sky-200">
            <span className="text-[10px] text-sky-700 uppercase font-bold">Card / Terminal</span>
            <p className="text-base font-black text-sky-900 mt-0.5">₹{paymentBreakdown.card.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="text-[10px] text-amber-800 uppercase font-bold">Udhaar Khata</span>
            <p className="text-base font-black text-amber-900 mt-0.5">₹{paymentBreakdown.udhar.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* GSTR-1 HSN Tax Summary Table */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 bg-[#0F1F35] text-white flex items-center justify-between">
          <h3 className="font-extrabold font-display text-sm">GSTR-1 & GSTR-3B HSN Tax Base Table</h3>
          <span className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded text-amber-300 font-bold">CA-READY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-extrabold">HSN Code</th>
                <th className="px-4 py-3 font-extrabold">Description</th>
                <th className="px-4 py-3 font-extrabold text-center">GST Rate</th>
                <th className="px-4 py-3 font-extrabold text-right">Qty Sold</th>
                <th className="px-4 py-3 font-extrabold text-right">Taxable Value (INR)</th>
                <th className="px-4 py-3 font-extrabold text-right">CGST</th>
                <th className="px-4 py-3 font-extrabold text-right">SGST</th>
                <th className="px-4 py-3 font-extrabold text-right">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono font-medium">
              {hsnList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400 font-sans">
                    No sales recorded in selected date range
                  </td>
                </tr>
              ) : (
                hsnList.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{h.hsn}</td>
                    <td className="px-4 py-3 text-slate-700 font-sans font-semibold">{h.name}</td>
                    <td className="px-4 py-3 text-center">{h.gst}%</td>
                    <td className="px-4 py-3 text-right">{h.qty}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#1E3A5F]">₹{Math.round(h.taxableAmount)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">₹{Math.round(h.cgst)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">₹{Math.round(h.sgst)}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#1FAA59]">₹{Math.round(h.totalTax)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
