import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Banknote,
  QrCode,
  CreditCard,
  BookOpen,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
} from "lucide-react";

export const PaymentModal = ({ isOpen, onClose }) => {
  const {
    cartGrandTotal,
    cartCustomer,
    completeCheckout,
    storeConfig,
    setPrintFormat,
    t,
  } = useStore();

  const [paymentMode, setPaymentMode] = useState("upi"); // 'cash', 'upi', 'card', 'udhar'
  const [cashTendered, setCashTendered] = useState(cartGrandTotal);
  const [completedBill, setCompletedBill] = useState(null);

  // Re-sync cash tendered to the CURRENT bill total every time the register
  // opens. Without this, cash-tendered carries over from the previous sale
  // (this modal stays mounted between transactions), producing wrong change
  // due on the very next customer.
  useEffect(() => {
    if (isOpen) {
      setCashTendered(cartGrandTotal);
    }
  }, [isOpen, cartGrandTotal]);

  if (!isOpen) return null;

  const cashChangeReturn = Math.max(0, cashTendered - cartGrandTotal);
  const isUdhar = paymentMode === "udhar";
  const upiUri = `upi://pay?pa=${encodeURIComponent(
    storeConfig.upiId || "guptakirana@upi"
  )}&pn=${encodeURIComponent(
    storeConfig.name
  )}&am=${cartGrandTotal}&cu=INR&tn=Invoice Payment`;

  const handleFinalCheckout = () => {
    const details = {
      mode: paymentMode,
      paidAmount: isUdhar ? 0 : cartGrandTotal,
    };
    const bill = completeCheckout(details);
    setCompletedBill(bill);
  };

  const handlePrintReceipt = (format) => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleResetModal = () => {
    setCompletedBill(null);
    setPaymentMode("upi");
    onClose();
  };

  const paymentOptions = [
    { id: "upi", label: t("upiQR"), icon: QrCode, desc: "Instant Dynamic QR" },
    { id: "cash", label: t("cash"), icon: Banknote, desc: "Cash Tendered & Change" },
    { id: "card", label: t("card"), icon: CreditCard, desc: "POS Terminal / Swiper" },
    { id: "udhar", label: t("udhar"), icon: BookOpen, desc: "Customer Khata Ledger" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Register-panel header, matching the dark ledger on the main till */}
        <div className="bg-[#0F1F35] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#F5A623] text-slate-950 flex items-center justify-center font-black text-base">
              <i className="fa-solid fa-cash-register"></i>
            </div>
            <div>
              <h3 className="font-extrabold font-display text-sm tracking-tight">
                {t("payBill")}
              </h3>
              <p className="text-[11px] text-slate-400">
                {cartCustomer ? cartCustomer.name : t("walkInCustomer")}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetModal}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedBill ? (
          <div className="p-5 space-y-5">
            {/* Amber LED-style total, echoing the main register display */}
            <div className="bg-[#0F1F35] rounded-lg px-4 py-3 flex items-baseline justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("grandTotal")}
              </span>
              <div className="text-3xl font-black font-mono text-[#F5A623] tabular-nums">
                ₹{cartGrandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 font-display uppercase tracking-wider block">
                Select Payment Mode
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {paymentOptions.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMode === mode.id;
                  return (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => setPaymentMode(mode.id)}
                      className={`p-3.5 rounded-lg border-2 text-left transition-colors flex flex-col justify-between min-h-[44px] ${
                        isSelected
                          ? "border-[#1E3A5F] bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-[#1E3A5F]" : "text-slate-400"}`} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1E3A5F]" />}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900 font-display">
                          {mode.label}
                        </h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode 1: Dynamic NPCI UPI QR Generator */}
            {paymentMode === "upi" && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center gap-2">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      upiUri
                    )}`}
                    alt="UPI QR Code"
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 font-display">
                    Scan with PhonePe, GPay, Paytm, BHIM
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    VPA: {storeConfig.upiId || "guptakirana@upi"}
                  </p>
                </div>
              </div>
            )}

            {/* Mode 2: Cash Return Calculator */}
            {paymentMode === "cash" && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Cash Handed by Customer (₹)</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-28 bg-white border-2 border-slate-300 rounded px-3 py-1.5 text-right font-mono text-sm text-slate-900 outline-none focus:border-[#1FAA59]"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">
                    {t("returnChange")}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#1FAA59] tabular-nums">
                    ₹{cashChangeReturn.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {/* Mode 4: Udhaar Ledger Notice */}
            {paymentMode === "udhar" && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-4 space-y-1 text-xs text-amber-900">
                <p className="font-bold">Udhaar Bill Credit Entry</p>
                <p className="text-[11px] text-amber-800">
                  Bill amount ₹{cartGrandTotal} will be added to{" "}
                  <strong>{cartCustomer ? cartCustomer.name : "Customer Khata"}</strong>'s balance.
                </p>
              </div>
            )}

            {/* Complete Transaction Button */}
            <button
              onClick={handleFinalCheckout}
              className="w-full py-4 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black font-display rounded-lg text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 min-h-[52px]"
            >
              <Sparkles className="w-5 h-5" />
              <span>CONFIRM PAYMENT & PRINT RECEIPT</span>
            </button>
          </div>
        ) : (
          /* Post-Checkout Success Screen */
          <div className="p-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1FAA59] flex items-center justify-center mx-auto text-3xl">
              <i className="fa-solid fa-circle-check"></i>
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                Invoice Generated
              </span>
              <h4 className="text-2xl font-extrabold font-display text-slate-900 mt-1">
                {completedBill.id}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Amount Paid:{" "}
                <strong className="font-mono text-[#1FAA59]">₹{completedBill.grandTotal}</strong>{" "}
                via {completedBill.paymentMode.toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handlePrintReceipt("thermal")}
                className="py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Printer className="w-4 h-4 text-[#F5A623]" />
                <span>80mm Thermal Slip</span>
              </button>

              <button
                onClick={() => handlePrintReceipt("standard")}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg text-xs transition border-2 border-slate-200 min-h-[44px]"
              >
                <Printer className="w-4 h-4 text-slate-600 inline mr-2" />
                A4 GST Invoice
              </button>
            </div>

            <button
              onClick={handleResetModal}
              className="w-full py-3.5 bg-[#0F1F35] text-white font-extrabold font-display rounded-lg text-xs transition min-h-[48px]"
            >
              Start Next Sale
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
