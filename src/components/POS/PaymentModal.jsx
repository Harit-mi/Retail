import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import confetti from "canvas-confetti";
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  BookOpen,
  CheckCircle,
  Printer,
  Sparkles,
  ArrowRight,
  Share2,
  Phone,
} from "lucide-react";

export const PaymentModal = ({ isOpen, onClose }) => {
  const {
    cartGrandTotal,
    cartCustomer,
    completeCheckout,
    storeConfig,
    printFormat,
    setPrintFormat,
  } = useStore();

  const [paymentMode, setPaymentMode] = useState("upi"); // 'cash', 'upi', 'card', 'udhar'
  const [cashTendered, setCashTendered] = useState("");
  const [udharAmount, setUdharAmount] = useState(cartGrandTotal);
  const [partialPaid, setPartialPaid] = useState("");

  if (!isOpen) return null;

  const cashReturnChange = Math.max(
    0,
    (Number(cashTendered) || 0) - cartGrandTotal
  );

  const handleCheckout = () => {
    let paidAmt = cartGrandTotal;

    if (paymentMode === "cash") {
      paidAmt = Math.min(cartGrandTotal, Number(cashTendered) || cartGrandTotal);
    } else if (paymentMode === "udhar") {
      paidAmt = Number(partialPaid) || 0;
    }

    // Trigger celebration fireworks
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }

    const createdBill = completeCheckout({
      mode: paymentMode,
      paidAmount: paidAmt,
    });

    onClose();

    // Trigger Print after short delay
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Generate UPI QR String (standard Indian National Payments Corporation NPCI format)
  // upi://pay?pa=address@upi&pn=StoreName&am=Amount&cu=INR
  const upiString = `upi://pay?pa=${encodeURIComponent(
    storeConfig.upiId || "guptakirana@upi"
  )}&pn=${encodeURIComponent(
    storeConfig.name
  )}&am=${cartGrandTotal}&cu=INR&tn=Invoice Payment`;

  // QR Code Google Chart API for instant QR preview
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiString
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="font-extrabold text-white text-lg flex items-center space-x-2">
              <span>Checkout & Payment</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Total: ₹{cartGrandTotal}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Select payment method & print receipt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Payment Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "upi", label: "UPI QR", icon: QrCode, color: "text-emerald-400" },
              { id: "cash", label: "Cash", icon: Banknote, color: "text-amber-400" },
              { id: "card", label: "Card", icon: CreditCard, color: "text-blue-400" },
              { id: "udhar", label: "Udhar Khata", icon: BookOpen, color: "text-purple-400" },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = paymentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setPaymentMode(mode.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-slate-800 border-emerald-500 text-white shadow-lg shadow-emerald-950/30"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${mode.color}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Payment Mode Content Panel */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
            {/* 1. UPI QR Code Mode */}
            {paymentMode === "upi" && (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/40">
                  <img
                    src={qrImageUrl}
                    alt="UPI QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Scan with PhonePe, GPay, Paytm or BHIM
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                    UPI ID: {storeConfig.upiId || "guptakirana@upi"}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Cash Mode */}
            {paymentMode === "cash" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Cash Received from Customer (₹)
                  </label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={`e.g. ${
                      cartGrandTotal > 500 ? "2000" : "500"
                    }`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-white outline-none focus:border-amber-500"
                  />
                </div>

                {/* Quick denomination buttons */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Quick Note:</span>
                  {[50, 100, 200, 500, 2000].map((note) => (
                    <button
                      key={note}
                      onClick={() => setCashTendered(note.toString())}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-amber-600/30 text-amber-300 rounded-lg text-xs font-bold border border-slate-700 transition"
                    >
                      ₹{note}
                    </button>
                  ))}
                </div>

                {/* Return Change Calculation Box */}
                {Number(cashTendered) > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-xs text-amber-300 font-semibold">
                      Return Change to Customer:
                    </span>
                    <span className="text-xl font-black text-amber-400">
                      ₹{cashReturnChange}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 3. Card Mode */}
            {paymentMode === "card" && (
              <div className="text-center py-4 space-y-2">
                <CreditCard className="w-10 h-10 text-blue-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">
                  Swipe or Tap Card on POS Terminal Machine
                </p>
                <p className="text-xs text-slate-400">
                  Press Complete Checkout after transaction is approved on card machine.
                </p>
              </div>
            )}

            {/* 4. Udhar / Khata Book Mode */}
            {paymentMode === "udhar" && (
              <div className="space-y-3">
                {!cartCustomer ? (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center">
                    <p className="text-xs font-semibold text-rose-300">
                      ⚠️ No customer linked to this bill!
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Please close this window and click "Select Customer" on the cart to link a customer account for Udhar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Customer:</span>
                      <span className="font-bold text-white">{cartCustomer.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Existing Udhar Balance:</span>
                      <span className="font-bold text-purple-400">₹{cartCustomer.balance}</span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Partial Cash Received (Optional, rest will be added to Udhar):
                      </label>
                      <input
                        type="number"
                        value={partialPaid}
                        onChange={(e) => setPartialPaid(e.target.value)}
                        placeholder="0 (if fully on Udhar)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 flex justify-between items-center text-xs">
                      <span className="text-purple-300 font-semibold">New Udhar Dues:</span>
                      <span className="text-base font-bold text-purple-300">
                        ₹{Math.max(0, cartGrandTotal - (Number(partialPaid) || 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Receipt Print Format Selection */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-1.5">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Receipt Format:</span>
            </span>

            <div className="flex space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setPrintFormat("thermal")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  printFormat === "thermal"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                80mm Thermal Slip
              </button>
              <button
                onClick={() => setPrintFormat("a4")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  printFormat === "a4"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Full A4 GST Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCheckout}
            disabled={paymentMode === "udhar" && !cartCustomer}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Complete & Print Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
