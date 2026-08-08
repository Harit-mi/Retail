import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  BookOpen,
  UserPlus,
  Search,
  IndianRupee,
  Phone,
  MessageSquare,
  PlusCircle,
  CheckCircle,
  Share2,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

export const CustomerLedger = () => {
  const { customers, recordCustomerPayment, storeConfig, t } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("UPI / Cash Payment");
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

    recordCustomerPayment(activeCustomer.id, paymentAmount, paymentNote);
    setPaymentAmount("");
    setPaymentNote("UPI / Cash Payment");
  };

  // WhatsApp Payment Reminder Generator
  const triggerWhatsAppReminder = (customer) => {
    const text = `Namaste ${customer.name} Ji! 
Aapka total Udhar balance ₹${customer.balance} hai at ${storeConfig.name}. 
Please pay via UPI at ${storeConfig.upiId || "our store UPI ID"}. 
Dhanyawad! - ${storeConfig.ownerName}`;

    navigator.clipboard?.writeText(text);

    setReminderToast(`WhatsApp reminder text copied for ${customer.name}!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Stat Cards for Khata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              {t("udharDuesBalance")}
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
              Total Registered Customers
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

      {/* Reminder Toast */}
      {reminderToast && (
        <div className="bg-[#1FAA59] text-white px-4 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center space-x-2 animate-bounce">
          <MessageSquare className="w-4 h-4" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Main Grid: Left Customer List, Right Ledger Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Customer List Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 card-shadow">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm font-display">
              Customer Accounts
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
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-[#1E3A5F]"
            />
          </div>

          {/* Customer Cards */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = activeCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-50/70 border-[#F5A623] ring-2 ring-[#F5A623]/20 shadow-md"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 font-display">
                        {cust.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {cust.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-black font-mono ${
                          cust.balance > 0 ? "text-[#E64545]" : "text-[#1FAA59]"
                        }`}
                      >
                        ₹{cust.balance}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Limit: ₹{cust.creditLimit || 5000}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Ledger Details Card */}
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
                      <span>{activeCustomer.phone}</span>
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
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#1FAA59] border border-emerald-200 rounded-xl text-xs font-bold transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t("whatsAppReminder")}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Record Payment Form Box */}
              <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 font-display uppercase tracking-wider">
                  {t("collectUdhar")}
                </h4>

                <form onSubmit={handleRecordPayment} className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount collected (₹)"
                      className="w-full bg-white border border-slate-300 font-mono text-slate-900 font-bold text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-[#1E3A5F]"
                    />
                  </div>

                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Note e.g. Paid via PhonePe"
                    className="w-full sm:w-44 bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#1E3A5F]"
                  />

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold font-display rounded-xl text-xs whitespace-nowrap shadow-md transition"
                  >
                    Record Payment
                  </button>
                </form>
              </div>

              {/* Transaction History Ledger Table */}
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 font-display">
                  Transaction & Udhaar History
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
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(!activeCustomer.history || activeCustomer.history.length === 0) ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-slate-400 font-medium">
                            No ledger history found for this customer
                          </td>
                        </tr>
                      ) : (
                        activeCustomer.history.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              {h.date}
                            </td>
                            <td className="py-2.5 px-3">
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
                            <td className="py-2.5 px-3 text-slate-800 font-medium">
                              {h.note}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-black font-mono ${
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
                Credit Limit: ₹{activeCustomer.creditLimit || 5000}
              </span>
              <div className="text-right">
                <span className="text-slate-500 font-medium mr-2">Current Udhaar Balance:</span>
                <span className="font-black text-[#E64545] text-sm">
                  ₹{activeCustomer.balance}
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
