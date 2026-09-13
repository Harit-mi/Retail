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
  const [paymentMode, setPaymentMode] = useState("cash");
  const [lastPaymentConfirmation, setLastPaymentConfirmation] = useState(null);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [viewTab, setViewTab] = useState("khata"); // 'khata' or 'loyalty'

  const totalOutstanding = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const pendingCustomersCount = customers.filter((c) => c.balance > 0).length;
  const totalLoyaltyPoints = customers.reduce((acc, c) => acc + (c.loyaltyPoints || 0), 0);

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

    recordCustomerPayment(activeCustomer.id, collected, paymentNote, paymentMode);

    setLastPaymentConfirmation({
      customerName: activeCustomer.name,
      collected,
      prevBal,
      newBal,
      mode: paymentMode,
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
            <span>Udhaar Khata & Customer Loyalty Hub</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Manage customer credit ledgers, record payments & issue loyalty reward points
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
            <p className="text-[10px] text-emerald-300 font-mono uppercase font-bold">Total Loyalty Points</p>
            <p className="text-lg font-black font-mono text-[#1FAA59] tabular-nums">{totalLoyaltyPoints}</p>
          </div>
        </div>
      </div>

      {/* Module Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b-2 border-slate-200 pb-2">
        <button
          onClick={() => setViewTab("khata")}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold font-display transition ${
            viewTab === "khata"
              ? "bg-[#1E3A5F] text-white shadow"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          📖 Udhaar Credit Ledger ({pendingCustomersCount} Dues)
        </button>
        <button
          onClick={() => setViewTab("loyalty")}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold font-display transition ${
            viewTab === "loyalty"
              ? "bg-[#1E3A5F] text-white shadow"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🎁 Customer Loyalty Program ({totalLoyaltyPoints} Pts)
        </button>
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

      {/* Tab 1: Udhaar Khata View */}
      {viewTab === "khata" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Customer List Sidebar */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm font-display">
                Customer Accounts
              </h3>
              <span className="text-[10px] bg-slate-100 font-mono font-bold text-slate-700 px-2 py-0.5 rounded">
                Khata Ledger
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer name or phone…"
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 text-xs font-semibold pl-9 pr-3 py-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
              />
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredCustomers.map((cust) => {
                const isSelected = activeCustomer && activeCustomer.id === cust.id;
                const creditLimit = cust.creditLimit || 5000;
                const isOverLimit = cust.balance > creditLimit;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "border-[#F5A623] bg-amber-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 font-display">
                        {cust.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {showFullPhone ? cust.phone : maskPhoneNumber(cust.phone)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-black block ${
                          cust.balance > 0 ? "text-[#E64545]" : "text-[#1FAA59]"
                        }`}
                      >
                        ₹{cust.balance.toLocaleString("en-IN")}
                      </span>
                      {cust.balance === 0 ? (
                        <span className="text-[9px] bg-emerald-100 text-[#1FAA59] px-1.5 py-0.2 rounded font-mono font-bold">
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 font-display uppercase tracking-wider">
                      Record Udhaar Payment Collection
                    </h4>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("cash")}
                        className={`px-2.5 py-1 rounded transition border ${
                          paymentMode === "cash"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("upi")}
                        className={`px-2.5 py-1 rounded transition border ${
                          paymentMode === "upi"
                            ? "bg-[#0EA5A5] text-white border-[#0EA5A5]"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        UPI
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Amount collected (₹)…"
                      aria-label="Amount collected in rupees"
                      spellCheck={false}
                      className="flex-1 min-w-0 bg-white border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
                    />
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="Payment note / reference…"
                      aria-label="Payment note or reference"
                      spellCheck={false}
                      className="flex-1 min-w-0 bg-white border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
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
                          (activeCustomer.history || []).map((h, i) => {
                            const isRepayment = h.type === "credit" || h.type === "payment";
                            return (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-3 py-2">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isRepayment
                                      ? "bg-emerald-50 text-[#1FAA59] border border-emerald-200"
                                      : "bg-amber-50 text-amber-900 border border-amber-200"
                                  }`}>
                                    {isRepayment ? "✓ Payment Received" : "Udhaar Bill (Credit Sale)"}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 mt-0.5">{h.date}</span>
                                </td>
                                <td className="px-3 py-2 font-sans font-medium text-slate-600">{h.note || "General Transaction"}</td>
                                <td className={`px-3 py-2 text-right font-bold font-mono ${isRepayment ? "text-[#1FAA59]" : "text-[#E64545]"}`}>
                                  {isRepayment ? `−₹${h.amount}` : `+₹${h.amount}`}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Customer Loyalty Program View */}
      {viewTab === "loyalty" && (
        <div className="space-y-5">
          {/* Rules Banner */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-[#1FAA59] font-black font-display text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Earn Rate</span>
              </div>
              <p className="text-slate-700 font-semibold">1 Loyalty Point per ₹100 spent at billing checkout.</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-900 font-black font-display text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Redemption Rate</span>
              </div>
              <p className="text-slate-700 font-semibold">1 Point = ₹1 Instant Discount on next store bill.</p>
            </div>

            <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-sky-900 font-black font-display text-sm">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>How to Redeem at Checkout</span>
              </div>
              <p className="text-slate-700 font-semibold">Select customer in POS cart ➔ Enter points in Cart panel ➔ Auto-apply discount.</p>
            </div>
          </div>

          {/* Customer Loyalty Ranks Directory Table */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm font-display">Customer Loyalty Accounts & Reward Tiers</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0F1F35] text-white text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-center">Reward Tier</th>
                    <th className="px-4 py-3 text-right">Points Balance</th>
                    <th className="px-4 py-3 text-right">Discount Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const pts = c.loyaltyPoints || 0;
                    const tier = pts >= 200 ? "Gold VIP" : pts >= 100 ? "Silver Member" : "Bronze Member";
                    const tierClass = pts >= 200 ? "bg-amber-100 text-amber-900 border-amber-300" : pts >= 100 ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-orange-50 text-orange-800 border-orange-200";

                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold font-sans text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 text-slate-500">{c.phone}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tierClass}`}>
                            {tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-[#1FAA59]">{pts} Pts</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">₹{pts} Off</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
