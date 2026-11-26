import React, { useState } from "react";
import { useStore } from "../context/useStore";
import {
  ShoppingBag,
  LayoutDashboard,
  Boxes,
  Truck,
  Barcode,
  BookOpen,
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
          badgeColor: "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700",
        },
        { id: "suppliers", label: "Suppliers & POs", icon: Truck, badge: null },
        { id: "barcodes", label: "Barcode Printing", icon: Barcode, badge: null },
      ],
    },
    {
      title: "Customers & Khata",
      items: [
        {
          id: "khata",
          label: "Udhaar Khata",
          icon: BookOpen,
          badge: udharCount > 0 ? `${udharCount} due` : null,
          badgeColor: "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700",
        },
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
        className={`bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 min-h-screen flex flex-col transition-all duration-200 border-r border-zinc-200 dark:border-zinc-800 shadow-xs z-50 select-none ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 w-64 translate-x-0 bg-white dark:bg-[#09090B]"
            : "hidden md:flex " + (collapsed ? "w-[72px]" : "w-64")
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 shrink-0 shadow-2xs">
              <Store className="w-4 h-4" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="leading-tight">
                <span className="font-bold text-sm font-display text-zinc-950 dark:text-zinc-50 tracking-tight block">
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

        {/* Navigation Sections — Granularly filtered based on User Panel Permissions */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navGroups
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => hasPanelAccess(item.id)),
            }))
            .filter((group) => group.items.length > 0)
            .map((group, gIdx) => (
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
                          ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? "text-white dark:text-zinc-950" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
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

        {/* Sidebar Footer with Logged In User Profile & Quick Lock */}
        {(!collapsed || isMobileOpen) && (
          <div className="p-3 m-3 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-600 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {currentUser?.name?.charAt(0) || "U"}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-zinc-900 text-xs truncate leading-tight">
                    {currentUser?.name || "Cashier"}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate leading-none">
                    @{currentUser?.username || "user"}
                  </div>
                </div>
              </div>

              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                currentUser?.role === "admin"
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-zinc-100 text-zinc-700 border border-zinc-200"
              }`}>
                {currentUser?.role === "admin" ? "👑 Admin" : "User"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => lockCounter()}
                title="Lock Register / Switch Operator"
                className="flex-1 py-1.5 px-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center"
              >
                Switch / Lock
              </button>

              <button
                type="button"
                onClick={() => handleNavClick("landing")}
                title="Back to Storefront"
                className="py-1.5 px-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-[11px] transition-colors cursor-pointer"
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
