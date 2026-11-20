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
  Lock,
} from "lucide-react";

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    products,
    customers,
    t,
    currentUser,
    hasPanelAccess,
    lockCounter,
  } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const udharCount = customers.filter((c) => c.balance > 0).length;

  const navGroups = [
    {
      title: "Counter & Sales",
      items: [
        { id: "pos", label: "Billing Register", icon: ShoppingBag, badge: "F8" },
        { id: "dashboard", label: "Analytics & Till", icon: LayoutDashboard, badge: null },
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
          badgeColor: "bg-amber-400/20 text-amber-300 border border-amber-400/30",
        },
        { id: "suppliers", label: "Suppliers & POs", icon: Truck, badge: null },
        { id: "barcodes", label: "Barcode Printing", icon: Barcode, badge: "New" },
      ],
    },
    {
      title: "Customers & Khata",
      items: [
        {
          id: "khata",
          label: "Udhaar & Loyalty",
          icon: BookOpen,
          badge: udharCount > 0 ? `${udharCount} due` : null,
          badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
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
          className="md:hidden fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-xs animate-fade-in"
        />
      )}

      {/* Main Responsive Sidebar Drawer — Ronas IT Deep Slate Theme */}
      <aside
        className={`bg-[#0F172A] text-slate-200 min-h-screen flex flex-col transition-all duration-200 border-r border-slate-800/80 shadow-xl z-50 select-none ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 w-64 translate-x-0"
            : "hidden md:flex " + (collapsed ? "w-[72px]" : "w-64")
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#0B1329]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-900/30">
              <Store className="w-4 h-4" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm font-display text-white tracking-tight flex items-center gap-1">
                  <span>DUKAAN</span>
                  <span className="text-indigo-400 font-mono text-xs">POS</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase font-semibold block">
                  Retail Edition
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden md:flex items-center justify-center cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Drawer Button */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              aria-label="Close mobile navigation"
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {navGroups
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => hasPanelAccess(item.id)),
            }))
            .filter((group) => group.items.length > 0)
            .map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {(!collapsed || isMobileOpen) && (
                  <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
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
                      } py-2.5 rounded-xl text-xs font-medium transition-all relative group cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow-md shadow-indigo-950/40"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
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
                                  : item.badgeColor || "bg-slate-800 text-slate-400 border border-slate-700"
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

        {/* Sidebar Footer with Logged In User Profile & Quick Lock */}
        {(!collapsed || isMobileOpen) && (
          <div className="p-3 m-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-md space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {currentUser?.name?.charAt(0) || "U"}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-white text-xs truncate leading-tight flex items-center gap-1.5">
                    <span>{currentUser?.name || "Cashier"}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate leading-none mt-0.5">
                    @{currentUser?.username || "user"}
                  </div>
                </div>
              </div>

              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                currentUser?.role === "admin"
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                {currentUser?.role === "admin" ? "Admin" : "User"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => lockCounter()}
                title="Lock Register / Switch Operator"
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Switch / Lock</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick("landing")}
                title="Back to Storefront"
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-[11px] transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};