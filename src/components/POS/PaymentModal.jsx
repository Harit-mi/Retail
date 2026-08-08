import React, { useState } from "react";
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl card-shadow">
        {/* Header */}
        <div className="bg-[#1E3A5F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F5A623] text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
              <i className="fa-solid fa-cash-register"></i>
            </div>
            <div>
              <h3 className="font-extrabold font-display text-base tracking-tight">
                {t("payBill")} • DukaanPOS Checkout
              </h3>
              <p className="text-xs text-slate-300">
                {cartCustomer ? `Customer: ${cartCustomer.name}` : t("walkInCustomer")}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetModal}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedBill ? (
          <div className="p-6 space-y-6">
            {/* Grand Total Amount Display Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
                {t("grandTotal")}
              </span>
              <div className="text-3xl font-black font-mono text-slate-900 mt-0.5">
                ₹{cartGrandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 font-display uppercase tracking-wider block">
                Select Payment Mode
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "upi", label: t("upiQR"), icon: QrCode, desc: "Instant Dynamic QR", color: "text-[#0EA5A5] bg-teal-50" },
                  { id: "cash", label: t("cash"), icon: Banknote, desc: "Cash Tendered & Change", color: "text-[#1FAA59] bg-emerald-50" },
                  { id: "card", label: t("card"), icon: CreditCard, desc: "POS Terminal / Swiper", color: "text-blue-600 bg-blue-50" },
                  { id: "udhar", label: t("udhar"), icon: BookOpen, desc: "Customer Khata Ledger", color: "text-[#F5A623] bg-amber-50" },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMode === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => setPaymentMode(mode.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "border-[#1E3A5F] bg-slate-50 shadow-md ring-2 ring-[#1E3A5F]/20"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${mode.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#1E3A5F]" />
                        )}
                      </div>

                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900 font-display">
                          {mode.label}
                        </h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {mode.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mode 1: Dynamic NPCI UPI QR Generator */}
            {paymentMode === "upi" && (
              <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
                <div className="bg-white p-3 rounded-2xl border border-teal-200 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      upiUri
                    )}`}
                    alt="UPI QR Code"
                    className="w-32 h-32 object-contain rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 font-display">
                    Scan with PhonePe, GPay, Paytm, BHIM
                  </p>
                  <p className="text-[11px] font-mono text-teal-800 mt-0.5">
                    VPA: {storeConfig.upiId || "guptakirana@upi"}
                  </p>
                </div>
              </div>
            )}

            {/* Mode 2: Cash Return Calculator */}
            {paymentMode === "cash" && (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Cash Handed by Customer (₹):</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-28 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-right font-mono text-sm text-slate-900 outline-none focus:border-[#1FAA59]"
                  />
                </div>

                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-900">
                    {t("returnChange")}:
                  </span>
                  <span className="text-xl font-black font-mono text-[#1FAA59]">
                    ₹{cashChangeReturn.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {/* Mode 4: Udhaar Ledger Notice */}
            {paymentMode === "udhar" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 text-xs text-amber-900">
                <p className="font-bold">
                  ⚠️ Udhaar Bill Credit Entry
                </p>
                <p className="text-[11px] text-amber-800">
                  Bill amount ₹{cartGrandTotal} will be added to{" "}
                  <strong>{cartCustomer ? cartCustomer.name : "Customer Khata"}</strong>'s balance.
                </p>
              </div>
            )}

            {/* Complete Transaction Button */}
            <button
              onClick={handleFinalCheckout}
              className="w-full py-4 bg-[#F5A623] hover:bg-amber-500 text-slate-950 font-black font-display rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>CONFIRM PAYMENT & PRINT RECEIPT</span>
            </button>
          </div>
        ) : (
          /* Post-Checkout Success Screen */
          <div className="p-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1FAA59] flex items-center justify-center mx-auto text-3xl shadow-inner">
              <i className="fa-solid fa-circle-check"></i>
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                INVOICE GENERATED
              </span>
              <h4 className="text-2xl font-extrabold font-display text-slate-900 mt-1">
                {completedBill.id}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Amount Paid: <strong className="font-mono text-[#1FAA59]">₹{completedBill.grandTotal}</strong> via {completedBill.paymentMode.toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handlePrintReceipt("thermal")}
                className="py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-bold rounded-2xl text-xs transition flex items-center justify-center space-x-2 shadow-md"
              >
                <Printer className="w-4 h-4 text-[#F5A623]" />
                <span>80mm Thermal Slip</span>
              </button>

              <button
                onClick={() => handlePrintReceipt("standard")}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl text-xs transition flex items-center justify-center space-x-2 border border-slate-300"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>A4 GST Invoice</span>
              </button>
            </div>

            <button
              onClick={handleResetModal}
              className="w-full py-3 bg-slate-900 text-white font-extrabold font-display rounded-2xl text-xs transition"
            >
              Start Next Sale Counter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
