import React from "react";
import { useStore } from "../../context/StoreContext";
import {
  ShoppingCart,
  Boxes,
  BookOpen,
  Barcode,
  MessageSquare,
} from "lucide-react";

export const MobileBottomNav = ({ _onOpenMoreMenu }) => {
  const { activeTab, setActiveTab, products, customers } = useStore();

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const udharCount = customers.filter((c) => c.balance > 0).length;

  const mobileTabs = [
    { id: "pos", label: "Billing", icon: ShoppingCart, badge: null },
    { id: "inventory", label: "Stock", icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : null },
    { id: "barcodes", label: "Barcodes", icon: Barcode, badge: null },
    { id: "khata", label: "Udhaar", icon: BookOpen, badge: udharCount > 0 ? udharCount : null },
    { id: "whatsapp", label: "Marketing", icon: MessageSquare, badge: null },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 px-2 py-1 shadow-lg flex items-center justify-around">
      {mobileTabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative ${
              isActive ? "text-[#1E3A5F] font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <IconComponent
                className={`w-5 h-5 ${isActive ? "text-[#F5A623] stroke-[2.5]" : "stroke-[1.75]"}`}
              />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-display">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
