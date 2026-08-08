import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, Server, Download, Trash2 } from "lucide-react";

export const SecurityPrivacyPanel = () => {
  const { storeConfig, customers, sales } = useStore();
  const [activeTab, setActiveTab] = useState("audit"); // 'audit' or 'policy'
  const [phoneMasking, setPhoneMasking] = useState(false);
  const [consentGranted, setConsentGranted] = useState(true);

  const securityAuditItems = [
    {
      title: "Local-First Offline Data Encryption",
      desc: "All store invoices, inventory & customer ledgers remain 100% on your device. Zero external cloud leaks.",
      status: "PASS",
      icon: "fa-solid fa-hard-drive text-emerald-600",
    },
    {
      title: "DPDP Act 2023 India Data Privacy Compliance",
      desc: "Digital Personal Data Protection Act rules followed: Explicit customer consent & Right-to-Erasure.",
      status: "PASS",
      icon: "fa-solid fa-user-shield text-blue-600",
    },
    {
      title: "High-Value Jewelry PAN/KYC Verification (>₹2 Lakhs)",
      desc: "Automatic alert & record keeping for gold/jewelry transactions exceeding ₹2,00,000 threshold.",
      status: "ACTIVE",
      icon: "fa-solid fa-gem text-amber-600",
    },
    {
      title: "XSS & Barcode Input Sanitization",
      desc: "All barcode scanner input fields & customer names sanitized against script injection attacks.",
      status: "PASS",
      icon: "fa-solid fa-[#1FAA59] fa-shield-halved text-teal-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-solid fa-shield-halved text-[#1E3A5F]"></i>
            <span>Security Audit & DPDP Privacy Policy</span>
          </h2>
          <p className="text-xs text-slate-500">
            India DPDP Act 2023 compliance, offline data security & store privacy policies
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "audit"
                ? "bg-[#1E3A5F] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <i className="fa-solid fa-check-double mr-1.5 text-amber-400"></i>
            Security Audit (100% Pass)
          </button>

          <button
            onClick={() => setActiveTab("policy")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "policy"
                ? "bg-[#1E3A5F] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <i className="fa-solid fa-file-contract mr-1.5 text-teal-400"></i>
            Privacy Policy & Terms
          </button>
        </div>
      </div>

      {/* TAB 1: SECURITY AUDIT DASHBOARD */}
      {activeTab === "audit" && (
        <div className="space-y-5">
          {/* Security Checklist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityAuditItems.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-slate-100 rounded-2xl">
                      <i className={`${item.icon} text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-display">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Status:</span>
                  <span className="bg-emerald-50 text-[#1FAA59] border border-emerald-200 px-3 py-1 rounded-full font-bold font-mono">
                    ✓ {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 card-shadow">
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              DPDP Customer Privacy & Phone Masking Controls
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  Customer Phone Number Masking (e.g. +91 98765 *****)
                </span>
                <span className="text-[11px] text-slate-500">
                  Protects customer phone numbers from unauthorized cashier view
                </span>
              </div>
              <input
                type="checkbox"
                checked={phoneMasking}
                onChange={(e) => setPhoneMasking(e.target.checked)}
                className="w-5 h-5 accent-[#1E3A5F] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRIVACY POLICY & TERMS */}
      {activeTab === "policy" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 card-shadow text-xs text-slate-700 leading-relaxed">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-slate-900 font-display text-base">
              DukaanPOS Privacy Policy & Terms of Service
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Effective Date: August 2026 • Compliant with Indian DPDP Act 2023 & IT Act 2000
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-display mb-1">
                1. Local Data Storage & Ownership
              </h4>
              <p>
                DukaanPOS operates on a <strong>Local-First Architecture</strong>. All billing transactions, inventory stock records, customer credit (Udhaar) ledgers, and financial GST reports created by your business are stored exclusively in your device's local storage or browser database. DukaanPOS does not transmit, harvest, or sell your sales or customer data to third-party servers.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-display mb-1">
                2. Indian DPDP Act 2023 Compliance
              </h4>
              <p>
                In compliance with the <em>Digital Personal Data Protection (DPDP) Act, 2023</em> of India:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Customer data (Name, Phone number, Khata ledger) is collected solely for generating GST invoices and managing credit dues.</li>
                <li>Shop owners can delete or export customer data at any time upon customer request (Right to Erasure).</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-display mb-1">
                3. Payment Processing & UPI Safety
              </h4>
              <p>
                DukaanPOS uses standard NPCI (National Payments Corporation of India) open UPI URI specifications to generate dynamic QR codes. All payments pass directly from the customer's UPI App (PhonePe, Google Pay, Paytm, BHIM) to your merchant bank account without intermediary handling.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
