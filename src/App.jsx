import React, { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
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

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-900 selection:bg-[#F5A623] selection:text-slate-950 pb-16 md:pb-0">
      {/* Global POS Register Lock Overlay (Gates ENTIRE application when active) */}
      {isCounterLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-5 text-white animate-fade-in">
          <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold font-display">POS Counter Register Locked</h3>
            <p className="text-xs text-slate-500 font-medium">
              Enter {counterPin.length}-digit cashier PIN to unlock register (Default: {counterPin})
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
                className="w-full text-center text-2xl font-mono tracking-widest py-3 border-2 border-slate-300 rounded-2xl outline-none focus:border-[#1E3A5F]"
              />

              {pinError && (
                <p className="text-xs font-bold text-[#E64545]">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold rounded-2xl text-xs shadow-md transition min-h-[44px]"
              >
                Unlock Register Now
              </button>
            </form>
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
