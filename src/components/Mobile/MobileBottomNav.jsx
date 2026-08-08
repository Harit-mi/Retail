import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";

export const MobileBottomNav = ({ onOpenMoreMenu }) => {
  const { activeTab, setActiveTab, cart, products, customers, t } = useStore();

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const udharCount = customers.filter((c) => c.balance > 0).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 card-shadow px-2 py-1.5 flex items-center justify-around">
      {/* 1. Dashboard */}
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
          activeTab === "dashboard"
            ? "text-[#1E3A5F] font-bold"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <i className="fa-solid fa-chart-line text-lg mb-0.5"></i>
        <span className="text-[10px] font-display">{t("dashboard")}</span>
      </button>

      {/* 2. Billing POS */}
      <button
        onClick={() => setActiveTab("pos")}
        className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${
          activeTab === "pos"
            ? "text-[#F5A623] font-bold bg-slate-900 text-white shadow-md"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <i className="fa-solid fa-cash-register text-lg mb-0.5"></i>
        <span className="text-[10px] font-display">{t("counterPOS")}</span>
        {cart.length > 0 && (
          <span className="absolute -top-1 right-1 w-4 h-4 bg-[#1FAA59] text-white font-bold text-[9px] rounded-full flex items-center justify-center font-mono">
            {cart.length}
          </span>
        )}
      </button>

      {/* 3. Inventory Stock */}
      <button
        onClick={() => setActiveTab("inventory")}
        className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${
          activeTab === "inventory"
            ? "text-[#1E3A5F] font-bold"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <i className="fa-solid fa-boxes-stacked text-lg mb-0.5"></i>
        <span className="text-[10px] font-display">{t("inventory")}</span>
        {lowStockCount > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white font-bold text-[8px] rounded-full flex items-center justify-center font-mono">
            {lowStockCount}
          </span>
        )}
      </button>

      {/* 4. Khata Book */}
      <button
        onClick={() => setActiveTab("khata")}
        className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${
          activeTab === "khata"
            ? "text-[#1E3A5F] font-bold"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <i className="fa-solid fa-book-bookmark text-lg mb-0.5"></i>
        <span className="text-[10px] font-display">{t("udharBook")}</span>
        {udharCount > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-amber-500 text-white font-bold text-[8px] rounded-full flex items-center justify-center font-mono">
            {udharCount}
          </span>
        )}
      </button>

      {/* 5. More Menu Drawer Trigger */}
      <button
        onClick={onOpenMoreMenu}
        className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition"
      >
        <i className="fa-solid fa-[#F5A623] fa-bars text-lg mb-0.5"></i>
        <span className="text-[10px] font-display">More</span>
      </button>
    </div>
  );
};
