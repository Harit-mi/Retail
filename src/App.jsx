import React, { useState } from "react";
import { StoreProvider } from "./context/StoreContext";
import { useStore } from "./context/useStore";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { MobileBottomNav } from "./components/Mobile/MobileBottomNav";
import { PaymentMixPulseBar } from "./components/Dashboard/PaymentMixPulseBar";
import { POSBillingScreen } from "./components/POS/POSBillingScreen";
import { InventoryList } from "./components/Inventory/InventoryList";
import { BarcodePrintModal } from "./components/Barcode/BarcodePrintModal";
import { CustomerLedger } from "./components/Khata/CustomerLedger";
import { WhatsAppMarketingHub } from "./components/Marketing/WhatsAppMarketingHub";
import { AnalyticsDashboard } from "./components/Reports/AnalyticsDashboard";
import { SecurityPrivacyPanel } from "./components/Security/SecurityPrivacyPanel";
import { StoreSettings } from "./components/Settings/StoreSettings";
import { ProductLandingPage } from "./components/Landing/ProductLandingPage";
import { DashboardOverview } from "./components/Dashboard/DashboardOverview";
import { SupplierPOList } from "./components/Suppliers/SupplierPOList";
import { VerticalModules } from "./components/Modules/VerticalModules";
import { PaymentModal } from "./components/POS/PaymentModal";
import { CustomerSelectModal } from "./components/POS/CustomerSelectModal";
import { ShiftReconciliationModal } from "./components/CashDrawer/ShiftReconciliationModal";
import { ThermalReceipt } from "./components/Invoice/ThermalReceipt";
import { StandardInvoice } from "./components/Invoice/StandardInvoice";
import { Lock, ShieldAlert } from "lucide-react";

