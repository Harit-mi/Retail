import React, { useState } from "react";
import { useStore } from "../context/useStore";

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, products, customers, t } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const udharCount = customers.filter((c) => c.balance > 0).length;

  const navItems = [
    { id: "pos", label: "Kirana Billing POS", iconClass: "fa-solid fa-cash-register", badge: "POS" },
    {
      id: "inventory",
      label: "Kirana Inventory",
      iconClass: "fa-solid fa-boxes-stacked",
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: "bg-red-500/20 text-red-300",
    },
    { id: "barcodes", label: "Barcode Printing", iconClass: "fa-solid fa-barcode", badge: "Print" },
    {
      id: "khata",
      label: "Udhaar & Loyalty",
      iconClass: "fa-solid fa-book-bookmark",
      badge: udharCount > 0 ? `${udharCount} Due` : null,
      badgeColor: "bg-amber-500/20 text-amber-300",
    },
    { id: "whatsapp", label: "WhatsApp Marketing", iconClass: "fa-brands fa-whatsapp", badge: "New" },
    { id: "reports", label: t("reports"), iconClass: "fa-solid fa-file-invoice-dollar", badge: null },
    { id: "security", label: "Security & Privacy", iconClass: "fa-solid fa-shield-halved", badge: "DPDP" },
    { id: "settings", label: t("settings"), iconClass: "fa-solid fa-sliders", badge: null },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        />
      )}

      {/* Main Responsive Sidebar Drawer */}
      <aside
        className={`bg-[#0F1F35] text-slate-100 min-h-screen flex flex-col transition-all duration-300 border-r border-white/10 shadow-xl z-50 ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 w-64 translate-x-0"
            : "hidden md:flex " + (collapsed ? "w-16" : "w-64")
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5A623] flex items-center justify-center shadow text-slate-950 text-base font-black">
              <i className="fa-solid fa-shop"></i>
            </div>
            {(!collapsed || isMobileOpen) && (
              <div>
                <span className="font-black text-base font-display text-white tracking-tight">
                  Gupta<span className="text-[#F5A623]">Kirana</span>
                </span>
                <span className="block text-[10px] text-amber-400 font-mono tracking-wider uppercase font-bold">
                  Kirana Counter POS
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition hidden md:block"
          >
            <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"} text-xs`}></i>
          </button>

          {/* Mobile Close Drawer Button */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded text-slate-400 hover:text-white"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          )}
        </div>

        {/* Nav Menu Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={collapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed && !isMobileOpen ? "justify-center px-2" : "px-3.5"
                } py-2.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? "bg-[#F5A623] text-slate-950 font-black shadow"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <i className={`${item.iconClass} text-base w-5 text-center ${isActive ? "text-slate-950" : "text-[#F5A623]"}`}></i>
                {(!collapsed || isMobileOpen) && (
                  <div className="ml-3 flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-slate-950/20 text-slate-950"
                            : item.badgeColor || "bg-white/10 text-slate-300"
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
        {(!collapsed || isMobileOpen) && (
          <div className="p-3 m-3 rounded-lg bg-slate-950/50 border border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-black font-display text-[#F5A623]">
              <i className="fa-solid fa-[#1FAA59] fa-store"></i>
              <span>Kirana Store Edition</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              Billing · Barcode · Khata · GST
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
