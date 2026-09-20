import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { useStore } from "../../context/useStore";
import { calculateCashChange } from "../../utils/moneyMath";
import {
  Banknote,
  QrCode,
  CreditCard,
  BookOpen,
  CheckCircle2,
  Printer,
  X,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export const PaymentModal = ({ isOpen, onClose, onOpenCustomerModal }) => {
  const {
    cartGrandTotal,
    cartCustomer,
    completeCheckout,
    storeConfig,
    setPrintFormat,
    t,
  } = useStore();

  const [paymentMode, setPaymentMode] = useState("upi"); // 'upi', 'cash', 'card', 'udhar'
  const [cashTendered, setCashTendered] = useState(cartGrandTotal);
  const [completedBill, setCompletedBill] = useState(null);
  const [udharError, setUdharError] = useState("");

  const handleResetModal = useCallback(() => {
    setCompletedBill(null);
    setPaymentMode("upi");
    onClose();
  }, [onClose]);

  // Re-sync cash tendered to CURRENT bill total when modal opens
  useEffect(() => {
    if (isOpen) {
      setCashTendered(cartGrandTotal);
      setUdharError("");
      setCompletedBill(null);
    }
  }, [isOpen, cartGrandTotal]);

  // Enter key listener on success screen to immediately start next sale
  useEffect(() => {
    if (!isOpen || !completedBill) return;
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleResetModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, completedBill, handleResetModal]);

  if (!isOpen) return null;

  const cashChangeReturn = calculateCashChange(cashTendered, cartGrandTotal);
  const isUdhar = paymentMode === "udhar";
  const upiUri = `upi://pay?pa=${encodeURIComponent(
    storeConfig.upiId || "guptakirana@upi"
  )}&pn=${encodeURIComponent(
    storeConfig.name
  )}&am=${cartGrandTotal}&cu=INR&tn=Invoice Payment`;

  const handleFinalCheckout = () => {
    if (isUdhar && !cartCustomer) {
      setUdharError("A registered customer account is required to bill on Udhaar / Credit.");
      return;
    }
    const details = {
      mode: paymentMode,
      paidAmount: isUdhar ? 0 : cartGrandTotal,
    };
    const bill = completeCheckout(details);
    setCompletedBill(bill);

    // Fire subtle celebratory confetti on checkout completion
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.65 },
        colors: ["#18181B", "#059669", "#71717A"],
      });
    } catch {
      // Audio or canvas fallback
    }
  };

  const handlePrintReceipt = (format) => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const paymentOptions = [
    { id: "upi", label: t("upiQR"), icon: QrCode, desc: "Instant Dynamic QR", badge: "UPI" },
    { id: "cash", label: t("cash"), icon: Banknote, desc: "Cash & Change Due", badge: "Cash" },
    { id: "card", label: t("card"), icon: CreditCard, desc: "POS Terminal / Tap", badge: "Card" },
    { id: "udhar", label: t("udhar"), icon: BookOpen, desc: "Khata Credit Ledger", badge: "Udhaar" },
  ];

  const banknoteNotes = [
    { val: 100, label: "₹100" },
    { val: 200, label: "₹200" },
    { val: 500, label: "₹500" },
    { val: 2000, label: "₹2000" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in motion-reduce:animate-none"
    >
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-xl border border-zinc-200 flex flex-col max-h-[88vh]">
        {/* Header Bar */}
        <div className="bg-zinc-50 text-zinc-900 px-5 py-3.5 flex items-center justify-between border-b border-zinc-200">
          <div>
            <h3 id="payment-modal-title" className="font-bold text-sm text-zinc-950">
              Collect Tender
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
              <span>Customer:</span>
              <span className="font-semibold text-zinc-800">
                {cartCustomer ? cartCustomer.name : "Walk-in Customer"}
              </span>
              {cartCustomer && (
                <span className="text-[9px] bg-zinc-200 text-zinc-700 px-1 rounded font-mono">
                  Due: ₹{cartCustomer.balance || 0}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleResetModal}
            aria-label="Close payment modal"
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {!completedBill ? (
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Amount Due Card */}
            <div className="rounded-lg p-3.5 bg-zinc-950 text-white shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">
                  AMOUNT DUE
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  All taxes included (GST)
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                ₹{cartGrandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 font-mono uppercase tracking-wider block">
                Select Tender Mode
              </label>

              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMode === mode.id;
                  return (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => setPaymentMode(mode.id)}
                      className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between min-h-[50px] cursor-pointer ${
                        isSelected
                          ? "border-zinc-900 ring-1 ring-zinc-900/10 bg-zinc-50 text-zinc-950"
                          : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-zinc-950" : "text-zinc-400"}`} />
                        <span
                          className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded ${
                            isSelected
                              ? "bg-zinc-200 text-zinc-900"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {mode.badge}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-xs text-zinc-900">
                          {mode.label}
                        </h5>
                        <p className="text-[10px] text-zinc-400 font-mono truncate">
                          {mode.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode 1: Dynamic UPI QR */}
            {paymentMode === "upi" && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col items-center text-center gap-2 animate-fade-in">
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200 shadow-2xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                      upiUri
                    )}`}
                    alt="UPI QR Code"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    Scan with Any UPI App (Zero Fee)
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    GPay · PhonePe · Paytm · BHIM
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">
                    VPA: {storeConfig.upiId || "guptakirana@upi"}
                  </p>
                </div>
              </div>
            )}

            {/* Mode 2: Cash Return Calculator */}
            {paymentMode === "cash" && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3 animate-fade-in">
                <div className="flex justify-between items-center text-xs font-medium text-zinc-700">
                  <span>Cash Handed by Customer (₹)</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-28 bg-white border border-zinc-300 focus:border-zinc-900 rounded-lg px-2.5 py-1.5 text-right font-mono text-sm font-bold text-zinc-900 outline-none"
                  />
                </div>

                {/* Tender Shortcuts */}
                <div>
                  <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Tender Shortcuts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCashTendered(cartGrandTotal)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors border cursor-pointer ${
                        cashTendered === cartGrandTotal
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      Exact (₹{cartGrandTotal})
                    </button>

                    {banknoteNotes.map((note) => {
                      if (note.val < cartGrandTotal && cartGrandTotal > 500 && note.val < 500) return null;
                      return (
                        <button
                          type="button"
                          key={note.val}
                          onClick={() => setCashTendered(note.val)}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors border cursor-pointer ${
                            cashTendered === note.val
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          {note.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Return Change Readout */}
                <div className="pt-2.5 border-t border-zinc-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-medium text-zinc-700 block">
                      {t("returnChange")}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {cashChangeReturn >= 0 ? "Give balance to customer" : "Insufficient cash"}
                    </span>
                  </div>
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      cashChangeReturn >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    ₹{cashChangeReturn >= 0 ? cashChangeReturn.toLocaleString("en-IN") : "0.00"}
                  </span>
                </div>
              </div>
            )}

            {/* Mode 3: Card Reader */}
            {paymentMode === "card" && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col items-center text-center gap-2 animate-fade-in">
                <div className="w-10 h-10 rounded-lg bg-zinc-200 text-zinc-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900">
                    External Card Reader
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Tap or insert customer card on external EDC swipe machine
                  </p>
                </div>
              </div>
            )}

            {/* Mode 4: Udhaar Ledger */}
            {paymentMode === "udhar" && (
              <div className="space-y-2 animate-fade-in">
                {!cartCustomer ? (
                  <div className="bg-red-50/80 border border-red-200 rounded-lg p-3.5 space-y-2 text-xs text-red-900">
                    <div className="flex items-center gap-2 font-semibold text-red-950">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Customer Account Required for Udhaar</span>
                    </div>
                    <p className="text-[11px] text-red-800 leading-relaxed">
                      Credit sales cannot be booked to an anonymous walk-in customer. Please select or register a customer account in Khata.
                    </p>
                    {onOpenCustomerModal && (
                      <button
                        type="button"
                        onClick={onOpenCustomerModal}
                        className="mt-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Select Customer (F4)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-1 text-xs text-zinc-800">
                    <p className="font-semibold text-zinc-900">Khata Credit Sale</p>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      Bill amount <strong>₹{cartGrandTotal}</strong> will be logged to{" "}
                      <strong>{cartCustomer.name}</strong>'s balance (Current Due: ₹{cartCustomer.balance || 0}).
                    </p>
                  </div>
                )}
              </div>
            )}

            {udharError && (
              <p role="alert" className="text-xs font-medium text-red-600 font-mono bg-red-50 p-2 rounded border border-red-200">
                {udharError}
              </p>
            )}

            {/* Final Checkout Button */}
            <button
              onClick={handleFinalCheckout}
              disabled={isUdhar && !cartCustomer}
              className={`w-full py-3.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isUdhar && !cartCustomer
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isUdhar && !cartCustomer
                  ? "Select Customer for Udhaar"
                  : "Confirm Sale & Print Receipt"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Post-Checkout Success Screen */
          <div className="p-6 text-center space-y-5 animate-fade-in flex-1 overflow-y-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest block">
                Transaction Completed
              </span>
              <h4 className="text-xl font-bold font-mono text-zinc-900 mt-0.5">
                {completedBill.id}
              </h4>
              <p className="text-xs text-zinc-600 mt-1">
                Amount Settled:{" "}
                <strong className="font-mono text-zinc-950 font-bold">
                  ₹{completedBill.grandTotal.toLocaleString("en-IN")}
                </strong>{" "}
                via <span className="uppercase text-zinc-700 font-medium">{completedBill.paymentMode}</span>
              </p>
            </div>

            {/* Print Selection Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handlePrintReceipt("thermal")}
                className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>80mm Thermal Slip</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintReceipt("standard")}
                className="py-2.5 bg-white hover:bg-zinc-50 text-zinc-900 font-medium rounded-lg text-xs transition border border-zinc-200 cursor-pointer shadow-2xs flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400" />
                <span>A4 GST Invoice</span>
              </button>
            </div>

            {/* Start Next Sale */}
            <button
              type="button"
              onClick={handleResetModal}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>START NEXT SALE (ENTER)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
