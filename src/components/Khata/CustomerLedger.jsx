import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import {
  BookOpen,
  Search,
  MessageSquare,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
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
  const [reminderToast, setReminderToast] = useState(null);
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

    setReminderToast(`WhatsApp reminder opened for ${cust.name}!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in text-zinc-900">
      {/* Top Ledger Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-zinc-950 tracking-tight">
              Customer Khata & Udhaar Ledger
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Credit accounts, payment reconciliation & loyalty rewards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="bg-zinc-50 border border-zinc-200/80 px-3.5 py-2 rounded-lg text-right flex-1 md:flex-none">
            <p className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">Total Udhaar Due</p>
            <p className="text-base font-bold font-mono text-red-600 tabular-nums">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200/80 px-3.5 py-2 rounded-lg text-right flex-1 md:flex-none">
            <p className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">Total Loyalty Points</p>
            <p className="text-base font-bold font-mono text-zinc-950 tabular-nums">{totalLoyaltyPoints}</p>
          </div>
        </div>
      </div>

      {/* Module Switcher Tabs */}
      <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200/80 w-fit">
        <button
          onClick={() => setViewTab("khata")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            viewTab === "khata"
              ? "bg-white text-zinc-950 shadow-2xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Udhaar Credit Ledger ({pendingCustomersCount} Dues)
        </button>
        <button
          onClick={() => setViewTab("loyalty")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            viewTab === "loyalty"
              ? "bg-white text-zinc-950 shadow-2xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Loyalty Program ({totalLoyaltyPoints} Pts)
        </button>
      </div>

      {/* Payment Confirmation Toast */}
      {lastPaymentConfirmation && (
        <div className="bg-zinc-950 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Collected ₹{lastPaymentConfirmation.collected} from <strong>{lastPaymentConfirmation.customerName}</strong>
            </span>
          </div>
          <div className="text-zinc-300">
            Balance: ₹{lastPaymentConfirmation.prevBal} → <strong className="text-white">₹{lastPaymentConfirmation.newBal}</strong>
          </div>
        </div>
      )}

      {/* Reminder Toast */}
      {reminderToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs animate-fade-in font-medium">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reminderToast}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold uppercase">
            WhatsApp
          </span>
        </div>
      )}

      {/* Tab 1: Udhaar Khata View */}
      {viewTab === "khata" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Customer List Rail */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="font-bold text-xs text-zinc-950 uppercase tracking-wider font-mono">
                Customer Directory
              </h3>
              <span className="text-[10px] bg-zinc-100 font-mono font-medium text-zinc-600 px-2 py-0.5 rounded">
                {filteredCustomers.length} Accounts
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone…"
                className="w-full bg-white border border-zinc-200 text-zinc-900 text-xs font-medium pl-9 pr-3 py-2 rounded-lg outline-none focus:border-zinc-950 transition placeholder-zinc-400"
              />
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredCustomers.map((cust) => {
                const isSelected = activeCustomer && activeCustomer.id === cust.id;
                const creditLimit = cust.creditLimit || 5000;
                const isOverLimit = cust.balance > creditLimit;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between select-none ${
                      isSelected
                        ? "border-zinc-950 bg-zinc-50/80 ring-1 ring-zinc-950/10 shadow-2xs"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="min-w-0 mr-2">
                      <h4 className="font-semibold text-xs text-zinc-950 truncate">
                        {cust.name}
                      </h4>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">
                        {showFullPhone ? cust.phone : maskPhoneNumber(cust.phone)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-mono font-bold block tabular-nums ${
                          cust.balance > 0 ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        ₹{cust.balance.toLocaleString("en-IN")}
                      </span>
                      {cust.balance === 0 ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono font-medium">
                          Settled ✓
                        </span>
                      ) : isOverLimit ? (
                        <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-mono font-medium">
                          Over Limit
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Limit ₹{creditLimit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowFullPhone(!showFullPhone)}
              className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-zinc-200 cursor-pointer"
            >
              {showFullPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showFullPhone ? "Mask Phone Numbers (DPDP)" : "Show Full Mobile Numbers"}</span>
            </button>
          </div>

          {/* Right Ledger Passbook Details View */}
          {activeCustomer && (
            <div className="lg:col-span-8 space-y-4">
              {/* Account Card Header */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-sm font-mono">
                      {activeCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-950 font-display">
                        {activeCustomer.name}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        {showFullPhone ? activeCustomer.phone : maskPhoneNumber(activeCustomer.phone)} · {activeCustomer.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendWhatsAppReminder(activeCustomer)}
                      disabled={activeCustomer.balance === 0}
                      className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp Payment Reminder</span>
                    </button>
                  </div>
                </div>

                {/* Record Payment Form */}
                <form onSubmit={handleCollectPayment} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-900 uppercase font-mono tracking-wider">
                      Record Payment Collection
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("cash")}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          paymentMode === "cash"
                            ? "bg-zinc-950 text-white font-semibold"
                            : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("upi")}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          paymentMode === "upi"
                            ? "bg-zinc-950 text-white font-semibold"
                            : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        UPI
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Amount collected (₹)…"
                      aria-label="Amount collected in rupees"
                      className="flex-1 min-w-0 bg-white border border-zinc-300 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono font-bold text-zinc-950 outline-none transition"
                    />
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="Payment reference (e.g. Cash / GPay)…"
                      aria-label="Payment note or reference"
                      className="flex-1 min-w-0 bg-white border border-zinc-300 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none transition"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Record Payment
                    </button>
                  </div>
                </form>

                {/* History Ledger Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-900 font-mono uppercase tracking-wider">
                    Passbook Ledger Statement
                  </h4>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-zinc-50 text-zinc-500 text-[10px] uppercase border-b border-zinc-200">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Date & Type</th>
                          <th className="px-4 py-2.5 font-semibold">Remarks / Note</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-sans">
                        {(activeCustomer.history || []).length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-4 py-8 text-center text-zinc-400 font-mono text-xs">
                              No ledger history recorded for this customer yet.
                            </td>
                          </tr>
                        ) : (
                          (activeCustomer.history || []).map((h, i) => {
                            const isRepayment = h.type === "credit" || h.type === "payment";
                            return (
                              <tr key={i} className="hover:bg-zinc-50/70 transition-colors">
                                <td className="px-4 py-2.5">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                                    isRepayment
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      : "bg-zinc-100 text-zinc-800 border border-zinc-200"
                                  }`}>
                                    {isRepayment ? "✓ Repayment" : "Udhaar Bill (Credit)"}
                                  </span>
                                  <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{h.date}</span>
                                </td>
                                <td className="px-4 py-2.5 text-zinc-700 text-xs">{h.note || "Standard Transaction"}</td>
                                <td className={`px-4 py-2.5 text-right font-bold font-mono tabular-nums ${isRepayment ? "text-emerald-700" : "text-zinc-950"}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-950 font-bold font-display text-sm">
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <span>Earn Rate</span>
              </div>
              <p className="text-zinc-600">1 Loyalty Point per ₹100 spent at billing checkout.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-950 font-bold font-display text-sm">
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <span>Redemption Rate</span>
              </div>
              <p className="text-zinc-600">1 Point = ₹1 Instant Discount on next store bill.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-950 font-bold font-display text-sm">
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <span>Checkout Redemption</span>
              </div>
              <p className="text-zinc-600">Select customer at checkout ➔ Check Redeem Points ➔ Auto-discount.</p>
            </div>
          </div>

          {/* Customer Loyalty Ranks Directory Table */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-zinc-950 font-display">Loyalty Members Directory</h3>
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 font-mono text-[10px] uppercase border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Customer Name</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 text-center font-semibold">Reward Tier</th>
                    <th className="px-4 py-3 text-right font-semibold">Points Balance</th>
                    <th className="px-4 py-3 text-right font-semibold">Discount Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-sans">
                  {customers.map((c) => {
                    const pts = c.loyaltyPoints || 0;
                    const tier = pts >= 200 ? "Gold VIP" : pts >= 100 ? "Silver Member" : "Bronze Member";
                    const tierClass = pts >= 200
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : pts >= 100
                      ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200";

                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-zinc-950">{c.name}</td>
                        <td className="px-4 py-3 text-zinc-500 font-mono">{showFullPhone ? c.phone : maskPhoneNumber(c.phone)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${tierClass}`}>
                            {tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-zinc-950">{pts} Pts</td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-emerald-700">₹{pts} Off</td>
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
