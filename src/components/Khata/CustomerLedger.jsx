import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  BookOpen,
  UserPlus,
  Search,
  IndianRupee,
  Phone,
  MessageSquare,
  CheckCircle,
  Share2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
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
  const { customers, recordCustomerPayment, storeConfig, t } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("Cash / UPI Collection");
  const [lastPaymentConfirmation, setLastPaymentConfirmation] = useState(null);
  const [reminderToast, setReminderToast] = useState(null);

  const totalOutstanding = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const pendingCustomersCount = customers.filter((c) => c.balance > 0).length;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const activeCustomer = selectedCustomer
    ? customers.find((c) => c.id === selectedCustomer.id) || selectedCustomer
    : customers[0];

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!activeCustomer || !paymentAmount || Number(paymentAmount) <= 0) return;

    const collected = Number(paymentAmount);
    const prevBalance = activeCustomer.balance || 0;
    const newBalance = Math.max(0, prevBalance - collected);

    recordCustomerPayment(activeCustomer.id, collected, paymentNote);

    // Set Before / After Balance Confirmation Toast
    setLastPaymentConfirmation({
      customerName: activeCustomer.name,
      prevBal: prevBalance,
      collected: collected,
      newBal: newBalance,
    });
    setTimeout(() => setLastPaymentConfirmation(null), 5000);

    setPaymentAmount("");
    setPaymentNote("Cash / UPI Collection");
  };

  // WhatsApp Payment Reminder Deep-link Trigger
  const triggerWhatsAppReminder = (customer) => {
    const text = `Namaste ${customer.name} Ji! 🛒
Aapka total Udhar balance ₹${customer.balance} hai at ${storeConfig.name}.
Please pay via UPI at ${storeConfig.upiId || "our store UPI ID"}.
Dhanyawad! - ${storeConfig.ownerName || "Gupta Kirana"}`;

    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const encodedText = encodeURIComponent(text);

    window.open(`https://wa.me/${formattedPhone}?text=${encodedText}`, "_blank");

    setReminderToast(`WhatsApp reminder launched for ${customer.name}!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Stat Summary Cards for Udhaar Khata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              Total Udhaar Dues
            </p>
            <h3 className="text-2xl font-black font-mono text-[#E64545] mt-1">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-red-50 text-[#E64545] border border-red-100 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              Customers with Dues
            </p>
            <h3 className="text-2xl font-black font-mono text-[#F5A623] mt-1">
              {pendingCustomersCount}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-[#F5A623] border border-amber-100 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              Total Khata Customers
            </p>
            <h3 className="text-2xl font-black font-mono text-[#1FAA59] mt-1">
              {customers.length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-[#1FAA59] border border-emerald-100 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Before / After Payment Confirmation Banner */}
      {lastPaymentConfirmation && (
        <div className="bg-[#1FAA59] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between animate-fade-in font-mono">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#F5A623] animate-spin" />
            <span>
              Payment Collected from <strong>{lastPaymentConfirmation.customerName}</strong>: ₹{lastPaymentConfirmation.collected}
            </span>
          </div>
          <div className="bg-emerald-900/40 px-3 py-1 rounded-xl text-emerald-100">
            Balance: ₹{lastPaymentConfirmation.prevBal} ➔ <strong>₹{lastPaymentConfirmation.newBal}</strong>
          </div>
        </div>
      )}

      {/* Reminder Toast */}
      {reminderToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center space-x-2 animate-bounce">
          <MessageSquare className="w-4 h-4" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Main Grid: Left Customer List, Right Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Customer List Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 card-shadow">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm font-display">
              Customer Udhaar Accounts
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
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
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#1E3A5F]"
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
                  className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none min-h-[56px] flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-50/70 border-[#F5A623] ring-2 ring-[#F5A623]/30 shadow-md"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-900 font-display">
                        {cust.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {maskPhoneNumber(cust.phone)}
                      </p>
                    </div>

                    <div className="text-right">
                      {/* Bold Tabular Numerals Balance Indicator */}
                      <div
                        className={`text-xs font-black font-mono ${
                          isZeroBalance
                            ? "text-[#1FAA59]"
                            : isOverLimit
                            ? "text-[#E64545]"
                            : "text-slate-900"
                        }`}
                      >
                        ₹{cust.balance.toLocaleString("en-IN")}
                      </div>

                      {/* State Badges */}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Ledger Details View */}
        {activeCustomer ? (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 card-shadow flex flex-col justify-between">
            <div>
              {/* Customer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F] text-white flex items-center justify-center font-extrabold font-mono text-lg shadow-md">
                    {activeCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 font-display text-base">
                      {activeCustomer.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                      <span>{maskPhoneNumber(activeCustomer.phone)}</span>
                      <span>•</span>
                      <span>{activeCustomer.city || "Delhi"}</span>
                      {activeCustomer.loyaltyPoints > 0 && (
                        <span>• 🎁 {activeCustomer.loyaltyPoints} Pts</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Send WhatsApp Reminder Button */}
                  {activeCustomer.balance > 0 && (
                    <button
                      onClick={() => triggerWhatsAppReminder(activeCustomer)}
                      className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1FAA59] border border-emerald-200 rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <Share2 className="w-4 h-4 text-[#1FAA59]" />
                      <span>WhatsApp Reminder</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Over Limit Alert Warning (Non-alarmist) */}
              {activeCustomer.balance > (activeCustomer.creditLimit || 5000) && (
                <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-xl text-xs flex items-center justify-between font-bold">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Balance exceeds credit limit by ₹{activeCustomer.balance - (activeCustomer.creditLimit || 5000)}</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-800">
                    Limit: ₹{activeCustomer.creditLimit || 5000}
                  </span>
                </div>
              )}

              {/* Record Payment Form Box */}
              <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 font-display uppercase tracking-wider">
                  Record Udhaar Payment Collection
                </h4>

                <form onSubmit={handleRecordPayment} className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Amount collected (₹)"
                      className="w-full bg-white border border-slate-300 font-mono text-slate-900 font-black text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-[#1E3A5F]"
                    />
                  </div>

                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Note e.g. PhonePe / Cash"
                    className="w-full sm:w-44 bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#1E3A5F]"
                  />

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold font-display rounded-xl text-xs whitespace-nowrap shadow-md transition min-h-[44px]"
                  >
                    Record Payment
                  </button>
                </form>
              </div>

              {/* Transaction History Ledger Table */}
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 font-display">
                  Transaction & Udhaar History Log
                </h4>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description / Note</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-mono text-xs">
                      {(!activeCustomer.history || activeCustomer.history.length === 0) ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-slate-400 font-sans font-medium">
                            No ledger transaction history found for this customer
                          </td>
                        </tr>
                      ) : (
                        activeCustomer.history.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 text-[11px] text-slate-500">
                              {h.date}
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              {h.type === "debit" ? (
                                <span className="flex items-center space-x-1 text-[#E64545] font-bold text-[11px]">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  <span>Udhaar Bill</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1 text-[#1FAA59] font-bold text-[11px]">
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                  <span>Payment Received</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-800 font-sans font-medium">
                              {h.note}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-black ${
                                h.type === "debit"
                                  ? "text-[#E64545]"
                                  : "text-[#1FAA59]"
                              }`}
                            >
                              {h.type === "debit" ? `+ ₹${h.amount}` : `- ₹${h.amount}`}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Summary Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-medium">
                Credit Limit: ₹{(activeCustomer.creditLimit || 5000).toLocaleString("en-IN")}
              </span>
              <div className="text-right">
                <span className="text-slate-500 font-medium mr-2">Current Balance:</span>
                <span className="font-black text-[#E64545] text-base">
                  ₹{activeCustomer.balance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 card-shadow font-medium">
            Select a customer from the left list to view Khata ledger
          </div>
        )}
      </div>
    </div>
  );
};
