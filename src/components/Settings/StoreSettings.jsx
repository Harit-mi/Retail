import React, { useState, useRef } from "react";
import { useStore } from "../../context/useStore";
import { Store, Save, RotateCcw, CheckCircle, Download, Upload, ShieldCheck } from "lucide-react";
import { createEncryptedBackup, verifyAndDecryptBackup, downloadBackupFile } from "../../utils/backupRestore";

export const StoreSettings = () => {
  const {
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
          {/* Retail Sector Selector */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3.5 space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              Retail Store Sector / Business Profile:
            </label>
            <select
              value={formData.businessType || "general"}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full bg-white border-2 border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F] cursor-pointer"
            >
              <option value="general">🛍️ General Merchandise & Departmental (किराना व जनरल स्टोर)</option>
              <option value="supermarket">🛒 Supermarket, Grocery & FMCG (सुपरमार्केट / ग्रॉसरी मार्ट)</option>
              <option value="apparel">👔 Apparel, Clothing, Fashion & Footwear (कपड़े, परिधान व जूते)</option>
              <option value="electronics">📱 Electronics, Mobile & Computer Accessories (मोबाइल व इलेक्ट्रॉनिक्स)</option>
              <option value="pharmacy">💊 Pharmacy, Chemist & Healthcare (दवाइयां व मेडिकल स्टोर)</option>
              <option value="hardware">🔧 Hardware, Electrical & Sanitaryware (हार्डवेयर, बिजली व सेनेटरी)</option>
              <option value="stationery">📚 Stationery, Books, Office & Toys (स्टेशनरी, किताबें व खिलौने)</option>
              <option value="cosmetics">💄 Cosmetics, Perfumes & Personal Care (कॉस्मेटिक्स व ब्यूटी)</option>
              <option value="home">🍽️ Home & Kitchenware, Utensils & Appliances (बर्तन व घरेलू सामान)</option>
              <option value="custom">🏪 Other Custom Retail Shop (अन्य रिटेल दुकान)</option>
            </select>
            <p className="text-[11px] text-slate-500 font-mono">
              Adapts unit options, category presets, and receipt formatting for your specific retail store.
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
