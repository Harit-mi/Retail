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
import { PaymentModal } from "./components/POS/PaymentModal";
import { CustomerSelectModal } from "./components/POS/CustomerSelectModal";
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
  } = useStore();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

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
      <div className="min-h-screen bg-[#1E3A5F] flex flex-col items-center justify-center p-5 text-white">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="font-extrabold font-display text-lg tracking-tight">
            Gupta<span className="text-[#F5A623]">Kirana</span> POS
          </h3>
          <p className="text-xs text-amber-200/80 font-mono">
            Decrypting Store Ledgers with Native Web Crypto API...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-900 selection:bg-[#F5A623] selection:text-slate-950 pb-16 md:pb-0">
      {/* Global POS Register Lock Overlay (Gates ENTIRE application when active) */}
      {isCounterLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-5 text-white animate-fade-in">
          <div className="bg-white text-slate-900 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden border-2 border-slate-200">
            {/* Header */}
            <div className="bg-[#0F1F35] text-white px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#F5A623] text-slate-950 flex items-center justify-center font-black">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-display">POS Counter Register Locked</h3>
                <p className="text-[11px] text-amber-300 font-mono">
                  Cashier PIN Verification Required
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-center">
              <p className="text-xs text-slate-500 font-medium font-mono">
                Enter cashier PIN to unlock register (Default: <strong className="text-slate-900 font-bold">{counterPin}</strong>)
              </p>

              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  type="password"
                  maxLength="6"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  placeholder="••••"
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 border-2 border-slate-300 rounded-lg outline-none focus:border-[#1E3A5F] bg-slate-50 text-slate-900"
                />

                {pinError && (
                  <p className="text-xs font-bold text-[#E64545] font-mono">{pinError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black font-display rounded-lg text-xs transition min-h-[44px]"
                >
                  UNLOCK REGISTER NOW
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Live Payment Mix Pulse Bar */}
        <PaymentMixPulseBar />

        {/* Main View Screen */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto overflow-x-hidden">
          {activeTab === "pos" && (
            <POSBillingScreen
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            />
          )}

          {activeTab === "inventory" && <InventoryList />}
          {activeTab === "barcodes" && <BarcodePrintModal />}
          {activeTab === "khata" && <CustomerLedger />}
          {activeTab === "whatsapp" && <WhatsAppMarketingHub />}
          {activeTab === "reports" && <AnalyticsDashboard />}
          {activeTab === "security" && <SecurityPrivacyPanel />}
          {activeTab === "settings" && <StoreSettings />}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMoreMenu={() => setIsMobileMenuOpen(true)} />

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Select Customer Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
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
