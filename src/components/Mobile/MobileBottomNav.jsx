import React from "react";
import { useStore } from "../../context/useStore";
import { ShoppingBag, Boxes, Barcode, BookOpen, Menu } from "lucide-react";

export const MobileBottomNav = ({ onOpenMoreMenu }) => {
  const { activeTab, setActiveTab, products, customers } = useStore();

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const udharCount = customers.filter((c) => c.balance > 0).length;

  const mobileTabs = [
    { id: "pos", label: "Billing", icon: ShoppingBag, badge: null },
    { id: "inventory", label: "Stock", icon: Boxes, badge: lowStockCount || null },
    { id: "barcodes", label: "Print", icon: Barcode, badge: null },
    { id: "khata", label: "Khata", icon: BookOpen, badge: udharCount || null },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#FAFAF9]/95 backdrop-blur-md text-zinc-600 border-t border-zinc-200/90 z-40 px-2 py-1 flex items-center justify-around shadow-sm">
      {mobileTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center relative transition-colors ${
              isActive ? "text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-mono font-medium mt-0.5">{tab.label}</span>
            {tab.badge && (
              <span className="absolute top-1 right-3 bg-zinc-900 text-white text-[9px] font-mono font-bold px-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      <button
        onClick={onOpenMoreMenu}
        className="flex-1 py-1.5 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-mono font-medium mt-0.5">More</span>
      </button>
    </div>
  );
};
