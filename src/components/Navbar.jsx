import React, { useState } from "react";
import { useStore } from "../context/useStore";
import { INDIAN_LANGUAGES } from "../i18n/translations";
import { ShiftReconciliationModal } from "./CashDrawer/ShiftReconciliationModal";

export const Navbar = ({ onOpenMobileMenu }) => {
  const {
    storeConfig,
    currentLanguage,
    changeLanguage,
    products,
    customers,
    lockCounter,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showShiftAuditModal, setShowShiftAuditModal] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const overdueUdharCount = customers.filter((c) => c.balance > 0).length;
  const totalAlerts = lowStockCount + overdueUdharCount;

  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6">
      <div className="w-full mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Store Branding */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
          >
            <i className="fa-solid fa-bars text-lg text-[#1E3A5F]" aria-hidden="true"></i>
          </button>

          {/* Kirana Store Title Badge */}
          <div className="flex items-center space-x-2 bg-amber-50 p-2 px-3 rounded-lg border border-amber-200 shadow-2xs">
            <i className="fa-solid fa-shop text-[#F5A623] text-sm" aria-hidden="true"></i>
            <span className="text-slate-900 text-xs font-black font-display tracking-tight whitespace-nowrap">
              {storeConfig.name || "Gupta Kirana Store"}
            </span>
          </div>
        </div>

        {/* Center: Global Item/Barcode Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search items, barcode, HSN… (F2)"
            aria-label="Search items, barcode or HSN"
            spellCheck={false}
            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 text-xs font-semibold pl-10 pr-4 py-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus:bg-white transition"
          />
        </div>

        {/* Right: Cashier Lock, Cash Audit, Notifications & Language Switcher */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* POS Register PIN Lock Trigger Button */}
          <button
            onClick={lockCounter}
            title="Lock POS Counter Register (PIN Required)"
            aria-label="Lock POS Counter Register"
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border border-amber-300 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1E3A5F] whitespace-nowrap"
          >
            <i className="fa-solid fa-lock text-amber-600" aria-hidden="true"></i>
            <span className="font-display">Lock Counter</span>
          </button>

          {/* Shift Drawer Audit Trigger Button */}
          <button
            onClick={() => setShowShiftAuditModal(true)}
            title="Day-End Cash Drawer Audit"
            aria-label="Open Cash Drawer Audit Modal"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200 focus-visible:ring-2 focus-visible:ring-[#1E3A5F] whitespace-nowrap"
          >
            <i className="fa-solid fa-vault text-[#F5A623]" aria-hidden="true"></i>
            <span>Cash Audit</span>
          </button>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Store Notifications (${totalAlerts} alerts)`}
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
            >
              <i className="fa-solid fa-bell text-base" aria-hidden="true"></i>
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E64545] text-white font-bold text-[10px] rounded-full flex items-center justify-center font-mono">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Popup Dropdown */}
            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notifications Panel"
                className="absolute right-0 mt-2 w-72 bg-white border-2 border-slate-200 rounded-xl shadow-xl p-3.5 z-50 animate-fade-in text-xs space-y-2 motion-reduce:animate-none"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 font-display">
                    Store Notifications
                  </h4>
                  <span className="text-[10px] bg-red-50 text-[#E64545] px-2 py-0.5 rounded font-bold font-mono border border-red-200">
                    {totalAlerts} Alerts
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-2 text-amber-900">
                      <i className="fa-solid fa-triangle-exclamation text-amber-600 text-xs mt-0.5" aria-hidden="true"></i>
                      <div>
                        <p className="font-bold text-[11px]">Low Stock Alert</p>
                        <p className="text-[10px] text-amber-700 font-mono">
                          {lowStockCount} Kirana items below minimum warning threshold.
                        </p>
                      </div>
                    </div>
                  )}

                  {overdueUdharCount > 0 && (
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 flex items-start space-x-2 text-red-900">
                      <i className="fa-solid fa-book-bookmark text-[#E64545] text-xs mt-0.5" aria-hidden="true"></i>
                      <div>
                        <p className="font-bold text-[11px]">Overdue Udhaar Dues</p>
                        <p className="text-[10px] text-red-700 font-mono">
                          {overdueUdharCount} customer accounts have pending balances.
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
            aria-label="Select Store Interface Language"
            className="bg-slate-100 border-2 border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-[#1E3A5F] transition"
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
