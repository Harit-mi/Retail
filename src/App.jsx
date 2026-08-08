import React, { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { MobileBottomNav } from "./components/Mobile/MobileBottomNav";
import { PaymentMixPulseBar } from "./components/Dashboard/PaymentMixPulseBar";
import { DashboardOverview } from "./components/Dashboard/DashboardOverview";
import { BillingCounter } from "./components/POS/BillingCounter";
import { CartSection } from "./components/POS/CartSection";
import { PaymentModal } from "./components/POS/PaymentModal";
import { CustomerSelectModal } from "./components/POS/CustomerSelectModal";
import { InventoryList } from "./components/Inventory/InventoryList";
import { CustomerLedger } from "./components/Khata/CustomerLedger";
import { SupplierPOList } from "./components/Suppliers/SupplierPOList";
import { AnalyticsDashboard } from "./components/Reports/AnalyticsDashboard";
import { StoreSettings } from "./components/Settings/StoreSettings";
import { VerticalModules } from "./components/Modules/VerticalModules";
import { ThermalReceipt } from "./components/Invoice/ThermalReceipt";
import { StandardInvoice } from "./components/Invoice/StandardInvoice";

const MainContent = () => {
  const { activeTab, printableBill, printFormat } = useStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-900 selection:bg-[#F5A623] selection:text-slate-950 pb-16 md:pb-0">
      {/* Sidebar (Desktop & Mobile Slide-Out Drawer) */}
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
          {activeTab === "dashboard" && <DashboardOverview />}

          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[calc(100vh-140px)]">
              {/* Left POS Counter Grid */}
              <div className="lg:col-span-7 xl:col-span-8 h-full min-h-[400px]">
                <BillingCounter />
              </div>

              {/* Right POS Cart Section */}
              <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[400px]">
                <CartSection
                  onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                  onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
                />
              </div>
            </div>
          )}

          {activeTab === "inventory" && <InventoryList />}
          {activeTab === "khata" && <CustomerLedger />}
          {activeTab === "suppliers" && <SupplierPOList />}
          {activeTab === "modules" && <VerticalModules />}
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
