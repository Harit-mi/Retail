import React from "react";
import { useStore } from "../context/StoreContext";
import { VERTICAL_DEFINITIONS } from "../data/sampleData";
import {
  ShoppingBag,
  Package,
  BookOpen,
  BarChart3,
  Settings,
  Store,
  Layers,
  RotateCcw,
  Tag,
} from "lucide-react";

export const Navbar = () => {
  const {
    storeConfig,
    setStoreConfig,
    activeTab,
    setActiveTab,
    activeVertical,
    setActiveVertical,
    resetDemoData,
    products,
  } = useStore();

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const navItems = [
    { id: "pos", label: "Counter POS", icon: ShoppingBag, badge: null },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    { id: "khata", label: "Udhar Book", icon: BookOpen, badge: "Khata" },
    { id: "modules", label: "Vertical Modules", icon: Layers, badge: "7 Modules" },
    { id: "reports", label: "Reports & GST", icon: BarChart3, badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Dukaan<span className="text-emerald-400">POS</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Multi-Vertical
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {storeConfig.name}
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                        item.badgeColor ||
                        "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons: Vertical Selector & Reset Demo */}
          <div className="flex items-center space-x-2">
            <select
              value={activeVertical}
              onChange={(e) => setActiveVertical(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
            >
              {VERTICAL_DEFINITIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  Store: {v.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (window.confirm("Reset all store data to default multi-vertical sample data?")) {
                  resetDemoData();
                }
              }}
              title="Reset Sample Demo Data"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
