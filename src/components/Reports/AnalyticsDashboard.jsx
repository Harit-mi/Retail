import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  FileSpreadsheet,
  Download,
  IndianRupee,
  TrendingUp,
  Receipt,
  Calendar,
  Banknote,
  QrCode,
  CreditCard,
  BookOpen,
  PieChart,
  CheckCircle,
} from "lucide-react";

export const AnalyticsDashboard = () => {
  const { sales, products, storeConfig } = useStore();
  const [dateRange, setDateRange] = useState("month"); // 'today', 'month', 'all'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filter Sales by Date Range
  const filteredSales = sales.filter((s) => {
    if (dateRange === "all") return true;
    const saleDate = new Date(s.date);
    const now = new Date();
    if (dateRange === "today") {
      return saleDate.toDateString() === now.toDateString();
    }
    if (dateRange === "month") {
      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Calculate End-of-Day Payment Mix Totals
  const paymentTotals = filteredSales.reduce(
    (acc, s) => {
      const mode = s.paymentMode || "cash";
      if (mode === "cash") acc.cash += s.grandTotal;
      else if (mode === "upi") acc.upi += s.grandTotal;
      else if (mode === "card") acc.card += s.grandTotal;
      else if (mode === "udhar") acc.udhar += s.grandTotal;
      acc.total += s.grandTotal;
      return acc;
    },
    { cash: 0, upi: 0, card: 0, udhar: 0, total: 0 }
  );

  const cashPct = paymentTotals.total > 0 ? Math.round((paymentTotals.cash / paymentTotals.total) * 100) : 0;
  const upiPct = paymentTotals.total > 0 ? Math.round((paymentTotals.upi / paymentTotals.total) * 100) : 0;
  const cardPct = paymentTotals.total > 0 ? Math.round((paymentTotals.card / paymentTotals.total) * 100) : 0;
  const udharPct = paymentTotals.total > 0 ? Math.round((paymentTotals.udhar / paymentTotals.total) * 100) : 0;

  // HSN Tax Breakdown Summary Logic
  const hsnSummaryMap = {};
  filteredSales.forEach((s) => {
    (s.items || []).forEach((item) => {
      const hsn = item.hsn || "1902";
      const gst = item.gst || 5;
      const totalInc = item.price * item.qty;
      const taxable = totalInc / (1 + gst / 100);
      const totalTax = totalInc - taxable;
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;

      if (!hsnSummaryMap[hsn]) {
        hsnSummaryMap[hsn] = {
          hsn,
          name: item.name,
          gst,
          qty: 0,
          taxableAmount: 0,
          cgst: 0,
          sgst: 0,
          totalTax: 0,
        };
      }
      hsnSummaryMap[hsn].qty += item.qty;
      hsnSummaryMap[hsn].taxableAmount += taxable;
      hsnSummaryMap[hsn].cgst += cgst;
      hsnSummaryMap[hsn].sgst += sgst;
      hsnSummaryMap[hsn].totalTax += totalTax;
    });
  });

  const hsnList = Object.values(hsnSummaryMap);

  // Export CSV for GSTR-1 / GSTR-3B Tax Filing
  const exportGstCsv = () => {
    const headers = "HSN Code,Description,GST Rate (%),Qty Sold,Taxable Value (INR),CGST (INR),SGST (INR),Total Tax (INR)\n";
    const rows = hsnList
      .map(
        (h) =>
          `"${h.hsn}","${h.name.replace(/"/g, '""')}",${h.gst},${h.qty},${Math.round(h.taxableAmount)},${Math.round(h.cgst)},${Math.round(h.sgst)},${Math.round(h.totalTax)}`
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `GSTR_Tax_Summary_${storeConfig.name}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Date Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-solid fa-chart-pie text-[#1E3A5F]"></i>
            <span>Till Reconciliation & GST Tax Dashboard</span>
          </h2>
          <p className="text-xs text-slate-500">
            End-of-day till cash balancing & CA-ready GSTR-1 / GSTR-3B tax reports
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Date Range Selector Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setDateRange("today")}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateRange === "today" ? "bg-[#1E3A5F] text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange("month")}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateRange === "month" ? "bg-[#1E3A5F] text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateRange === "all" ? "bg-[#1E3A5F] text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={exportGstCsv}
            className="px-5 py-2.5 bg-[#1FAA59] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-md transition whitespace-nowrap min-h-[44px]"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export GST CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#1FAA59] px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>GSTR-1 & GSTR-3B CSV File Exported Successfully!</span>
        </div>
      )}

      {/* TOP SECTION: END-OF-DAY TILL PAYMENT MIX SUMMARY (Cash / UPI / Card / Udhaar) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-[#1E3A5F]" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-display">
                End-of-Day Till Payment Mix Reconciliation
              </h3>
              <p className="text-xs text-slate-500">
                Glanceable till balancing: Total Revenue ₹{paymentTotals.total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-[#1E3A5F] bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
            {filteredSales.length} Transactions
          </span>
        </div>

        {/* Visual Payment Mix Segmented Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${cashPct}%` }} className="bg-[#1FAA59] h-full transition-all duration-500" title={`Cash: ${cashPct}%`} />
            <div style={{ width: `${upiPct}%` }} className="bg-[#0EA5A5] h-full transition-all duration-500" title={`UPI: ${upiPct}%`} />
            <div style={{ width: `${cardPct}%` }} className="bg-blue-600 h-full transition-all duration-500" title={`Card: ${cardPct}%`} />
            <div style={{ width: `${udharPct}%` }} className="bg-[#F5A623] h-full transition-all duration-500" title={`Udhaar: ${udharPct}%`} />
          </div>

          {/* Payment Mode KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-900 font-bold font-sans mb-1">
                <Banknote className="w-4 h-4 text-[#1FAA59]" />
                <span>Cash Register</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                ₹{paymentTotals.cash.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{cashPct}% of Total</p>
            </div>

            <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-teal-900 font-bold font-sans mb-1">
                <QrCode className="w-4 h-4 text-[#0EA5A5]" />
                <span>UPI Bank QR</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                ₹{paymentTotals.upi.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-teal-700 font-bold mt-0.5">{upiPct}% of Total</p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-blue-900 font-bold font-sans mb-1">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Card Swiper</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                ₹{paymentTotals.card.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-blue-700 font-bold mt-0.5">{cardPct}% of Total</p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3">
              <div className="flex items-center space-x-1.5 text-xs text-amber-900 font-bold font-sans mb-1">
                <BookOpen className="w-4 h-4 text-[#F5A623]" />
                <span>Udhaar Dues</span>
              </div>
              <div className="text-lg font-black text-[#E64545]">
                ₹{paymentTotals.udhar.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-amber-700 font-bold mt-0.5">{udharPct}% of Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: GSTR-1 / GSTR-3B HSN TAX SUMMARY TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              GSTR-1 & GSTR-3B HSN-Wise Tax Summary Table
            </h3>
            <p className="text-xs text-slate-500">
              Official Indian GST tax breakdown for monthly CA return filing
            </p>
          </div>

          <button
            onClick={exportGstCsv}
            className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* HSN Summary Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold text-[10px] border-b border-slate-200 font-display">
              <tr>
                <th className="py-3 px-3">HSN Code</th>
                <th className="py-3 px-3">Category / Description</th>
                <th className="py-3 px-3">GST %</th>
                <th className="py-3 px-3 text-right">Qty Sold</th>
                <th className="py-3 px-3 text-right">Taxable Value (₹)</th>
                <th className="py-3 px-3 text-right">CGST (₹)</th>
                <th className="py-3 px-3 text-right">SGST (₹)</th>
                <th className="py-3 px-3 text-right">Total Tax (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono text-xs">
              {hsnList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans font-medium">
                    No sales recorded for the selected period
                  </td>
                </tr>
              ) : (
                hsnList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-[#1E3A5F]">{row.hsn}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900">{row.name}</td>
                    <td className="py-3 px-3 font-bold text-teal-700">{row.gst}%</td>
                    <td className="py-3 px-3 text-right font-bold">{row.qty}</td>
                    <td className="py-3 px-3 text-right font-bold">₹{Math.round(row.taxableAmount)}</td>
                    <td className="py-3 px-3 text-right text-slate-600">₹{Math.round(row.cgst)}</td>
                    <td className="py-3 px-3 text-right text-slate-600">₹{Math.round(row.sgst)}</td>
                    <td className="py-3 px-3 text-right font-black text-teal-800">₹{Math.round(row.totalTax)}</td>
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
