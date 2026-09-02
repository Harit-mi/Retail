import React, { useState } from "react";
import { useStore } from "../context/useStore";
import { INDIAN_LANGUAGES } from "../i18n/translations";
import { ShiftReconciliationModal } from "./CashDrawer/ShiftReconciliationModal";

export const Navbar = ({ onOpenMobileMenu }) => {
  const {
    storeConfig,
    activeTab,
    setActiveTab,
    currentLanguage,
    changeLanguage,
    products,
    customers,
    lockCounter,
    t,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showShiftAuditModal, setShowShiftAuditModal] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const overdueUdharCount = customers.filter((c) => c.balance > 0).length;
  const totalAlerts = lowStockCount + overdueUdharCount;

  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 h-16 flex items-center px-3 sm:px-6">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Mobile Hamburger & Store Branding */}
        <div className="flex items-center space-x-2">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
          >
            <i className="fa-solid fa-bars text-lg text-[#1E3A5F]"></i>
          </button>

          {/* Kirana Store Title Badge */}
          <div className="flex items-center space-x-2 bg-amber-50 p-1.5 px-3 rounded-lg border border-amber-200">
            <i className="fa-solid fa-shop text-[#F5A623] text-sm"></i>
            <span className="text-slate-900 text-xs font-black font-display">
              {storeConfig.name || "Gupta Kirana Store"}
            </span>
          </div>

          {/* Desktop Quick Navigation Header Pills */}
          <div className="hidden xl:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: "pos", label: "Billing POS", icon: "fa-cash-register" },
              { id: "inventory", label: "Inventory", icon: "fa-boxes-stacked" },
              { id: "barcodes", label: "Barcodes", icon: "fa-barcode" },
              { id: "khata", label: "Udhaar & Loyalty", icon: "fa-book-bookmark" },
              { id: "whatsapp", label: "WhatsApp", icon: "fa-whatsapp" },
              { id: "reports", label: t("reports"), icon: "fa-file-invoice-dollar" },
              { id: "security", label: "Security", icon: "fa-shield-halved" },
              { id: "settings", label: t("settings"), icon: "fa-sliders" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-[#1E3A5F] text-white shadow-xs"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${isActive ? "text-[#F5A623]" : "text-slate-500"}`}></i>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xs hidden md:block relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search items, barcode, HSN... (F2)"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-9 pr-3 py-1.5 rounded-lg outline-none focus:border-[#1E3A5F] focus:bg-white transition"
          />
        </div>

        {/* Right: Lock Counter, Notifications, Shift Audit, Reset & Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* POS Register PIN Lock Trigger Button */}
          <button
            onClick={lockCounter}
            title="Lock POS Counter Register (PIN Required)"
            className="px-2.5 sm:px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-amber-300 shadow-xs"
          >
            <i className="fa-solid fa-lock text-amber-600"></i>
            <span className="hidden sm:inline-block font-display">Lock Counter</span>
          </button>

          {/* Shift Drawer Audit Trigger Button */}
          <button
            onClick={() => setShowShiftAuditModal(true)}
            title="Day-End Cash Drawer Audit"
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-slate-200"
          >
            <i className="fa-solid fa-vault text-[#F5A623]"></i>
            <span className="hidden sm:inline-block">Cash Audit</span>
          </button>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
            >
              <i className="fa-solid fa-bell text-base"></i>
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E64545] text-white font-bold text-[10px] rounded-full flex items-center justify-center font-mono">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Popup Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-fade-in text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 font-display">
                    Store Notifications
                  </h4>
                  <span className="text-[10px] bg-red-50 text-[#E64545] px-1.5 py-0.5 rounded font-bold font-mono">
                    {totalAlerts} Alerts
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-2 text-amber-900">
                      <i className="fa-solid fa-triangle-exclamation text-amber-600 text-xs mt-0.5"></i>
                      <div>
                        <p className="font-bold text-[11px]">Low Stock Alert</p>
                        <p className="text-[10px] text-amber-700">
                          {lowStockCount} Kirana items below minimum warning threshold.
                        </p>
                      </div>
                    </div>
                  )}

                  {overdueUdharCount > 0 && (
                    <div className="p-2 bg-red-50 rounded-lg border border-red-200 flex items-start space-x-2 text-red-900">
                      <i className="fa-solid fa-book-bookmark text-[#E64545] text-xs mt-0.5"></i>
                      <div>
                        <p className="font-bold text-[11px]">Overdue Udhaar</p>
                        <p className="text-[10px] text-red-700">
                          {overdueUdharCount} customers have pending ledger balance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher Dropdown */}
          <select
            value={currentLanguage}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-slate-200 transition"
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cash Drawer Audit Modal */}
      <ShiftReconciliationModal
        isOpen={showShiftAuditModal}
        onClose={() => setShowShiftAuditModal(false)}
      />
    </header>
  );
};
