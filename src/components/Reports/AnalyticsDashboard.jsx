import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  FileSpreadsheet,
  Download,
  IndianRupee,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { GSTReportExportModal } from "./GSTReportExportModal";

export const AnalyticsDashboard = () => {
  const { sales } = useStore();
  const [showGstModal, setShowGstModal] = useState(false);

  const totalSalesVal = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalTaxVal = sales.reduce((acc, s) => acc + s.taxAmount, 0);
  const totalDiscountVal = sales.reduce((acc, s) => acc + s.discount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-solid fa-chart-pie text-[#1E3A5F]"></i>
            <span>Financial Reports & GST Tax Audit</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time Profit & Loss, GST B2B/B2C summaries & CA export
          </p>
        </div>

        <button
          onClick={() => setShowGstModal(true)}
          className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#F5A623]" />
          <span>Export GSTR-1 & GSTR-3B Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Gross Sales Revenue</span>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{totalSalesVal.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">GST Output Tax Collected</span>
          <div className="text-2xl font-black font-mono text-teal-700">
            ₹{Math.round(totalTaxVal).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Discounts Given</span>
          <div className="text-2xl font-black font-mono text-[#E64545]">
            ₹{totalDiscountVal.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* GST Export Modal */}
      <GSTReportExportModal
        isOpen={showGstModal}
        onClose={() => setShowGstModal(false)}
      />
    </div>
  );
};
