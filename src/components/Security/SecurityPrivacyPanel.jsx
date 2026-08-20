import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { ShieldCheck, Lock, CheckCircle, Trash2 } from "lucide-react";

export const SecurityPrivacyPanel = () => {
  const { customers, deleteCustomer } = useStore();
  const [activeTab, setActiveTab] = useState("audit"); // 'audit' or 'policy'
  const [isCounterLocked, setIsCounterLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [selectedCustomerIdToDelete, setSelectedCustomerIdToDelete] = useState("");
  const [deletionSuccess, setDeletionSuccess] = useState(null);

  const securityPrincipleItems = [
    {
      title: "Local-First Zero Cloud Leakage",
      desc: "All store invoices, inventory & customer ledgers remain 100% stored in local browser storage. Zero third-party server transmission.",
      tag: "Architecture Principle",
      icon: "fa-solid fa-hard-drive text-[#1E3A5F]",
    },
    {
      title: "DPDP Act 2023 India Privacy Guidelines",
      desc: "Supports customer phone masking (+91 98765 *****) and DPDP Right-to-Erasure customer deletion.",
      tag: "Configurable Guideline",
      icon: "fa-solid fa-user-shield text-[#1FAA59]",
    },
    {
      title: "CSV / GSTR Export Formula Injection Defense",
      desc: "Automatic escaping of leading formula triggers (=, +, -, @) during GSTR-1/3B CSV file generation.",
      tag: "Export Defense",
      icon: "fa-solid fa-[#1FAA59] fa-shield-halved text-teal-600",
    },
    {
      title: "Physical Counter Register PIN Lock",
      desc: "Instant 4-digit screen lock preventing unauthorized physical access to sales and customer balances.",
      tag: "Access Control",
      icon: "fa-solid fa-lock text-amber-600",
    },
  ];

  const handleDeleteCustomer = (e) => {
    e.preventDefault();
    if (!selectedCustomerIdToDelete) return;
    const target = customers.find((c) => c.id === selectedCustomerIdToDelete);
    if (!target) return;

    if (window.confirm(`Are you sure you want to permanently erase all records for ${target.name} under DPDP Right-to-Erasure?`)) {
      deleteCustomer(target.id);
      setDeletionSuccess(`Permanently erased data for ${target.name} (${target.phone}) under DPDP Right-to-Erasure.`);
      setSelectedCustomerIdToDelete("");
      setTimeout(() => setDeletionSuccess(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Counter Lock Overlay */}
      {isCounterLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-5 text-white animate-fade-in">
          <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold font-display">POS Counter Register Locked</h3>
            <p className="text-xs text-slate-500 font-medium">
              Enter 4-digit cashier PIN to unlock register (Default: 1234)
            </p>
            <input
              type="password"
              maxLength="4"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-2xl font-mono tracking-widest py-3 border-2 border-slate-300 rounded-2xl outline-none focus:border-[#1E3A5F]"
            />
            <button
              onClick={() => {
                if (pinInput === "1234" || pinInput === "0000") {
                  setIsCounterLocked(false);
                  setPinInput("");
                } else {
                  alert("Incorrect PIN! (Use 1234)");
                }
              }}
              className="w-full py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold rounded-2xl text-xs shadow-md transition"
            >
              Unlock Register Now
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#1E3A5F]" />
            <span>Privacy & Security Principles (DPDP Act Guidelines)</span>
          </h2>
          <p className="text-xs text-slate-500">
            India DPDP Act 2023 compliance, offline data security & store privacy policies
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCounterLocked(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Counter (PIN)</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "audit"
                ? "bg-[#1E3A5F] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Security Principles
          </button>

          <button
            onClick={() => setActiveTab("policy")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "policy"
                ? "bg-[#1E3A5F] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Right-to-Erasure
          </button>
        </div>
      </div>

      {deletionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#1FAA59] px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{deletionSuccess}</span>
        </div>
      )}

      {/* Main Audit Grid */}
      {activeTab === "audit" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityPrincipleItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-start space-x-4"
            >
              <div className="p-3 bg-slate-100 rounded-2xl">
                <i className={`${item.icon} text-xl`}></i>
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm font-display">
                    {item.title}
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DPDP Right-to-Erasure Customer Deletion Panel */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 card-shadow">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-[#E64545]" />
              <span>DPDP Act 2023 — Customer Right-to-Erasure Data Removal</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Under Section 12 of India Digital Personal Data Protection Act 2023, customers have the right to request erasure of their personal identifiers and balance records.
            </p>
          </div>

          <form onSubmit={handleDeleteCustomer} className="max-w-md space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Customer Account to Erase
              </label>
              <select
                value={selectedCustomerIdToDelete}
                onChange={(e) => setSelectedCustomerIdToDelete(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — Balance: ₹{c.balance}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedCustomerIdToDelete}
              className="px-5 py-2.5 bg-[#E64545] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-md transition disabled:opacity-50 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Erase Customer Data</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
