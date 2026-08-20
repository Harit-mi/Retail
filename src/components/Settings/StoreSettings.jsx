import React, { useState, useRef } from "react";
import { useStore } from "../../context/StoreContext";
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-[#1FAA59] border border-emerald-100 rounded-2xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 font-display text-lg">
                Store Settings & Profile
              </h3>
              <p className="text-xs text-slate-500">
                Configure your business details, GSTIN, and UPI payment settings
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-[#1FAA59] border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Settings Saved Successfully!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Store / Shop Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#1E3A5F] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          {/* GSTIN & UPI ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="e.g. 07AAAAA0000A1Z5"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#1FAA59] outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                UPI Merchant VPA ID (For Instant Payment QR) *
              </label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="guptakirana@upi or 9876543210@ybl"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0EA5A5] font-bold outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          {/* Owner Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Owner / Cashier Name
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Phone / Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">
              Store Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F]"
            />
          </div>

          {/* OFFLINE DATA BACKUP & RESTORE SECTION */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 font-display flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1FAA59]" />
              <span>Offline Data Backup & Device Restore</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Export all your inventory stock, invoices, customer ledgers, and suppliers to a single offline JSON backup file, or restore data onto a new device.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={exportStoreBackup}
                className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Export Data Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>Restore / Import Data Backup</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importStoreBackup}
                className="hidden"
              />
            </div>

            {backupMsg && (
              <p className="text-[11px] font-bold text-[#1FAA59] bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                {backupMsg}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset store to default sample data?")) {
                  resetDemoData();
                }
              }}
              className="flex items-center space-x-1.5 text-xs text-[#E64545] hover:text-red-700 font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Data</span>
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold font-display px-6 py-2.5 rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4 text-[#F5A623]" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
