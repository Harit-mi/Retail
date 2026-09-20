import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../context/useStore";
import { INDIAN_LANGUAGES } from "../i18n/translations";
import { PrivacyPolicyModal } from "./Legal/PrivacyPolicyModal";
import {
  Lock,
  Coins,
  Bell,
  Search,
  Store,
  Clock,
  Menu,
  Globe,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  Check,
  ChevronDown,
  CheckCircle2,
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
    addToCart,
    setIsCashDrawerOpen,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const notifRef = useRef(null);
  const langRef = useRef(null);

  // Real-time digital clock for till operations
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavSearchSubmit = (e) => {
    if (e.key === "Enter" && navSearch.trim()) {
      e.preventDefault();
      const q = navSearch.toLowerCase().trim();
      const matched = products.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase() === q) ||
          (p.hsn && p.hsn.toLowerCase() === q)
      );
      if (activeTab !== "pos") {
        setActiveTab("pos");
      }
      if (matched) {
        addToCart(matched, 1);
        setNavSearch("");
      }
    }
  };

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const overdueUdharCount = customers.filter((c) => c.balance > 0).length;
  const totalAlerts = lowStockCount + overdueUdharCount;

  // Selected language object
  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === currentLanguage) || INDIAN_LANGUAGES[0];

  return (
    <header className="bg-[#FAFAF9]/90 backdrop-blur-md text-zinc-900 border-b border-zinc-200/80 sticky top-0 z-30 h-16 flex items-center px-3 sm:px-6 shadow-2xs">
      <div className="w-full mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Store Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Clean Store Identity Pill */}
          <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-lg border border-zinc-200/80 shadow-2xs">
            <div className="w-6 h-6 rounded bg-zinc-950 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-xs font-bold font-display text-zinc-950 tracking-tight block truncate max-w-[130px] lg:max-w-[170px]">
                {storeConfig.name || "Gupta Kirana Store"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-zinc-500 font-mono font-medium">
                  Online · Till #01
                </span>
              </div>
            </div>
          </div>

          {/* Quick POS / Storefront View Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === "landing" ? "pos" : "landing")}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors border border-zinc-200 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>{activeTab === "landing" ? "Open Register" : "Storefront"}</span>
          </button>
        </div>

        {/* Center: Clean Global Rapid Search */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            onKeyDown={handleNavSearchSubmit}
            placeholder="Search items, barcode, HSN… (Enter adds to cart)"
            aria-label="Search items, barcode or HSN"
            spellCheck={false}
            className="w-full bg-white border border-zinc-200 text-zinc-900 text-xs font-medium pl-10 pr-20 py-2 rounded-lg outline-none focus:border-zinc-950 shadow-2xs transition placeholder-zinc-400"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded select-none">
            ↵ Enter
          </kbd>
        </div>

        {/* Right: Clock, Drawer Audit, Lock, Notifications, Privacy & Custom Language Popover */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Real-time Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-mono font-medium text-zinc-600 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Cash Drawer Reconciliation Button */}
          <button
            onClick={() => setIsCashDrawerOpen(true)}
            title="Cash Drawer Audit & Shift Reconciliation"
            aria-label="Open Cash Drawer Audit Modal"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-zinc-200 cursor-pointer shadow-2xs"
          >
            <Coins className="w-3.5 h-3.5 text-zinc-700" />
            <span className="inline">Drawer</span>
          </button>

          {/* Register Lock Button */}
          <button
            onClick={lockCounter}
            title="Lock POS Counter Register"
            aria-label="Lock POS Counter Register"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98]"
          >
            <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          {/* Privacy & DPDP Policy Button */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            title="Privacy Policies & DPDP 2023 Compliance Center"
            aria-label="Open Privacy Policies"
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 transition-colors relative cursor-pointer border border-zinc-200 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Notification Bell Badge with Refined Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Store Notifications (${totalAlerts} alerts)`}
              className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 transition-colors relative cursor-pointer border border-zinc-200 shadow-2xs"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-zinc-950 text-white font-bold text-[9px] rounded-full flex items-center justify-center font-mono ring-2 ring-white">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notifications Panel"
                className="absolute right-0 mt-2 w-80 bg-white text-zinc-900 border border-zinc-200 rounded-xl shadow-xl p-4 z-50 animate-fade-in text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h4 className="font-semibold text-zinc-950 font-display flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-zinc-700" />
                    <span>Store Alerts</span>
                  </h4>
                  <span className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-semibold font-mono border border-zinc-200">
                    {totalAlerts} Action Required
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 flex items-start gap-2.5 text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs text-amber-950">Low Inventory Warning</p>
                        <p className="text-[11px] text-amber-800 font-mono mt-0.5">
                          {lowStockCount} items at or below reorder threshold.
                        </p>
                      </div>
                    </div>
                  )}

                  {overdueUdharCount > 0 && (
                    <div className="p-3 bg-red-50/80 rounded-lg border border-red-200 flex items-start gap-2.5 text-red-950">
                      <BookOpen className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs text-red-950">Pending Udhaar Dues</p>
                        <p className="text-[11px] text-red-800 font-mono mt-0.5">
                          {overdueUdharCount} customer ledgers have unsettled balances.
                        </p>
                      </div>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="text-center py-5 space-y-1.5 bg-zinc-50 rounded-lg border border-zinc-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                      <p className="font-semibold text-xs text-zinc-800">All Clear</p>
                      <p className="text-[11px] text-zinc-500 font-mono">No inventory or Udhaar alerts.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom High-Contrast Language Dropdown Popover */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              aria-label="Select Store Language"
              className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="text-zinc-900 font-semibold">{currentLangObj.native}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showLangDropdown ? "rotate-180 text-zinc-900" : ""}`} />
            </button>

            {/* Floating Language Menu */}
            {showLangDropdown && (
              <div
                role="listbox"
                aria-label="Languages list"
                className="absolute right-0 mt-2 w-56 bg-white text-zinc-900 border border-zinc-200 rounded-xl shadow-xl p-1.5 z-50 animate-fade-in space-y-0.5 max-h-72 overflow-y-auto"
              >
                <div className="px-2.5 py-1.5 border-b border-zinc-100 mb-1">
                  <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block">
                    Language / भाषा
                  </span>
                </div>

                {INDIAN_LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      type="button"
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        isSelected
                          ? "bg-zinc-100 text-zinc-950 font-semibold"
                          : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{lang.flag}</span>
                        <div className="truncate">
                          <span className="text-zinc-900 font-semibold block">{lang.native}</span>
                          <span className="text-[10px] text-zinc-400 font-mono block">{lang.name}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-zinc-950 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Privacy & DPDP Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </header>
  );
};
