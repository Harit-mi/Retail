import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import {
  BookOpen,
  Search,
  MessageSquare,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

// Helper: Mask phone number (e.g. +91 98765 *****)
const maskPhoneNumber = (phoneStr) => {
  if (!phoneStr) return "+91 98765 *****";
  const cleaned = phoneStr.replace(/[^0-9]/g, "");
  if (cleaned.length >= 10) {
    return `+91 ${cleaned.slice(-10, -5)} *****`;
  }
  return phoneStr;
};

export const CustomerLedger = () => {
  const { customers, recordCustomerPayment, storeConfig } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("Cash / UPI Collection");
  const [lastPaymentConfirmation, setLastPaymentConfirmation] = useState(null);
  const [showFullPhone, setShowFullPhone] = useState(false);

  const totalOutstanding = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const pendingCustomersCount = customers.filter((c) => c.balance > 0).length;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const activeCustomer = selectedCustomer || filteredCustomers[0];

  const handleCollectPayment = (e) => {
    e.preventDefault();
    if (!activeCustomer || !paymentAmount || Number(paymentAmount) <= 0) return;

    const collected = Number(paymentAmount);
    const prevBal = activeCustomer.balance;
    const newBal = Math.max(0, prevBal - collected);

    recordCustomerPayment(activeCustomer.id, collected, paymentNote);

    setLastPaymentConfirmation({
      customerName: activeCustomer.name,
      collected,
      prevBal,
      newBal,
    });

    setPaymentAmount("");
    setTimeout(() => setLastPaymentConfirmation(null), 5000);
  };

  const handleSendWhatsAppReminder = (cust) => {
    const text = `Namaste ${cust.name} ji, your pending Udhaar balance at ${storeConfig.name} is ₹${cust.balance}. Kindly settle via UPI at ${storeConfig.upiId || "store@upi"}. Thank you!`;
    const url = `https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");

    setReminderToast(`WhatsApp reminder sent to ${cust.name}!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Till Header Banner */}
      <div className="bg-[#0F1F35] text-white rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-black font-display tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#F5A623]" />
            <span>Udhaar Khata Credit Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Customer balance tracking, credit limits & payment collection
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-white/10 px-4 py-2 rounded-lg text-right flex-1 md:flex-none">
            <p className="text-[10px] text-amber-300 font-mono uppercase font-bold">Total Udhaar Due</p>
            <p className="text-lg font-black font-mono text-[#F5A623] tabular-nums">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-lg text-right flex-1 md:flex-none">
            <p className="text-[10px] text-red-300 font-mono uppercase font-bold">Pending Accounts</p>
            <p className="text-lg font-black font-mono text-red-400 tabular-nums">{pendingCustomersCount}</p>
          </div>
        </div>
      </div>

      {lastPaymentConfirmation && (
        <div className="bg-[#0F1F35] border-2 border-[#1FAA59] text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5A623]" />
            <span>
              Payment Collected from <strong>{lastPaymentConfirmation.customerName}</strong>: ₹{lastPaymentConfirmation.collected}
            </span>
          </div>
          <div className="bg-emerald-900/60 px-3 py-1 rounded text-emerald-200 font-bold">
            Balance: ₹{lastPaymentConfirmation.prevBal} ➔ <strong>₹{lastPaymentConfirmation.newBal}</strong>
          </div>
        </div>
      )}

      {/* Main Grid: Left Customer List, Right Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Customer List Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm font-display">
              Customer Accounts
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
              Khata Ledger
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold pl-9 pr-3 py-2.5 rounded-lg border-2 border-slate-200 outline-none focus:border-[#1E3A5F]"
            />
          </div>

          {/* Searchable Customer Cards */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = activeCustomer?.id === cust.id;
              const creditLimit = cust.creditLimit || 5000;
              const isOverLimit = cust.balance > creditLimit;
              const isZeroBalance = cust.balance === 0;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors select-none min-h-[56px] flex items-center justify-between ${
                    isSelected
                      ? "bg-amber-50/70 border-[#F5A623] shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 font-display">
                      {cust.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {showFullPhone ? cust.phone : maskPhoneNumber(cust.phone)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-black font-mono tabular-nums ${
                        isZeroBalance
                          ? "text-[#1FAA59]"
                          : isOverLimit
                          ? "text-[#E64545]"
                          : "text-slate-900"
                      }`}
                    >
                      ₹{cust.balance.toLocaleString("en-IN")}
                    </div>

                    {isZeroBalance ? (
                      <span className="text-[9px] bg-emerald-50 text-[#1FAA59] px-1.5 py-0.2 rounded font-mono font-bold">
                        ✓ Settled
                      </span>
                    ) : isOverLimit ? (
                      <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                        Over Limit
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Limit: ₹{creditLimit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowFullPhone(!showFullPhone)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition border border-slate-200"
          >
            {showFullPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFullPhone ? "Hide Customer Numbers" : "Show Full Customer Numbers"}</span>
          </button>
        </div>

        {/* Right Ledger Details View */}
        {activeCustomer && (
          <div className="lg:col-span-2 space-y-4">
            {/* Account Card Header */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold font-display text-slate-900">
                    {activeCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {showFullPhone ? activeCustomer.phone : maskPhoneNumber(activeCustomer.phone)} · {activeCustomer.city}
                  </p>
                </div>

                <button
                  onClick={() => handleSendWhatsAppReminder(activeCustomer)}
                  disabled={activeCustomer.balance === 0}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition disabled:opacity-40"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Reminder</span>
                </button>
              </div>

              {/* Record Payment Form */}
              <form onSubmit={handleCollectPayment} className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-900 font-display uppercase tracking-wider">
                  Record Cash / UPI Khata Payment
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount collected (₹)..."
                    className="flex-1 bg-white border-2 border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
                  />
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Payment note..."
                    className="flex-1 bg-white border-2 border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#1E3A5F]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow transition whitespace-nowrap"
                  >
                    COLLECT PAYMENT
                  </button>
                </div>
              </form>

              {/* History Ledger Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 font-display">Transaction History</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0F1F35] text-white text-[10px] uppercase">
                      <tr>
                        <th className="px-3 py-2">Date / Type</th>
                        <th className="px-3 py-2">Note</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeCustomer.history || []).length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-3 py-6 text-center text-slate-400 font-sans">
                            No ledger history recorded
                          </td>
                        </tr>
                      ) : (
                        (activeCustomer.history || []).map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <span className="font-bold text-slate-800">{h.type === "payment" ? "✓ Payment" : "Udhaar Bill"}</span>
                              <span className="block text-[10px] text-slate-400">{h.date}</span>
                            </td>
                            <td className="px-3 py-2 font-sans font-medium text-slate-600">{h.note || "General Transaction"}</td>
                            <td className={`px-3 py-2 text-right font-bold ${h.type === "payment" ? "text-[#1FAA59]" : "text-[#E64545]"}`}>
                              {h.type === "payment" ? `−₹${h.amount}` : `+₹${h.amount}`}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
