import React, { useState } from "react";
import { useStore } from "../context/useStore";
import {
  ShoppingBag,
  LayoutDashboard,
  Boxes,
  Truck,
  Barcode,
  BookOpen,
  MessageSquare,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
  Store,
  Globe,
} from "lucide-react";

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, products, customers, t } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const udharCount = customers.filter((c) => c.balance > 0).length;

  const navGroups = [
    {
      title: "Billing & Counter",
      items: [
        { id: "pos", label: "Billing Register", icon: ShoppingBag, badge: "F8" },
        { id: "dashboard", label: "Till Overview", icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: "Inventory & Supply",
      items: [
        {
          id: "inventory",
          label: "Products & Stock",
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
          badgeColor: "bg-amber-100 text-amber-900 border border-amber-200",
        },
        { id: "suppliers", label: "Suppliers & POs", icon: Truck, badge: null },
        { id: "barcodes", label: "Barcode Printing", icon: Barcode, badge: null },
      ],
    },
    {
      title: "Customers & Growth",
      items: [
        {
          id: "khata",
          label: "Udhaar & Loyalty",
          icon: BookOpen,
          badge: udharCount > 0 ? `${udharCount} due` : null,
          badgeColor: "bg-red-100 text-red-900 border border-red-200",
        },
        { id: "whatsapp", label: "WhatsApp Marketing", icon: MessageSquare, badge: null },
        { id: "modules", label: "Specialty Verticals", icon: Layers, badge: "Multi" },
      ],
    },
    {
      title: "Compliance & Store",
      items: [
        { id: "reports", label: t("reports") || "GST Reports", icon: FileSpreadsheet, badge: "GSTR" },
        { id: "security", label: "Security & DPDP", icon: ShieldCheck, badge: "DPDP" },
        { id: "settings", label: t("settings") || "Settings", icon: Sliders, badge: null },
      ],
    },
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
          className="md:hidden fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs animate-fade-in"
        />
      )}

      {/* Main Responsive Sidebar Drawer */}
      <aside
        className={`bg-[#FAFAF9] text-zinc-900 min-h-screen flex flex-col transition-all duration-200 border-r border-zinc-200/80 shadow-xs z-50 select-none ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 w-64 translate-x-0 bg-white"
            : "hidden md:flex " + (collapsed ? "w-[72px]" : "w-64")
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-200/80 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Store className="w-4 h-4" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="leading-tight">
                <span className="font-bold text-sm font-display text-zinc-950 tracking-tight block">
                  DUKAAN<span className="text-zinc-400 font-normal">POS</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-semibold block">
                  Retail Edition
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition hidden md:flex items-center justify-center cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Drawer Button */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              aria-label="Close mobile navigation"
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {(!collapsed || isMobileOpen) && (
                <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={collapsed && !isMobileOpen ? item.label : undefined}
                    className={`w-full flex items-center ${
                      collapsed && !isMobileOpen ? "justify-center px-2" : "px-3"
                    } py-2 rounded-lg text-xs font-medium transition-colors relative group cursor-pointer ${
                      isActive
                        ? "bg-zinc-950 text-white font-semibold shadow-xs"
                        : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-950"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-800"
                      }`}
                    />

                    {(!collapsed || isMobileOpen) && (
                      <div className="ml-3 flex-1 flex items-center justify-between truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                              isActive
                                ? "bg-white/20 text-white"
                                : item.badgeColor || "bg-zinc-200/80 text-zinc-600 border border-zinc-300/70"
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
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        {(!collapsed || isMobileOpen) && (
          <div className="p-3 m-3 rounded-xl bg-white border border-zinc-200/80 text-xs text-zinc-600 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 text-[11px] font-display">Local Engine</span>
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ready (0ms)
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono mt-1 leading-relaxed">
              AES-256 · DPDP 2023 · ESC/POS
            </p>
            <button
              onClick={() => handleNavClick("landing")}
              className="w-full mt-2.5 flex items-center justify-center gap-2 py-1.5 px-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-zinc-200"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>Back to Storefront</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