const MainContent = () => {
  const {
    activeTab,
    setActiveTab,
    printableBill,
    printFormat,
    isStorageLoaded,
    isCounterLocked,
    lockCounter,
    unlockCounter,
    decryptionFailedClosed,
    isCashDrawerOpen,
    setIsCashDrawerOpen,
    users,
    currentUser,
    hasPanelAccess,
  } = useStore();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedUsername, setSelectedUsername] = useState(() => currentUser?.username || "admin");

  const handleUnlock = async (e) => {
    e.preventDefault();
    const res = await unlockCounter(pinInput, selectedUsername);
    if (res.success) {
      setPinInput("");
      setPinError("");
    } else {
      setPinError(res.message);
    }
  };

  const handleResetRegister = () => {
    if (window.confirm("Reset cashier PIN and restore default register? This will clear locally locked storage.")) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (err) {
        console.warn("Storage clear error:", err);
      }
      window.location.reload();
    }
  };

  if (!isStorageLoaded) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-5 text-zinc-900 selection:bg-zinc-900 selection:text-white">
        <div className="space-y-4 text-center max-w-sm">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="font-bold font-display text-base tracking-tight text-zinc-950">
              DUKAAN<span className="text-zinc-400 font-normal">POS</span>
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Initializing Local Database & AES-256 Crypto...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAF9] text-zinc-900 selection:bg-zinc-900 selection:text-white pb-16 md:pb-0">
      {/* Global POS Register Lock Overlay (Gates ENTIRE application when active) */}
      {isCounterLocked && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lock-modal-title"
          className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-zinc-900 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-zinc-200">
            {/* Header */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="lock-modal-title" className="text-sm font-bold text-zinc-950">
                    Register Counter Locked
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Cashier PIN Verification Required
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {decryptionFailedClosed && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] leading-tight">
                  <strong>Vault Sealed (Fail-Closed):</strong> Enter your configured cashier PIN to decrypt store records. Data write is paused to protect your local records from corruption.
                </div>
              )}

              {/* Operator / User Profile Selector */}
              <div>
                <label className="text-[11px] font-medium text-zinc-500 mb-1.5 block">
                  Select User Account · ऑपरेटर चुनें:
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {(users || []).filter((u) => u.status === "active").map((u) => {
                    const isSelected = selectedUsername === u.username;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUsername(u.username);
                          setPinError("");
                        }}
                        className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                            : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono ${
                            isSelected ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700"
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-semibold block truncate leading-tight">{u.name}</span>
                            <span className={`text-[10px] font-mono leading-none ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                              @{u.username}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          u.role === "admin"
                            ? isSelected ? "bg-amber-400 text-zinc-950" : "bg-amber-100 text-amber-900"
                            : isSelected ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700"
                        }`}>
                          {u.role === "admin" ? "👑 Admin" : "User"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <label htmlFor="cashier-pin-input">
                  Enter Passcode / PIN
                </label>
                <span className="text-[10px] text-zinc-500 font-bold">
                  @{selectedUsername}
                </span>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  id="cashier-pin-input"
                  name="cashierPin"
                  type="password"
                  maxLength="32"
                  autoComplete="off"
                  spellCheck={false}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  placeholder="••••"
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 border border-zinc-300 rounded-lg outline-none focus:border-zinc-950 bg-zinc-50/50 text-zinc-900 transition-colors"
                />

                {pinError && (
                  <p role="alert" className="text-xs font-semibold text-red-600 font-mono text-center">{pinError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Unlock & Login ({selectedUsername})
                </button>
              </form>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">Forgot PIN?</span>
                <button
                  type="button"
                  onClick={handleResetRegister}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  Reset Register & PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop & Mobile Drawer) - Hidden on Storefront Landing */}
      {activeTab !== "landing" && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar - Hidden on Storefront Landing */}
        {activeTab !== "landing" && (
          <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        )}

        {/* Live Payment Mix Pulse Bar */}
        {activeTab !== "landing" && <PaymentMixPulseBar />}

        {/* Main View Screen */}
        <main className={activeTab === "landing" ? "flex-1 w-full" : "flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto overflow-x-hidden"}>
          {activeTab === "landing" && <ProductLandingPage />}

          {activeTab !== "landing" && !hasPanelAccess(activeTab) ? (
            <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-lg mx-auto text-center shadow-xs my-12 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  अनुमति प्रतिबंधित · Access Restricted
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  You are logged in as <strong>{currentUser?.name}</strong> (@{currentUser?.username} · {currentUser?.role === "admin" ? "Admin" : "Standard User"}).
                  Admin has not granted you access to the <strong>{activeTab.toUpperCase()}</strong> panel.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(currentUser?.allowedPanels?.[0] || "pos")}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
                >
                  Go to {currentUser?.allowedPanels?.[0]?.toUpperCase() || "POS"}
                </button>
                <button
                  type="button"
                  onClick={() => lockCounter()}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition border border-zinc-200 cursor-pointer"
                >
                  Switch User / Login as Admin
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && <DashboardOverview />}
              {activeTab === "pos" && (
                <POSBillingScreen
                  onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                  onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
                />
              )}

              {activeTab === "inventory" && <InventoryList />}
              {activeTab === "suppliers" && <SupplierPOList />}
              {activeTab === "barcodes" && <BarcodePrintModal />}
              {activeTab === "khata" && <CustomerLedger />}
              {activeTab === "modules" && <VerticalModules />}
              {activeTab === "whatsapp" && <WhatsAppMarketingHub />}
              {activeTab === "reports" && <AnalyticsDashboard />}
              {activeTab === "security" && <SecurityPrivacyPanel />}
              {activeTab === "settings" && <StoreSettings />}
            </>
          )}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar - Hidden on Storefront Landing */}
      {activeTab !== "landing" && (
        <MobileBottomNav onOpenMoreMenu={() => setIsMobileMenuOpen(true)} />
      )}

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onOpenCustomerModal={() => {
          setIsPaymentModalOpen(false);
          setIsCustomerModalOpen(true);
        }}
      />

      {/* Select Customer Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      {/* Cash Drawer Reconciliation & Shift Audit Root Modal */}
      <ShiftReconciliationModal
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
      />

      {/* Printable Receipt Templates */}
      {printableBill && (
        <>
          {printFormat === "thermal" ? (
            <ThermalReceipt bill={printableBill} />
          ) : (
            <StandardInvoice bill={printableBill} />
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
