import React, { useState } from "react";
import { useStore } from "../context/useStore";
import { INDIAN_LANGUAGES } from "../i18n/translations";
import { ShiftReconciliationModal } from "./CashDrawer/ShiftReconciliationModal";
import {
  Menu,
  Search,
  Globe,
  Lock,
  Landmark,
  Bell,
  AlertTriangle,
  BookOpen,
  Store,
  ShoppingBag,
} from "lucide-react";

export const Navbar = ({ onOpenMobileMenu }) => {
  const {
    storeConfig,
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
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 shadow-2xs">
      <div className="w-full mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Store Branding */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* Store Title Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="w-5 h-5 rounded bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xs">
              <Store className="w-3 h-3" />
            </div>
            <span className="text-zinc-900 text-xs font-bold font-display tracking-tight whitespace-nowrap">
              {storeConfig.name || "Gupta Multi-Vertical Retail"}
            </span>
          </div>

          {/* Mode Switcher Button (POS vs Storefront) */}
          <button
            onClick={() => setActiveTab(activeTab === "landing" ? "pos" : "landing")}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {activeTab === "landing" ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">POS Counter</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xs:inline">Storefront</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Global Item/Barcode Search Bar with Keyboard Hint */}
        <div className="flex-1 max-w-xs md:max-w-md hidden lg:block relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search items, barcode, SKU... (F2)"
            aria-label="Search items, barcode or SKU"
            spellCheck={false}
            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 text-slate-900 text-xs font-medium pl-9 pr-14 py-2 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Cloud Sync, Operator Profile, Lock, Drawer Audit, Notifications */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Cloud Sync Status Badge */}
          <button
            onClick={() => syncToCloud()}
            title={
              cloudSyncStatus === "offline"
                ? "Internet Disconnected. Offline-first mode active."
                : `Connected to Cloud (${cloudSyncStatus.toUpperCase()}). Click to sync.`
            }
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
              cloudSyncStatus === "offline"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : cloudSyncStatus === "syncing"
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cloudSyncStatus === "offline"
                  ? "bg-rose-500"
                  : cloudSyncStatus === "syncing"
                  ? "bg-amber-500 animate-spin"
                  : "bg-emerald-500 animate-pulse"
              }`}
            ></span>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider font-bold">
              {cloudSyncStatus === "syncing"
                ? "Syncing..."
                : cloudSyncStatus === "offline"
                ? "Offline"
                : pendingOutboxCount > 0
                ? `Sync (${pendingOutboxCount})`
                : "Online"}
            </span>
          </button>

          {/* Active Operator Profile Badge & Switch User */}
          <button
            onClick={lockCounter}
            title={`Logged in as ${currentUser?.name || "User"} (${currentUser?.role === 'admin' ? 'Admin' : 'Operator'}). Click to Switch / Lock.`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 transition cursor-pointer"
          >
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
              {currentUser?.name?.charAt(0) || "U"}
            </span>
            <span className="hidden lg:inline truncate max-w-[120px]">
              {currentUser?.name || "Operator"}
            </span>
            <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
              currentUser?.role === "admin" ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-slate-200 text-slate-700"
            }`}>
              {currentUser?.role === "admin" ? "Admin" : "User"}
            </span>
          </button>

          {/* Register Lock Button */}
          <button
            onClick={lockCounter}
            title="Lock POS Counter Register (PIN Required)"
            aria-label="Lock POS Counter Register"
            className="hidden sm:flex px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition items-center gap-1 border border-amber-200 cursor-pointer shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden md:inline">Lock</span>
          </button>

          {/* Shift Drawer Audit Trigger Button */}
          <button
            onClick={() => setShowShiftAuditModal(true)}
            title="Day-End Cash Drawer Audit"
            aria-label="Open Cash Drawer Audit Modal"
            className="hidden sm:flex px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold transition items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Landmark className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden md:inline">Cash Audit</span>
          </button>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Store Notifications (${totalAlerts} alerts)`}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center font-mono">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Popup Dropdown */}
            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notifications Panel"
                className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 z-50 animate-fade-in text-xs space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 font-display">
                    Store Notifications
                  </h4>
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold font-mono border border-rose-200">
                    {totalAlerts} Alerts
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[11px]">Low Stock Alert</p>
                        <p className="text-[10px] text-amber-700 font-mono">
                          {lowStockCount} items below minimum threshold.
                        </p>
                      </div>
                    </div>
                  )}

                  {overdueUdharCount > 0 && (
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2 text-rose-900">
                      <BookOpen className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[11px]">Overdue Udhaar Dues</p>
                        <p className="text-[10px] text-rose-700 font-mono">
                          {overdueUdharCount} customer accounts have pending balances.
                        </p>
                      </div>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="text-center py-4 text-slate-400 font-mono text-xs">
                      All systems normal. Zero alerts.
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
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition"
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