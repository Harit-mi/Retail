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
import { Lock } from "lucide-react";

const MainContent = () => {
  const {
    activeTab,
    printableBill,
    printFormat,
    isStorageLoaded,
    isCounterLocked,
    unlockCounter,
    counterPin,
    isCashDrawerOpen,
    setIsCashDrawerOpen,
  } = useStore();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showDemoPin, setShowDemoPin] = useState(false);

  const handleUnlock = (e) => {
    e.preventDefault();
    const res = unlockCounter(pinInput);
    if (res.success) {
      setPinInput("");
      setPinError("");
    } else {
      setPinError(res.message);
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
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <label htmlFor="cashier-pin-input">Enter 4-digit PIN</label>
                <button
                  type="button"
                  onClick={() => setShowDemoPin(!showDemoPin)}
                  className="text-zinc-800 hover:underline text-[10px] cursor-pointer"
                >
                  {showDemoPin ? `Default: ${counterPin}` : "Show Demo PIN"}
                </button>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  id="cashier-pin-input"
                  name="cashierPin"
                  type="password"
                  maxLength="6"
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
                  Unlock Register
                </button>
              </form>
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
