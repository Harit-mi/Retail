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
import { StoreSettings } from "./components/Settings/StoreSettings";
import { PaymentModal } from "./components/POS/PaymentModal";
import { CustomerSelectModal } from "./components/POS/CustomerSelectModal";
import { ThermalReceipt } from "./components/Invoice/ThermalReceipt";
import { StandardInvoice } from "./components/Invoice/StandardInvoice";

const MainContent = () => {
  const { activeTab, printableBill, printFormat } = useStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-900 selection:bg-[#F5A623] selection:text-slate-950 pb-16 md:pb-0">
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
