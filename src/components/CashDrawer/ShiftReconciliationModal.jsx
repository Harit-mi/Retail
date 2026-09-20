import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../context/useStore";
import { Coins, CheckCircle2, AlertTriangle, X, ShieldCheck, ArrowRight, Zap } from "lucide-react";

// Web Audio API Cash Drawer Solenoid Clunk Synthesizer
const playDrawerKickSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio restriction fallback
  }
};

export const ShiftReconciliationModal = ({ isOpen, onClose }) => {
  const { sales, storeConfig } = useStore();

  const openingFloat = storeConfig?.shiftOpeningFloat || 2000;

  // Calculate Cash Sales Total
  const cashSalesTotal = sales
    .filter((s) => s.paymentMode === "cash")
    .reduce((acc, s) => acc + (s.paidAmount || s.grandTotal || 0), 0);

  const expectedCashInDrawer = openingFloat + cashSalesTotal;

  const [actualCountedCash, setActualCountedCash] = useState(expectedCashInDrawer);
  const [cashierNotes, setCashierNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [auditTimestamp, setAuditTimestamp] = useState(null);
  const [drawerKickToast, setDrawerKickToast] = useState(false);

  // Sync actual counted cash when modal opens
  useEffect(() => {
    if (isOpen) {
      setActualCountedCash(expectedCashInDrawer);
      setIsSubmitted(false);
      setCashierNotes("");
      setDrawerKickToast(false);
    }
  }, [isOpen, expectedCashInDrawer]);

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const discrepancy = actualCountedCash - expectedCashInDrawer;

  const handleKickDrawer = () => {
    playDrawerKickSound();
    setDrawerKickToast(true);
    setTimeout(() => setDrawerKickToast(false), 2500);
  };

  const handleSubmitAudit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setAuditTimestamp(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

    // Save audit record to localStorage for audit history
    try {
      const existingAudits = JSON.parse(localStorage.getItem("dukaan_drawer_audits") || "[]");
      existingAudits.unshift({
        id: `AUDIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        openingFloat,
        cashSalesTotal,
        expectedCash: expectedCashInDrawer,
        actualCash: actualCountedCash,
        discrepancy,
        notes: cashierNotes,
      });
      localStorage.setItem("dukaan_drawer_audits", JSON.stringify(existingAudits.slice(0, 50)));
    } catch {
      // Ignore storage errors
    }
  };

  const modalJSX = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-audit-modal-title"
      className="fixed inset-0 z-[99999] bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-auto shrink-0 animate-fade-in"
        style={{
          maxHeight: "min(90vh, 580px)",
          height: "fit-content",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header */}
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 id="drawer-audit-modal-title" className="font-bold text-sm text-zinc-950 leading-tight">
                Cash Drawer & Shift Audit
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                Cash Float + Cash Sales vs Physical Count
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isSubmitted ? (
          <>
            {/* Scrollable Content Form - Guaranteed flex-1 and min-h-0 with internal scrolling */}
            <form
              id="drawer-audit-form"
              onSubmit={handleSubmitAudit}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 text-xs overscroll-contain"
            >
              {/* Calculation Breakdown Card */}
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 space-y-1.5 font-mono">
                <div className="flex justify-between text-zinc-600 text-[11px]">
                  <span>Shift Opening Float:</span>
                  <span className="font-bold text-zinc-900">
                    ₹{openingFloat.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-600 text-[11px]">
                  <span>Today's Cash Sales:</span>
                  <span className="font-bold text-emerald-600">
                    + ₹{cashSalesTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-bold text-zinc-950 pt-1.5 border-t border-zinc-200">
                  <span>Expected Drawer Cash:</span>
                  <span className="font-mono">₹{expectedCashInDrawer.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Physical Count Input with Quick Actions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="physical-cash-count" className="text-[11px] font-semibold text-zinc-800 block">
                    Counted Physical Cash in Drawer (₹) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setActualCountedCash(expectedCashInDrawer)}
                    className="text-[10px] font-mono font-semibold text-zinc-700 hover:text-zinc-950 hover:underline cursor-pointer"
                  >
                    Match Expected (Exact)
                  </button>
                </div>
                <input
                  id="physical-cash-count"
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={actualCountedCash}
                  onChange={(e) => setActualCountedCash(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 focus:border-zinc-900 rounded-lg px-3 py-1.5 text-base font-mono font-bold text-zinc-900 outline-none transition"
                />
              </div>

              {/* Hardware Kick Drawer Button */}
              <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-700 font-medium text-[11px]">
                    {drawerKickToast ? "ESC/POS Solenoid Pulse Sent!" : "Hardware ESC/POS Kick Pulse"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleKickDrawer}
                  className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white border border-zinc-200 hover:bg-zinc-100 rounded text-zinc-800 transition cursor-pointer"
                >
                  Pop Drawer
                </button>
              </div>

              {/* Real-time Discrepancy Status Badge */}
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-semibold ${
                  discrepancy === 0
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                    : discrepancy > 0
                    ? "bg-zinc-100 border-zinc-300 text-zinc-900"
                    : "bg-red-50/80 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {discrepancy === 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="text-[11px]">
                    {discrepancy === 0
                      ? "Perfect Match · Zero Variance"
                      : discrepancy > 0
                      ? `Cash Surplus (Extra cash)`
                      : `Cash Shortage (Deficit)`}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs shrink-0">
                  {discrepancy >= 0 ? `+₹${discrepancy}` : `-₹${Math.abs(discrepancy)}`}
                </span>
              </div>

              {/* Auditor Remarks */}
              <div>
                <label htmlFor="auditor-remarks" className="text-[10px] text-zinc-500 font-medium block mb-0.5">
                  Auditor Remarks / Variance Reason
                </label>
                <textarea
                  id="auditor-remarks"
                  rows={2}
                  value={cashierNotes}
                  onChange={(e) => setCashierNotes(e.target.value)}
                  placeholder="Optional remarks regarding petty cash payouts or notes breakdown..."
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 transition"
                />
              </div>
            </form>

            {/* Pinned Action Footer - NEVER pushed off screen, shrink-0 */}
            <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="drawer-audit-form"
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Sign-Off & Record Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          /* Post-Audit Submission Confirmation */
          <>
            <div className="p-6 text-center space-y-3.5 flex-1 min-h-0 overflow-y-auto">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest block">
                  Reconciliation Logged
                </span>
                <h4 className="text-lg font-bold text-zinc-900 mt-0.5">
                  Shift Audit Completed
                </h4>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  Recorded at {auditTimestamp} · Expected ₹{expectedCashInDrawer.toLocaleString("en-IN")} vs Counted ₹{actualCountedCash.toLocaleString("en-IN")}
                </p>
                {discrepancy !== 0 && (
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                    discrepancy > 0 ? "bg-zinc-100 text-zinc-800 border border-zinc-200" : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    Variance: {discrepancy > 0 ? `+₹${discrepancy}` : `-₹${Math.abs(discrepancy)}`}
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition cursor-pointer shadow-xs"
              >
                Close Audit Dialog
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalJSX, document.body) : null;
};
