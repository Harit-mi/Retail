import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Store, Save, RotateCcw, CheckCircle, Tag, Phone, MapPin, QrCode } from "lucide-react";

export const StoreSettings = () => {
  const { storeConfig, setStoreConfig, resetDemoData, t } = useStore();
  const [formData, setFormData] = useState({ ...storeConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStoreConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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

          {/* Store Mode */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs text-slate-900 font-bold block font-display">
              Default Retail Industry Mode:
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="storeMode"
                  value="kirana"
                  checked={formData.mode === "kirana"}
                  onChange={() => setFormData({ ...formData, mode: "kirana" })}
                  className="accent-[#1E3A5F]"
                />
                <span>Kirana / Grocery / Supermarket</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="storeMode"
                  value="clothing"
                  checked={formData.mode === "clothing"}
                  onChange={() => setFormData({ ...formData, mode: "clothing" })}
                  className="accent-[#1E3A5F]"
                />
                <span>Clothing / Apparel / Fashion Boutique</span>
              </label>
            </div>
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
