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

  const [paymentMode, setPaymentMode] = useState("upi");
  const [cashTendered, setCashTendered] = useState("");
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

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }

    completeCheckout({
      mode: paymentMode,
      paidAmount: paidAmt,
    });

    onClose();

    setTimeout(() => {
      window.print();
    }, 500);
  };

  const upiString = `upi://pay?pa=${encodeURIComponent(
    storeConfig.upiId || "guptakirana@upi"
  )}&pn=${encodeURIComponent(
    storeConfig.name
  )}&am=${cartGrandTotal}&cu=INR&tn=Invoice Payment`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiString
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold font-display text-slate-900 text-base flex items-center space-x-2">
              <span>Checkout & Payment</span>
              <span className="text-xs bg-[#1FAA59]/10 text-[#1FAA59] border border-[#1FAA59]/30 px-2 py-0.5 rounded-full font-mono font-bold">
                Total: ₹{cartGrandTotal.toLocaleString("en-IN")}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Select payment method & print receipt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Payment Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "upi", label: "UPI QR", icon: QrCode, color: "text-[#0EA5A5]" },
              { id: "cash", label: "Cash", icon: Banknote, color: "text-[#1FAA59]" },
              { id: "card", label: "Card", icon: CreditCard, color: "text-blue-600" },
              { id: "udhar", label: "Udhaar", icon: BookOpen, color: "text-[#F5A623]" },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = paymentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setPaymentMode(mode.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                    isSelected
                      ? "bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-md"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-[#F5A623]" : mode.color}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mode Content */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            {paymentMode === "upi" && (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-md border-2 border-teal-500/40">
                  <img
                    src={qrImageUrl}
                    alt="UPI QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 font-display">
                    Scan with PhonePe, GPay, Paytm or BHIM
                  </p>
                  <p className="text-[11px] text-[#0EA5A5] font-mono font-bold mt-0.5">
                    UPI VPA: {storeConfig.upiId || "guptakirana@upi"}
                  </p>
                </div>
              </div>
            )}

            {paymentMode === "cash" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    Cash Tendered from Customer (₹)
                  </label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={`e.g. ${cartGrandTotal > 500 ? "2000" : "500"}`}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500">Quick Note:</span>
                  {[50, 100, 200, 500, 2000].map((note) => (
                    <button
                      key={note}
                      onClick={() => setCashTendered(note.toString())}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-mono font-bold border border-slate-300 transition"
                    >
                      ₹{note}
                    </button>
                  ))}
                </div>

                {Number(cashTendered) > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center text-xs">
                    <span className="text-[#1FAA59] font-bold">
                      Return Change to Customer:
                    </span>
                    <span className="text-lg font-mono font-black text-[#1FAA59]">
                      ₹{cashReturnChange}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMode === "card" && (
              <div className="text-center py-4 space-y-2">
                <CreditCard className="w-10 h-10 text-blue-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800 font-display">
                  Swipe or Tap Card on POS Terminal Machine
                </p>
                <p className="text-xs text-slate-500">
                  Press Complete & Print after card machine approval.
                </p>
              </div>
            )}

            {paymentMode === "udhar" && (
              <div className="space-y-3 text-xs">
                {!cartCustomer ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <p className="font-bold text-[#E64545]">
                      ⚠️ No Customer Account Linked
                    </p>
                    <p className="text-slate-600 mt-1">
                      Please close this window and select a customer account first to add to Udhaar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-bold text-slate-900">{cartCustomer.name}</span>
                    </div>

                    <div className="flex justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500">Existing Udhaar Balance:</span>
                      <span className="font-mono font-bold text-[#F5A623]">₹{cartCustomer.balance}</span>
                    </div>

                    <div>
                      <label className="text-slate-600 font-semibold block mb-1">
                        Partial Cash Paid Now (Optional):
                      </label>
                      <input
                        type="number"
                        value={partialPaid}
                        onChange={(e) => setPartialPaid(e.target.value)}
                        placeholder="0 (if fully on Udhaar)"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-[#1E3A5F]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Receipt Print Format Selection */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-semibold flex items-center space-x-1.5">
              <Printer className="w-4 h-4 text-[#1E3A5F]" />
              <span>Receipt Format:</span>
            </span>

            <div className="flex space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 font-bold">
              <button
                onClick={() => setPrintFormat("thermal")}
                className={`px-3 py-1 rounded-md text-xs transition ${
                  printFormat === "thermal"
                    ? "bg-[#1E3A5F] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setPrintFormat("a4")}
                className={`px-3 py-1 rounded-md text-xs transition ${
                  printFormat === "a4"
                    ? "bg-[#1E3A5F] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Full A4 GST
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            onClick={handleCheckout}
            disabled={paymentMode === "udhar" && !cartCustomer}
            className="flex items-center space-x-2 bg-[#F5A623] hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-black font-display px-6 py-2.5 rounded-xl shadow-md transition"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Complete & Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
