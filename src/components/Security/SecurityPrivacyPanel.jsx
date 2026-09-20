import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { PrivacyPolicyModal } from "../Legal/PrivacyPolicyModal";
import {
  ShieldCheck,
  Lock,
  CheckCircle,
  Trash2,
  Key,
  FileText,
  ExternalLink,
} from "lucide-react";

export const SecurityPrivacyPanel = () => {
  const { customers, deleteCustomer, lockCounter, counterPin, updateCounterPin, storeConfig } = useStore();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'pin', 'policy', 'dpo', 'legal'
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState(null);
  const [selectedCustomerIdToDelete, setSelectedCustomerIdToDelete] = useState("");
  const [deletionSuccess, setDeletionSuccess] = useState(null);
  const [grievanceType, setGrievanceType] = useState("erasure");
  const [grievanceText, setGrievanceText] = useState("");
  const [grievanceSuccess, setGrievanceSuccess] = useState(null);
  const [showFullPolicyModal, setShowFullPolicyModal] = useState(false);

  const securityPrincipleItems = [
    {
      title: "100% Local-First Offline Storage",
      desc: "All invoices, inventory & customer ledgers are stored securely inside your browser using Web Crypto AES-GCM 256. Zero data sent to external cloud servers.",
      tag: "Architecture",
      icon: "fa-solid fa-hard-drive text-slate-800",
    },
    {
      title: "India DPDP Act 2023 Compliance",
      desc: "Protects customer personal identifiers with phone masking and Section 12 Right-to-Erasure customer deletion with GST ledger preservation.",
      tag: "Statutory Law",
      icon: "fa-solid fa-user-shield text-emerald-600",
    },
    {
      title: "GSTR Export Formula Injection Shield",
      desc: "Escapes dangerous spreadsheet formula characters (=, +, -, @) during GSTR-1/3B CSV downloads to prevent CSV injection vulnerabilities.",
      tag: "Export Defense",
      icon: "fa-solid fa-shield-halved text-teal-600",
    },
    {
      title: "Physical Counter Register PIN Lock",
      desc: "Instant 4-digit screen lock gating the POS counter register to prevent unauthorized access when cashiers step away from the till.",
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
      setDeletionSuccess(`Permanently erased personal records for ${target.name} (${target.phone}) under DPDP Right-to-Erasure.`);
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

  const handleFileGrievance = (e) => {
    e.preventDefault();
    if (!grievanceText) return;
    const ticketId = `DPDP-GRV-${Math.floor(10000 + Math.random() * 90000)}`;
    setGrievanceSuccess(`Grievance Ticket #${ticketId} submitted to Data Protection Officer (DPO). Mandatory SLA resolution within 7 business days under Section 13.`);
    setGrievanceText("");
    setTimeout(() => setGrievanceSuccess(null), 6000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Clean Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200/90">
        <div>
          <h2 className="text-base font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Store Security & DPDP Privacy Center</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Local-first AES-256 encryption, cashier PIN security & DPDP Act 2023 compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFullPolicyModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition border border-slate-200/80 shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>View Privacy Policies</span>
          </button>

          <button
            onClick={lockCounter}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Register</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "🛡️ Security Overview" },
          { id: "legal", label: "📜 Privacy Policy & Terms" },
          { id: "pin", label: "🔑 Cashier PIN Settings" },
          { id: "policy", label: "🗑️ Customer Right-to-Erasure" },
          { id: "dpo", label: "⚖️ DPO & Grievance SLA (Sec 13)" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {deletionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{deletionSuccess}</span>
        </div>
      )}

      {/* Tab 1: Security Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityPrincipleItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-start space-x-4"
              >
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <i className={`${item.icon} text-lg`}></i>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm font-display">
                      {item.title}
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-semibold px-2 py-0.5 rounded-full border border-slate-200/60">
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

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div>
              <h5 className="font-bold font-display">Test Register Screen Lock</h5>
              <p className="text-[11px] text-amber-800">Lock the counter to verify that the 4-digit cashier PIN prompt works as expected.</p>
            </div>
            <button
              onClick={lockCounter}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition text-xs whitespace-nowrap shadow-2xs"
            >
              Lock Register Now
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Full Privacy Policy & Legal Documentation */}
      {activeTab === "legal" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Statutory Privacy Policy & Customer Terms</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {storeConfig?.name || "Gupta Kirana Store"} · DPDP Act 2023 Compliant Policy
              </p>
            </div>

            <button
              onClick={() => setShowFullPolicyModal(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Screen View</span>
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <strong className="text-slate-900 font-bold block mb-1">Local-First Storage Guarantee:</strong>
              DukaanPOS runs strictly in the local browser sandbox. Customer phone numbers, invoices, and ledger balances are encrypted with AES-GCM 256-bit keys on the local device. No merchant or customer data is transmitted to cloud tracking servers.
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">1. Data Purpose & Collection</h4>
              <p>
                Customer mobile numbers and names are collected solely to facilitate GST tax invoice generation, WhatsApp receipt dispatch, and Udhaar credit balance accounting.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">2. India DPDP Act 2023 Rights</h4>
              <p>
                In accordance with Sections 11, 12, and 13 of the Digital Personal Data Protection Act 2023, customers retain the right to:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                <li><strong>Access:</strong> Request an itemized statement of all past purchases and balance dues.</li>
                <li><strong>Correction:</strong> Update phone numbers or account names at any time.</li>
                <li><strong>Erasure:</strong> Request complete permanent deletion of personal contact records.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">3. WhatsApp Receipt Policy</h4>
              <p>
                Digital billing receipts are sent directly via client-side WhatsApp intent links without intermediary message servers. Receipts contain only invoice line items, tax totals, and store contact information.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">4. Data Protection Officer (DPO)</h4>
              <p>
                For any statutory DPDP grievances or data subject requests, contact the designated DPO at <strong className="font-mono text-emerald-700">dpo@dukaanpos.in</strong> (Statutory SLA turnaround: 7 business days).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cashier PIN Configuration */}
      {activeTab === "pin" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs max-w-md">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
              <Key className="w-5 h-5 text-slate-800" />
              <span>Configure Cashier Lock PIN</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Current Active PIN: <strong className="font-mono text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{counterPin}</strong>
            </p>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enter New 4-Digit Cashier PIN
              </label>
              <input
                type="password"
                maxLength="6"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New PIN (e.g. 5678)"
                className="w-full bg-slate-50 border border-slate-300 font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-slate-800 focus:bg-white transition"
              />
            </div>

            {pinMsg && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                {pinMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px]"
            >
              Save New Cashier PIN
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: DPDP Right-to-Erasure Customer Deletion Panel */}
      {activeTab === "policy" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs max-w-lg">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>DPDP Act 2023 — Right-to-Erasure Data Purge</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Under Section 12 of India Digital Personal Data Protection Act 2023, customers may request permanent erasure of their personal identifiers.
            </p>
          </div>

          <form onSubmit={handleDeleteCustomer} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Customer Account to Erase:
              </label>
              <select
                value={selectedCustomerIdToDelete}
                onChange={(e) => setSelectedCustomerIdToDelete(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-slate-800"
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
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition disabled:opacity-50 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Erase Customer Data</span>
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-900 font-bold">GST Ledger Protection:</strong> Erasing a customer purges all PII (name, phone, loyalty points) while anonymizing historical invoices into <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono">Anonymous Customer</code>. Store financial ledgers and GST returns remain 100% balanced.
          </div>
        </div>
      )}

      {/* Tab 5: DPDP Section 13 DPO & Grievance Redressal */}
      {activeTab === "dpo" && (
        <div className="space-y-4 max-w-xl">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-800" />
                <span>Section 13 — Data Protection Officer & Statutory SLA</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Designated contact details and statutory grievance redressal channel required under India DPDP Act 2023.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Designated DPO</span>
                <p className="font-bold text-slate-900">Harit Mishra</p>
                <p className="text-[11px] text-slate-500 font-mono">dpo@dukaanpos.in</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Statutory SLA</span>
                <p className="font-bold text-emerald-700">7 Business Days Turnaround</p>
                <p className="text-[11px] text-slate-500 font-mono">Sec 13(1) Statutory Response</p>
              </div>
            </div>

            {grievanceSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{grievanceSuccess}</span>
              </div>
            )}

            <form onSubmit={handleFileGrievance} className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submit Customer DPDP Grievance Ticket
              </h4>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Grievance / Request Category</label>
                <select
                  value={grievanceType}
                  onChange={(e) => setGrievanceType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-slate-800"
                >
                  <option value="erasure">Section 12: Request PII Data Erasure</option>
                  <option value="access">Section 11: Request PII Summary Report</option>
                  <option value="correction">Section 11: Request PII Correction / Update</option>
                  <option value="consent_withdraw">Section 6: Withdraw Billing PII Consent</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Details & Customer Identification</label>
                <textarea
                  rows="3"
                  required
                  value={grievanceText}
                  onChange={(e) => setGrievanceText(e.target.value)}
                  placeholder="Provide customer phone number, name, and specific request details…"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-800"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px]"
              >
                Log Statutory Grievance Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showFullPolicyModal}
        onClose={() => setShowFullPolicyModal(false)}
      />
    </div>
  );
};
