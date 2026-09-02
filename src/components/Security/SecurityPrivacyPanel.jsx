import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { ShieldCheck, Lock, CheckCircle, Trash2, Key } from "lucide-react";

export const SecurityPrivacyPanel = () => {
  const { customers, deleteCustomer, lockCounter, counterPin, updateCounterPin } = useStore();
  const [activeTab, setActiveTab] = useState("audit"); // 'audit', 'policy', or 'pin'
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState(null);
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
      icon: "fa-solid fa-shield-halved text-teal-600",
    },
    {
      title: "Physical Counter Register PIN Lock",
      desc: "Instant 4-digit screen lock gating the entire POS application to prevent unauthorized physical access.",
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

  const handleUpdatePin = (e) => {
    e.preventDefault();
    const res = updateCounterPin(newPin);
    setPinMsg(res.message);
    if (res.success) setNewPin("");
    setTimeout(() => setPinMsg(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#0F1F35] text-white rounded-xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-black font-display tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
            <span>Privacy & Security Principles (DPDP Act Guidelines)</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            India DPDP Act 2023 compliance, offline data security & store privacy policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={lockCounter}
            className="px-4 py-2.5 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Counter Register</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "audit" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Security Principles
        </button>
        <button
          onClick={() => setActiveTab("pin")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "pin" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Cashier PIN
        </button>
        <button
          onClick={() => setActiveTab("policy")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "policy" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Right-to-Erasure
        </button>
      </div>

      {deletionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#1FAA59] px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{deletionSuccess}</span>
        </div>
      )}

      {/* Security Principles Tab */}
      {activeTab === "audit" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityPrincipleItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs flex items-start space-x-4"
            >
              <div className="p-3 bg-slate-100 rounded-lg">
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
      )}

      {/* Cashier PIN Configuration Tab */}
      {activeTab === "pin" && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-xs max-w-md">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
              <Key className="w-5 h-5 text-[#1E3A5F]" />
              <span>Configure Cashier Counter Lock PIN</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Current PIN: <strong className="font-mono text-slate-900">{counterPin}</strong>
            </p>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter New 4-Digit Cashier PIN
              </label>
              <input
                type="password"
                maxLength="6"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New PIN (e.g. 5678)"
                className="w-full bg-slate-50 border-2 border-slate-300 font-mono font-bold text-sm px-3 py-2.5 rounded-lg outline-none focus:border-[#1E3A5F]"
              />
            </div>

            {pinMsg && (
              <p className="text-xs font-bold text-[#1FAA59] bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {pinMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold text-xs rounded-lg shadow transition min-h-[44px]"
            >
              Save New Cashier PIN
            </button>
          </form>
        </div>
      )}

      {/* DPDP Right-to-Erasure Customer Deletion Panel */}
      {activeTab === "policy" && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
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
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
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
              className="px-5 py-2.5 bg-[#E64545] hover:bg-red-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-2 shadow transition disabled:opacity-50 min-h-[44px]"
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
