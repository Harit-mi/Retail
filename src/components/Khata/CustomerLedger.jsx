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
  const { customers, recordCustomerPayment, storeConfig } = useStore();
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

  // WhatsApp Payment Reminder Simulator
  const triggerWhatsAppReminder = (customer) => {
    const text = `Namaste ${customer.name} Ji! 
Aapka total Udhar balance ₹${customer.balance} hai at ${storeConfig.name}. 
Please pay via UPI at ${storeConfig.upiId || "our store UPI ID"}. 
Dhanyawad! - ${storeConfig.ownerName}`;

    // Copy to clipboard or open WhatsApp web
    navigator.clipboard?.writeText(text);

    setReminderToast(`WhatsApp reminder text copied for ${customer.name}!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Stat Cards for Khata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Total Pending Udhar (Balance)
            </p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Customers with Dues
            </p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              {pendingCustomersCount}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Total Registered Customers
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {customers.length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Reminder Toast */}
      {reminderToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 animate-bounce">
          <MessageSquare className="w-4 h-4" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Main Grid: Left Customer List, Right Ledger Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Customer List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-100 text-sm">Customer Accounts</h4>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
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
              className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 outline-none focus:border-purple-500"
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
                      ? "bg-purple-950/40 border-purple-500/80 shadow-md"
                      : "bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">
                        {cust.name}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {cust.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-black ${
                          cust.balance > 0 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        ₹{cust.balance}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Limit: ₹{cust.creditLimit || 5000}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Ledger Details */}
        {activeCustomer ? (
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl flex flex-col justify-between">
            <div>
              {/* Customer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-extrabold text-lg">
                    {activeCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {activeCustomer.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>{activeCustomer.phone}</span>
                      <span>•</span>
                      <span>{activeCustomer.city || "Delhi"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Send WhatsApp Reminder */}
                  {activeCustomer.balance > 0 && (
                    <button
                      onClick={() => triggerWhatsAppReminder(activeCustomer)}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp Reminder</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Record Payment Form Box */}
              <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Collect Udhar Payment
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
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>

                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Note e.g. Paid via PhonePe"
                    className="w-full sm:w-44 bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-purple-500"
                  />

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-md"
                  >
                    Record Payment
                  </button>
                </form>
              </div>

              {/* Transaction History Ledger Table */}
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-bold text-slate-300">
                  Transaction & Udhar History
                </h4>

                <div className="overflow-hidden rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description / Note</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
                      {(!activeCustomer.history || activeCustomer.history.length === 0) ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-slate-500">
                            No ledger history found for this customer
                          </td>
                        </tr>
                      ) : (
                        activeCustomer.history.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                              {h.date}
                            </td>
                            <td className="py-2.5 px-3">
                              {h.type === "debit" ? (
                                <span className="flex items-center space-x-1 text-rose-400 font-semibold text-[11px]">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  <span>Udhar Bill</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                  <span>Payment Received</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-200">
                              {h.note}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-bold ${
                                h.type === "debit"
                                  ? "text-rose-400"
                                  : "text-emerald-400"
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
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Credit Limit: ₹{activeCustomer.creditLimit || 5000}
              </span>
              <div className="text-right">
                <span className="text-slate-400 mr-2">Current Balance Dues:</span>
                <span className="font-extrabold text-rose-400 text-sm">
                  ₹{activeCustomer.balance}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            Select a customer from the left list to view Khata ledger
          </div>
        )}
      </div>
    </div>
  );
};
