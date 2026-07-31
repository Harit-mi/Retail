import React, { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Navbar } from "./components/Navbar";
import { BillingCounter } from "./components/POS/BillingCounter";
import { CartSection } from "./components/POS/CartSection";
import { PaymentModal } from "./components/POS/PaymentModal";
import { CustomerSelectModal } from "./components/POS/CustomerSelectModal";
import { InventoryList } from "./components/Inventory/InventoryList";
import { CustomerLedger } from "./components/Khata/CustomerLedger";
import { AnalyticsDashboard } from "./components/Reports/AnalyticsDashboard";
import { StoreSettings } from "./components/Settings/StoreSettings";
import { VerticalModules } from "./components/Modules/VerticalModules";
import { ThermalReceipt } from "./components/Invoice/ThermalReceipt";
import { StandardInvoice } from "./components/Invoice/StandardInvoice";

const MainContent = () => {
  const { activeTab, printableBill, printFormat } = useStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 overflow-hidden">
        {activeTab === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)]">
            {/* Left POS Counter Product Grid */}
            <div className="lg:col-span-7 xl:col-span-8 h-full min-h-[450px]">
              <BillingCounter />
            </div>

            {/* Right POS Cart Section */}
            <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[450px]">
              <CartSection
                onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === "inventory" && <InventoryList />}
        {activeTab === "khata" && <CustomerLedger />}
        {activeTab === "modules" && <VerticalModules />}
        {activeTab === "reports" && <AnalyticsDashboard />}
        {activeTab === "settings" && <StoreSettings />}
      </main>

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Select / Link Customer Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      {/* Printable Invoice View (Hidden on web UI, visible on window.print()) */}
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
