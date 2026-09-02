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
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#0F1F35] text-white border-t border-white/10 z-40 px-2 py-1 flex items-center justify-around shadow-2xl">
      {mobileTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center relative transition ${
              isActive ? "text-[#F5A623] font-black" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold mt-0.5">{tab.label}</span>
            {tab.badge && (
              <span className="absolute top-1 right-3 bg-[#E64545] text-white text-[9px] font-mono font-bold px-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      <button
        onClick={onOpenMoreMenu}
        className="flex-1 py-1.5 flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-mono font-bold mt-0.5">More</span>
      </button>
    </div>
  );
};
