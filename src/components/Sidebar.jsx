import React, { useState } from "react";
import { useStore } from "../context/StoreContext";

export const Sidebar = () => {
  const { activeTab, setActiveTab, products, customers, t } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const udharCount = customers.filter((c) => c.balance > 0).length;

  const navItems = [
    { id: "dashboard", label: t("dashboard"), iconClass: "fa-solid fa-chart-line", badge: null },
    { id: "pos", label: t("counterPOS"), iconClass: "fa-solid fa-cash-register", badge: "POS" },
    {
      id: "inventory",
      label: t("inventory"),
      iconClass: "fa-solid fa-boxes-stacked",
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: "bg-red-500/20 text-red-300",
    },
    {
      id: "khata",
      label: t("udharBook"),
      iconClass: "fa-solid fa-book-bookmark",
      badge: udharCount > 0 ? `${udharCount} Due` : null,
      badgeColor: "bg-amber-500/20 text-amber-300",
    },
    { id: "modules", label: t("verticalModules"), iconClass: "fa-solid fa-cubes", badge: "7" },
    { id: "reports", label: t("reports"), iconClass: "fa-solid fa-file-invoice-dollar", badge: null },
    { id: "settings", label: t("settings"), iconClass: "fa-solid fa-[#F5A623] fa-sliders", badge: null },
  ];

  return (
    <aside
      className={`bg-[#1E3A5F] text-slate-100 min-h-screen flex flex-col transition-all duration-300 border-r border-slate-700/50 shadow-xl z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/30">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F5A623] to-amber-500 flex items-center justify-center shadow-md text-slate-950 text-base font-bold">
              <i className="fa-solid fa-store"></i>
            </div>
            <div>
              <span className="font-extrabold text-base font-display text-white tracking-tight">
                Dukaan<span className="text-[#F5A623]">POS</span>
              </span>
              <span className="block text-[10px] text-slate-300 font-mono tracking-wider uppercase">
                India Multi-Lingual
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F5A623] to-amber-500 flex items-center justify-center text-slate-950">
            <i className="fa-solid fa-store"></i>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition hidden md:block"
        >
          <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"} text-xs`}></i>
        </button>
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                collapsed ? "justify-center px-2" : "px-3.5"
              } py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#F5A623] text-slate-950 font-bold shadow-md shadow-amber-950/30"
                  : "text-slate-200 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <i className={`${item.iconClass} text-base w-5 text-center ${isActive ? "text-slate-950" : "text-amber-400"}`}></i>
              {!collapsed && (
                <div className="ml-3 flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-slate-950/20 text-slate-950"
                          : item.badgeColor || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-900/40 border border-slate-700/50 text-xs text-slate-300">
          <div className="flex items-center space-x-2 font-bold text-amber-300">
            <i className="fa-solid fa-language"></i>
            <span>12 State Languages</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero-latency Localized Translation
          </p>
        </div>
      )}
    </aside>
  );
};
