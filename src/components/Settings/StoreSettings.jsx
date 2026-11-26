import React, { useState, useRef } from "react";
import { useStore } from "../../context/useStore";
import { Store, Save, RotateCcw, CheckCircle, Download, Upload, ShieldCheck, Lock, Type, Sun, Moon } from "lucide-react";
import { createEncryptedBackup, verifyAndDecryptBackup, downloadBackupFile } from "../../utils/backupRestore";
import { getBusinessProfile } from "../../config/businessProfiles";

export const StoreSettings = () => {
  const {
    theme,
    setTheme,
    storeConfig,
    setStoreConfig,
    resetDemoData,
    products,
    sales,
    customers,
    suppliers,
    purchaseOrders,
    counterPin,
    restoreStoreBundle,
  } = useStore();
  const [formData, setFormData] = useState({ ...storeConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupMsg, setBackupMsg] = useState(null);

  const fileInputRef = useRef(null);

  const currentProfile = getBusinessProfile(formData.businessType || storeConfig?.businessType || "supermarket");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStoreConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // 1-Click Native Web Crypto API AES-GCM 256-bit Encrypted Backup Export
  const exportStoreBackup = async () => {
    try {
      const bundle = {
        storeConfig,
        products,
        sales,
        customers,
        suppliers,
        purchaseOrders,
      };

      const encryptedBlob = await createEncryptedBackup(bundle, counterPin);
      downloadBackupFile(encryptedBlob, storeConfig.name || "DukaanPOS");

      setBackupMsg("✓ Store vault backup downloaded successfully!");
      setTimeout(() => setBackupMsg(null), 4000);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // 1-Click Restore Data from Encrypted Backup File
  const importStoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const res = await verifyAndDecryptBackup(text, counterPin);
        if (res.success) {
          if (restoreStoreBundle) {
            restoreStoreBundle(res.data);
          }
          alert(`Backup restored successfully! (${res.data.products?.length || 0} products, ${res.data.customers?.length || 0} customers recovered).`);
        } else {
          alert(`Restore failed: ${res.message}`);
        }
      } catch (err) {
        alert(`Failed to parse or restore backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F1F35] text-[#F5A623] rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black font-display text-slate-900">
                Store Profile & Retail Configuration
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Store type, business details, GSTIN tax, bill footer policy & backup vault
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-[#1FAA59] border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Settings Saved!</span>
            </div>
          )}
        </div>

        {/* Store Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registered Business Profile Card (Locked to Subscription) */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {currentProfile.id === "supermarket" ? "🛒" :
                   currentProfile.id === "electronics" ? "📱" :
                   currentProfile.id === "apparel" ? "👔" :
                   currentProfile.id === "pharmacy" ? "💊" :
                   currentProfile.id === "hardware" ? "🔧" :
                   currentProfile.id === "stationery" ? "📚" : "🛍️"}
                </span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 font-display">
                    {currentProfile.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Registered Trade Vertical & Profile Configuration
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Locked to Subscription</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Weighing / Loose Units</span>
                <span className={`font-bold ${currentProfile.showKgs ? "text-emerald-700" : "text-slate-700"}`}>
                  {currentProfile.showKgs ? "⚖️ Scales & Kgs Active" : "🚫 Discrete Only (Zero Kgs)"}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Specialized Attributes</span>
                <span className="font-bold text-slate-800 truncate block" title={currentProfile.primaryAttributes?.map((a) => a.label).join(", ")}>
                  {currentProfile.primaryAttributes?.map((a) => a.label).slice(0, 3).join(", ") || "Standard SKU"}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Allowed UOM Units</span>
                <span className="font-bold text-slate-800 truncate block" title={currentProfile.allowedUnits?.join(", ")}>
                  {currentProfile.allowedUnits?.join(", ") || "Pcs"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 pt-1">
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Business sector was provisioned during customer self-signup. To switch your store vertical or upgrade, contact DukaanPOS enterprise billing support.</span>
            </p>
          </div>

          {/* POS Typography & Font Style Customizer */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#1E3A5F]" />
                <label className="text-xs font-bold text-slate-900 block">
                  POS Display Font Style & Typography:
                </label>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Live Interactive Preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                {
                  id: "jakarta",
                  name: "Modern Geometric",
                  display: "Outfit & Plus Jakarta",
                  preview: "Abc ₹1,499",
                  desc: "Modern SaaS & Retail standard (Recommended)",
                },
                {
                  id: "poppins",
                  name: "Urban Friendly",
                  display: "Poppins Geometric",
                  preview: "Abc ₹1,499",
                  desc: "Warm, rounded, vibrant retail",
                },
                {
                  id: "space-grotesk",
                  name: "Neo-Grotesk Tech",
                  display: "Space Grotesk & Jakarta",
                  preview: "Abc ₹1,499",
                  desc: "Bold high-tech store display",
                },
                {
                  id: "inter",
                  name: "Classic Swiss",
                  display: "Inter Clean Sans",
                  preview: "Abc ₹1,499",
                  desc: "Minimalist compact system font",
                },
              ].map((font) => {
                const isSelected = (formData.fontStyle || "jakarta") === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, fontStyle: font.id }));
                      if (typeof document !== "undefined") {
                        document.documentElement.setAttribute("data-font-style", font.id);
                      }
                    }}
                    className={`text-left p-3 rounded-lg border-2 transition relative flex flex-col justify-between ${
                      isSelected
                        ? "border-[#1E3A5F] bg-blue-50/50 shadow-xs ring-1 ring-[#1E3A5F]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{font.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#1E3A5F]"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{font.display}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black tracking-tight text-slate-800">{font.preview}</span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {font.id === "jakarta" ? "★ Default" : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Instantly adapts headline styles, till terminal readability, price tags, and receipt layout typography across the entire POS.
            </p>
          </div>

          {/* Minimal 2-Color Theme Mode Selector (Light & Dark) */}
          <div className="bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-zinc-50 block">
                Minimalist 2-Color Theme Mode (Black & White):
              </label>
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                Active: <strong className="uppercase">{theme || "dark"}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (setTheme) setTheme("dark");
                  if (typeof document !== "undefined") {
                    document.documentElement.classList.add("dark");
                    document.documentElement.setAttribute("data-theme", "dark");
                    localStorage.setItem("dukaan_theme", "dark");
                  }
                }}
                className={`p-3.5 rounded-xl border-2 transition text-left flex items-start gap-3 cursor-pointer ${
                  theme === "dark"
                    ? "border-zinc-950 dark:border-white bg-zinc-950 text-white shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-white">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">Minimalist Dark Mode</span>
                    {theme === "dark" && (
                      <span className="text-[9px] bg-white text-black font-mono font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Deep black background (#09090B), crisp white text & buttons, subtle gray borders.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (setTheme) setTheme("light");
                  if (typeof document !== "undefined") {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.setAttribute("data-theme", "light");
                    localStorage.setItem("dukaan_theme", "light");
                  }
                }}
                className={`p-3.5 rounded-xl border-2 transition text-left flex items-start gap-3 cursor-pointer ${
                  theme === "light"
                    ? "border-zinc-950 dark:border-white bg-zinc-100 text-zinc-950 shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-300 flex items-center justify-center shrink-0 text-zinc-950">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">Minimalist Light Mode</span>
                    {theme === "light" && (
                      <span className="text-[9px] bg-black text-white font-mono font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Pure white canvas (#FFFFFF), solid black typography & buttons, clean hairline dividers.
                  </p>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              Strictly enforces a 2-color high-contrast aesthetic across all billing counters, reports, and settings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Store Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Gupta Retail Store"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Store Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline || ""}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Complete Retail Solution • Quality Guaranteed"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Store GSTIN Tax Number
              </label>
              <input
                type="text"
                value={formData.gstin || ""}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="07AAAAA0000A1Z5"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                GST Tax Regime
              </label>
              <select
                value={formData.taxRegime || "regular"}
                onChange={(e) => setFormData({ ...formData, taxRegime: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F] cursor-pointer"
              >
                <option value="regular">Regular GST Registered (Itemized Tax Invoices)</option>
                <option value="composition">Composition Scheme / Small Retailer (Bill of Supply)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                UPI Payment VPA ID (For Dynamic QR on Bills)
              </label>
              <input
                type="text"
                value={formData.upiId || ""}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="storename@upi"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Store Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Bill / Invoice Number Prefix
              </label>
              <input
                type="text"
                value={formData.invoicePrefix || "INV-"}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="INV- or BILL-"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Owner / Manager Name
              </label>
              <input
                type="text"
                value={formData.ownerName || ""}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Rajesh Gupta"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Store Address & City Header
            </label>
            <textarea
              rows="2"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Shop No. 4, Main Market, Lajpat Nagar, New Delhi - 110024"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-3 text-xs text-slate-900 outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Receipt Terms & Return Policy Note
            </label>
            <input
              type="text"
              value={formData.receiptFooterNote || ""}
              onChange={(e) => setFormData({ ...formData, receiptFooterNote: e.target.value })}
              placeholder="e.g. Exchange possible within 7 days with original invoice. Thank you for your visit!"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#1E3A5F]"
            />
          </div>

          {/* Data Backup Section */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 space-y-3 pt-3">
            <h4 className="text-xs font-extrabold text-slate-900 font-display flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1FAA59]" />
              <span>Offline Data Backup & Encrypted Restore</span>
            </h4>

            {backupMsg && (
              <p className="text-xs font-bold text-[#1FAA59] bg-emerald-50 p-2.5 rounded border border-emerald-200 font-mono">
                {backupMsg}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={exportStoreBackup}
                className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[44px]"
              >
                <Download className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Export Encrypted Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[44px]"
              >
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>Restore / Import Backup</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importStoreBackup}
                className="hidden"
              />
            </div>
          </div>

          {/* Reset Demo Data & Submit Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset all store products and customer ledgers back to demo initial state?")) {
                  resetDemoData();
                  window.location.reload();
                }
              }}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#E64545] font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Data</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black font-display rounded-lg text-xs shadow transition flex items-center gap-2 min-h-[44px]"
            >
              <Save className="w-4 h-4 stroke-[3]" />
              <span>SAVE CONFIGURATION</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
