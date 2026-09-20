import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  UserCheck,
  X,
  Printer,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../../context/useStore";

export const PrivacyPolicyModal = ({ isOpen, onClose, initialTab = "privacy" }) => {
  const { storeConfig, setActiveTab } = useStore();
  const [activePolicyTab, setActivePolicyTab] = useState(initialTab); // 'privacy', 'terms', 'refund', 'dpo'

  useEffect(() => {
    if (isOpen && initialTab) {
      setActivePolicyTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const storeName = storeConfig?.name || "Gupta Kirana Store";
  const storeCity = storeConfig?.city || "New Delhi";
  const storeGst = storeConfig?.gstin || "07AAAAA0000A1Z5";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 id="privacy-modal-title" className="font-bold font-display text-base tracking-tight text-white">
                Legal & Compliance Center
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                DPDP Act 2023 · Terms of Service · Local-First Security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Policy Document"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Policy Section Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50/70 overflow-x-auto no-scrollbar">
          {[
            { id: "privacy", label: "Privacy Policy (DPDP 2023)", icon: ShieldCheck },
            { id: "terms", label: "Terms of Service", icon: FileText },
            { id: "refund", label: "Refund & Return Policy", icon: RotateCcw },
            { id: "dpo", label: "DPO & Grievances (Sec 13)", icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePolicyTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePolicyTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap -mb-[1px] ${
                  isActive
                    ? "border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-xs text-slate-700 space-y-5 leading-relaxed font-sans">
          {/* TAB 1: PRIVACY POLICY (DPDP 2023) */}
          {activePolicyTab === "privacy" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    100% Local-First Privacy Commitment
                  </h4>
                  <p className="text-[11px] text-emerald-900 mt-0.5">
                    DukaanPOS operates strictly client-side on your local device. Your store data, billing invoices, customer phone numbers, and Udhaar ledgers are encrypted with AES-GCM 256-bit cryptography and never uploaded to public cloud databases.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Data Fiduciary & Identity</h4>
                <p>
                  This Privacy Policy applies to the point-of-sale and store management services operated by <strong>{storeName}</strong> located at {storeCity} (GSTIN: <span className="font-mono">{storeGst}</span>) running on DukaanPOS offline-first software.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. What Customer Data is Collected</h4>
                <p>
                  To issue valid GST invoices, maintain customer credit (Udhaar Khata), and reward loyalty points, we process minimal personal identifiers provided voluntarily by retail customers:
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600">
                  <li><strong>Customer Name & Mobile Number:</strong> Used to track purchase invoices, generate digital WhatsApp receipts, and calculate loyalty balance.</li>
                  <li><strong>Billing Records:</strong> Line items purchased, transaction value, payment tender (UPI / Cash / Card / Udhaar), and GST tax breakdown.</li>
                  <li><strong>Credit / Khata Balance:</strong> Outstanding ledger balances, repayments, and settlement dates.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Compliance with India DPDP Act 2023</h4>
                <p>
                  DukaanPOS is built in strict adherence to the <em>Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)</em> enacted by the Parliament of India:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block text-[11px]">Section 6 Consent</span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Customer data is recorded solely for tax invoicing and billing fulfillment.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block text-[11px]">Section 11 Access & Rectify</span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Customers may view or update their phone number and Khata balance at any time.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block text-[11px]">Section 12 Right-to-Erasure</span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Permanent customer data deletion with automatic GST ledger anonymization.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">4. Zero Third-Party Advertising</h4>
                <p>
                  We do not sell, rent, monetize, or transmit customer contact books or transaction records to marketing aggregators, analytics brokers, or financial credit bureaus. All computing occurs locally in the merchant's private browser context.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">5. WhatsApp & Digital Receipts</h4>
                <p>
                  When sending digital receipts via WhatsApp, DukaanPOS triggers a direct client-side WhatsApp intent link (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">https://api.whatsapp.com/send</code>) using your registered business WhatsApp account. Zero message intermediary servers intercept this dispatch.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activePolicyTab === "terms" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm">Retail Software Terms of Service</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Last updated: September 2026 · DukaanPOS Retail Billing Engine
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Software License & Availability</h4>
                <p>
                  DukaanPOS provides a local-first Progressive Web Application (PWA) designed for kirana stores, supermarkets, apparel merchants, and retail businesses. The application is designed to function 100% offline without continuous internet access.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Statutory Tax Filing Responsibility</h4>
                <p>
                  DukaanPOS automatically calculates CGST, SGST, IGST, and generates GSTR-1 / GSTR-3B tax reports based on product HSN codes configured by the store merchant. The store merchant remains solely responsible for filing statutory tax returns with the GST Portal and ensuring proper GST rates are applied to merchandise.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Cashier Access & Counter PIN</h4>
                <p>
                  Store administrators must configure a 4-digit Cashier Counter PIN in the Security Center. Merchants are responsible for locking the register when unattended to prevent unauthorized drawer access or ledger tampering.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">4. Data Backup Protocol</h4>
                <p>
                  Because DukaanPOS is a local-first application, all data is retained on the merchant's machine. Merchants are strongly advised to perform weekly backups using the <em>Data Export (Encrypted JSON)</em> feature in Settings.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REFUND & RETURN POLICY */}
          {activePolicyTab === "refund" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm">Customer Return & Refund Policy</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Standard store policies for retail purchases at {storeName}.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <h5 className="font-bold text-slate-900 text-xs">Packaged FMCG & Branded Goods</h5>
                  <p className="text-slate-600 text-[11px]">
                    Unopened packaged goods with intact manufacturing seals may be returned within <strong>3 days</strong> of purchase upon presentation of the physical or digital invoice.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <h5 className="font-bold text-slate-900 text-xs">Loose Grains, Flours, Pulses & Spices</h5>
                  <p className="text-slate-600 text-[11px]">
                    Due to hygiene and food safety standards, weighed loose commodities (atta, rice, dal, edible oils) cannot be accepted for return once weighed and delivered, unless quality defects are reported within 24 hours.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 space-y-1">
                  <h5 className="font-bold text-slate-900 text-xs">Mode of Refund</h5>
                  <p className="text-slate-600 text-[11px]">
                    Approved refunds will be credited via the original mode of tender (UPI, Cash, or credited back to the customer's Udhaar Khata ledger balance).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DPO & GRIEVANCE REDRESSAL */}
          {activePolicyTab === "dpo" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm">
                  Data Protection Officer (DPO) & Statutory Redressal
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Section 13 statutory grievance officer details under India DPDP Act 2023.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Designated DPO</span>
                  <p className="font-bold text-slate-900 text-sm">Harit Mishra</p>
                  <p className="text-slate-600 text-[11px]">Officer of Data Protection & Regulatory Compliance</p>
                  <p className="text-emerald-700 font-mono font-semibold pt-1">dpo@dukaanpos.in</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Statutory SLA</span>
                  <p className="font-bold text-emerald-700 text-sm">7 Business Days Resolution</p>
                  <p className="text-slate-600 text-[11px]">
                    All erasure requests, PII audit requests, and statutory inquiries receive acknowledgement within 24 hours.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Need to file an official DPDP request?</h5>
                  <p className="text-[11px] text-emerald-900 mt-0.5">
                    You can log an erasure or data access ticket directly inside the Security & DPDP Panel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveTab("security");
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs whitespace-nowrap"
                >
                  <span>Open Security Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Compliant with DPDP Act 2023 · Local AES-256</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-xs"
          >
            I Acknowledge & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
