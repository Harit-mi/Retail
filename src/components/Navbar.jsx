import React, { useState } from "react";
import { useStore } from "../context/useStore";
import { INDIAN_LANGUAGES } from "../i18n/translations";
import { ShiftReconciliationModal } from "./CashDrawer/ShiftReconciliationModal";

export const Navbar = ({ onOpenMobileMenu }) => {
  const {
    theme,
    toggleTheme,
    storeConfig,
    businessProfile,
    currentLanguage,
    changeLanguage,
    products,
    customers,
    lockCounter,
    activeTab,
    setActiveTab,
    cloudSyncStatus,
    syncToCloud,
    syncOutbox = [],
    currentUser,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showShiftAuditModal, setShowShiftAuditModal] = useState(false);

  const pendingOutboxCount = syncOutbox.filter((e) => e.status === "pending_sync").length;

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const overdueUdharCount = customers.filter((c) => c.balance > 0).length;
  const totalAlerts = lowStockCount + overdueUdharCount;

  return (
    <header className="bg-white dark:bg-[#09090B] border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 transition-colors">
      <div className="w-full mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Store Branding */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <i className="fa-solid fa-bars text-lg" aria-hidden="true"></i>
          </button>

          {/* Retail Store Title Badge & Business Sector Tag */}
          <div className="hidden sm:flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <i className={`fa-solid ${businessProfile?.icon ? businessProfile.icon : "fa-cart-shopping"} text-zinc-900 dark:text-zinc-100 text-sm`} aria-hidden="true"></i>
            <span className="text-zinc-950 dark:text-zinc-50 text-xs font-black font-display tracking-tight whitespace-nowrap">
              {storeConfig.name || "Gupta Retail POS"}
            </span>
            <span className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono px-2 py-0.5 rounded font-bold uppercase shadow-2xs">
              {businessProfile?.shortName || "Retail"}
            </span>
          </div>

          {/* Mode Switcher Button */}
          <button
            onClick={() => setActiveTab(activeTab === "landing" ? "pos" : "landing")}
            className="px-2.5 sm:px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-extrabold transition flex items-center space-x-1.5 border border-zinc-800 dark:border-zinc-300 shadow-2xs font-display cursor-pointer"
          >
            <i className={`fa-solid ${activeTab === "landing" ? "fa-cash-register" : "fa-globe"}`} aria-hidden="true"></i>
            <span className="hidden xs:inline">{activeTab === "landing" ? "POS Counter" : "Storefront"}</span>
            <span className="xs:hidden">{activeTab === "landing" ? "POS" : "Site"}</span>
          </button>
        </div>

        {/* Center: Global Item/Barcode Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-md hidden lg:block relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search items, barcode, HSN… (F2)"
            aria-label="Search items, barcode or HSN"
            spellCheck={false}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold pl-10 pr-4 py-2 rounded-lg outline-none focus:bg-white dark:focus:bg-zinc-950 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
          />
        </div>

        {/* Right: Online Cloud Sync, Theme Switcher, Cashier Lock, Cash Audit, Notifications */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          {/* Cloud Sync Status Badge */}
          <button
            onClick={() => syncToCloud()}
            title={
              cloudSyncStatus === "offline"
                ? "Internet Disconnected. Cloud sync paused."
                : `Connected to Cloud (${cloudSyncStatus.toUpperCase()}). Click to sync.`
            }
            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 whitespace-nowrap"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cloudSyncStatus === "offline"
                  ? "bg-zinc-400"
                  : cloudSyncStatus === "syncing"
                  ? "bg-zinc-400 animate-spin"
                  : "bg-zinc-950 dark:bg-white animate-pulse"
              }`}
            ></span>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold">
              {cloudSyncStatus === "syncing"
                ? "Syncing..."
                : cloudSyncStatus === "offline"
                ? "Offline"
                : pendingOutboxCount > 0
                ? `Sync (${pendingOutboxCount})`
                : "Connected"}
            </span>
          </button>

          {/* Minimal 2-Color Theme Switcher (Dark / Light) */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode (Minimalist Monochromatic)`}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
          >
            {theme === "dark" ? (
              <>
                <i className="fa-solid fa-sun text-xs text-zinc-100" aria-hidden="true"></i>
                <span className="hidden xl:inline text-[11px] font-mono font-bold">Light</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-moon text-xs text-zinc-900" aria-hidden="true"></i>
                <span className="hidden xl:inline text-[11px] font-mono font-bold">Dark</span>
              </>
            )}
          </button>

          {/* Active Operator Profile Badge & Switch User */}
          <button
            onClick={lockCounter}
            title={`Logged in as ${currentUser?.name || "User"} (${currentUser?.role === 'admin' ? 'Admin' : 'Operator'}). Click to Switch / Lock.`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
          >
            <span className="w-5 h-5 rounded bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-[10px] font-mono font-bold">
              {currentUser?.name?.charAt(0) || "U"}
            </span>
            <span className="hidden lg:inline truncate max-w-[120px]">
              {currentUser?.name || "Operator"}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {currentUser?.role === "admin" ? "Admin" : "User"}
            </span>
          </button>

          {/* POS Register PIN Lock Trigger Button */}
          <button
            onClick={lockCounter}
            title="Lock POS Counter Register (PIN Required)"
            aria-label="Lock POS Counter Register"
            className="hidden sm:flex px-2.5 sm:px-3 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-bold transition items-center space-x-1.5 border border-zinc-200 dark:border-zinc-800 shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <i className="fa-solid fa-lock text-xs" aria-hidden="true"></i>
            <span className="font-display hidden md:inline">Lock</span>
          </button>

          {/* Shift Drawer Audit Trigger Button */}
          <button
            onClick={() => setShowShiftAuditModal(true)}
            title="Day-End Cash Drawer Audit"
            aria-label="Open Cash Drawer Audit Modal"
            className="hidden sm:flex px-2.5 sm:px-3 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-bold transition items-center space-x-1.5 border border-zinc-200 dark:border-zinc-800 shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <i className="fa-solid fa-vault text-xs" aria-hidden="true"></i>
            <span className="hidden md:inline">Cash Audit</span>
          </button>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Store Notifications (${totalAlerts} alerts)`}
              className="p-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition relative cursor-pointer"
            >
              <i className="fa-solid fa-bell text-base" aria-hidden="true"></i>
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-[10px] rounded-full flex items-center justify-center font-mono">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Popup Dropdown */}
            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notifications Panel"
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-3.5 z-50 animate-fade-in text-xs space-y-2 motion-reduce:animate-none"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <h4 className="font-bold text-zinc-950 dark:text-zinc-50 font-display">
                    Store Notifications
                  </h4>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded font-bold font-mono border border-zinc-200 dark:border-zinc-700">
                    {totalAlerts} Alerts
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2 text-zinc-900 dark:text-zinc-100">
                      <i className="fa-solid fa-triangle-exclamation text-xs mt-0.5" aria-hidden="true"></i>
                      <div>
                        <p className="font-bold text-[11px]">Low Stock Alert</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {lowStockCount} inventory items below minimum warning threshold.
                        </p>
                      </div>
                    </div>
                  )}

                  {overdueUdharCount > 0 && (
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2 text-zinc-900 dark:text-zinc-100">
                      <i className="fa-solid fa-book-bookmark text-xs mt-0.5" aria-hidden="true"></i>
                      <div>
                        <p className="font-bold text-[11px]">Overdue Udhaar Dues</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
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
