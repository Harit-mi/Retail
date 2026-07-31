import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Receipt,
  Download,
  Calendar,
  Printer,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";

export const AnalyticsDashboard = () => {
  const { sales, setPrintableBill, setPrintFormat } = useStore();

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalInvoicesCount = sales.length;

  // Calculate total GST tax collected across all sales
  const totalGSTCollected = sales.reduce((acc, s) => acc + (s.taxAmount || 0), 0);

  // Estimate Profit Margin (Total Revenue - Total Estimated Item Cost)
  const estimatedProfit = sales.reduce((acc, s) => {
    const saleCost = s.items.reduce(
      (itemAcc, item) => itemAcc + (item.costPrice || item.price * 0.75) * item.qty,
      0
    );
    return acc + (s.grandTotal - saleCost);
  }, 0);

  const handleReprintBill = (sale, format = "thermal") => {
    setPrintableBill(sale);
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Total Revenue
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              ₹{totalSalesRevenue.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Total Invoices Issued
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {totalInvoicesCount}
            </h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Total GST Tax Collected
            </p>
            <h3 className="text-2xl font-black text-teal-400 mt-1">
              ₹{Math.round(totalGSTCollected).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Estimated Net Profit
            </p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              ₹{Math.round(estimatedProfit).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base">
              Recent Sales & Billing Invoices
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of completed store transactions
            </p>
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-center">Items Count</th>
                <th className="py-3 px-4 text-right">Tax (GST)</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Re-Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No billing transactions recorded yet
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {s.id}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(s.date).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">
                        {s.customerName}
                      </div>
                      {s.customerPhone && (
                        <div className="text-[10px] text-slate-400">
                          {s.customerPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.paymentMode === "upi"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : s.paymentMode === "cash"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : s.paymentMode === "udhar"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {s.paymentMode}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-semibold">
                      {s.items.reduce((acc, item) => acc + item.qty, 0)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-teal-400">
                      ₹{s.taxAmount}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-white text-sm">
                      ₹{s.grandTotal}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleReprintBill(s, "thermal")}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Printer className="w-3 h-3 text-emerald-400" />
                          <span>80mm</span>
                        </button>
                        <button
                          onClick={() => handleReprintBill(s, "a4")}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Printer className="w-3 h-3 text-indigo-400" />
                          <span>A4 GST</span>
                        </button>
                      </div>
                    </td>
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
