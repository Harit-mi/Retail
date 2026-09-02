import React, { useState } from "react";
import { useStore } from "../../context/useStore";

export const ShiftReconciliationModal = ({ isOpen, onClose }) => {
  const { sales, storeConfig } = useStore();

  const openingFloat = storeConfig.shiftOpeningFloat || 2000;

  // Calculate Cash Sales Total
  const cashSalesTotal = sales
    .filter((s) => s.paymentMode === "cash")
    .reduce((acc, s) => acc + (s.paidAmount || s.grandTotal), 0);

  const expectedCashInDrawer = openingFloat + cashSalesTotal;

  const [actualCountedCash, setActualCountedCash] = useState(expectedCashInDrawer);
  const [cashierNotes, setCashierNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const discrepancy = actualCountedCash - expectedCashInDrawer;

  const handleSubmitAudit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F5A623] border border-amber-200 flex items-center justify-center font-bold">
              <i className="fa-solid fa-vault text-base"></i>
            </div>
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base">
                Day-End Cash Drawer Reconciliation
              </h3>
              <p className="text-xs text-slate-500">
                Shift Audit • Cash Float + Sales vs Physical Count
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

        {!isSubmitted ? (
          <form onSubmit={handleSubmitAudit} className="space-y-4">
            {/* Calculation Audit Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Shift Opening Cash Float:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{openingFloat.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Today's Total Cash Billing:</span>
                <span className="font-mono font-bold text-[#1FAA59]">
                  + ₹{cashSalesTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold font-mono text-slate-900 pt-2 border-t border-slate-200">
                <span>Expected Drawer Cash:</span>
                <span>₹{expectedCashInDrawer.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Counted Cash Input */}
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Enter Physical Counted Cash in Drawer (₹) *
              </label>
              <input
                type="number"
                required
                value={actualCountedCash}
                onChange={(e) => setActualCountedCash(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-base font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            {/* Discrepancy Alert */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between font-bold ${
                discrepancy === 0
                  ? "bg-emerald-50 border-emerald-200 text-[#1FAA59]"
                  : discrepancy > 0
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : "bg-red-50 border-red-200 text-[#E64545]"
              }`}
            >
              <span>
                {discrepancy === 0
                  ? "✓ Perfect Match (Zero Discrepancy)"
                  : discrepancy > 0
                  ? `▲ Cash Surplus (+₹${discrepancy})`
                  : `▼ Cash Shortfall (-₹${Math.abs(discrepancy)})`}
              </span>
              <span className="font-mono font-black text-sm">
                ₹{discrepancy}
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                Shift Auditor Notes / Remarks
              </label>
              <textarea
                rows={2}
                value={cashierNotes}
                onChange={(e) => setCashierNotes(e.target.value)}
                placeholder="Reason for discrepancy if any..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold font-display rounded-xl text-xs transition shadow-md"
            >
              Sign-Off & Close Shift Drawer Audit
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1FAA59] flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-circle-check"></i>
            </div>

            <div>
              <h4 className="font-extrabold font-display text-slate-900 text-base">
                Shift Audit Completed & Saved!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Recorded expected ₹{expectedCashInDrawer} vs counted ₹{actualCountedCash}.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
