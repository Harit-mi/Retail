import React, { useState, useRef } from "react";
import { useStore } from "../../context/useStore";
import { Store, Save, RotateCcw, CheckCircle, Download, Upload, ShieldCheck } from "lucide-react";
import { encryptPayloadAsync, decryptPayloadAsync } from "../../utils/storageCrypto";

export const StoreSettings = () => {
  const { storeConfig, setStoreConfig, resetDemoData, products, sales, customers, suppliers, counterPin } = useStore();
  const [formData, setFormData] = useState({ ...storeConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupMsg, setBackupMsg] = useState(null);

  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStoreConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // 1-Click Native Web Crypto API AES-GCM 256-bit Encrypted Backup Export
  const exportStoreBackup = async () => {
    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      storeConfig,
      products,
      sales,
      customers,
      suppliers,
    };

    const encryptedContent = await encryptPayloadAsync(backupData, counterPin);
    const blob = new Blob([encryptedContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dukaanpos_backup_${storeConfig.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setBackupMsg("✓ Native Web Crypto AES-GCM encrypted store backup downloaded successfully!");
    setTimeout(() => setBackupMsg(null), 4000);
  };

  // 1-Click Restore Data from Encrypted Backup File
  const importStoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = await decryptPayloadAsync(event.target.result, counterPin, null);
        if (parsed && parsed.products && parsed.customers) {
          const encProducts = await encryptPayloadAsync(parsed.products, counterPin);
          const encSales = await encryptPayloadAsync(parsed.sales || [], counterPin);
          const encCustomers = await encryptPayloadAsync(parsed.customers, counterPin);

          localStorage.setItem("dukaan_products", encProducts);
          localStorage.setItem("dukaan_sales", encSales);
          localStorage.setItem("dukaan_customers", encCustomers);

          if (parsed.suppliers) {
            const encSuppliers = await encryptPayloadAsync(parsed.suppliers, counterPin);
            localStorage.setItem("dukaan_suppliers", encSuppliers);
          }
          if (parsed.storeConfig) {
            const encConfig = await encryptPayloadAsync(parsed.storeConfig, counterPin);
            localStorage.setItem("dukaan_store_config", encConfig);
          }
          window.location.reload();
        } else {
          alert("Invalid backup file structure or incorrect cashier PIN.");
        }
      } catch {
        alert("Failed to parse or decrypt Web Crypto backup file.");
      }
    };
    reader.readAsText(file);
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
                Kirana Store Configuration
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Store name, GSTIN number, receipt printer & UPI settings
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Store Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                placeholder="27AAAAA0000A1Z5"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                UPI Payment VPA ID (For Dynamic QR)
              </label>
              <input
                type="text"
                value={formData.upiId || ""}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="guptakirana@upi"
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
