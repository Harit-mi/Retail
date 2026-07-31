import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { VERTICAL_DEFINITIONS } from "../data/sampleData";

export const Navbar = () => {
  const {
    storeConfig,
    activeVertical,
    setActiveVertical,
    resetDemoData,
    products,
    customers,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  ).length;

  const overdueUdharCount = customers.filter((c) => c.balance > 0).length;
  const totalAlerts = lowStockCount + overdueUdharCount;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 card-shadow h-16 flex items-center px-4 sm:px-6">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
        {/* Left: Store Selector with FontAwesome Icon */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <i className="fa-solid fa-shop text-[#1E3A5F] text-xs"></i>
            <select
              value={activeVertical}
              onChange={(e) => setActiveVertical(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer pr-1"
            >
              {VERTICAL_DEFINITIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  Store: {v.name}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden sm:inline-block text-xs font-medium text-slate-500 truncate max-w-xs">
            {storeConfig.name}
          </span>
        </div>

        {/* Center: Global Search Bar with FontAwesome Search Symbol */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search billing invoice #, items, customers, barcode... (F2)"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-2 rounded-xl outline-none focus:border-[#1E3A5F] focus:bg-white transition"
          />
        </div>

        {/* Right: FontAwesome Bell Notifications, Reset & Profile */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
            >
              <i className="fa-solid fa-bell text-base"></i>
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E64545] text-white font-bold text-[10px] rounded-full flex items-center justify-center font-mono">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Popup Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fade-in text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 font-display">
                    Store Notifications
                  </h4>
                  <span className="text-[10px] bg-red-50 text-[#E64545] px-1.5 py-0.5 rounded font-bold">
                    {totalAlerts} Alerts
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2 text-amber-900">
                      <i className="fa-solid fa-triangle-exclamation text-amber-600 text-xs mt-0.5"></i>
                      <div>
                        <p className="font-bold text-[11px]">Low Stock Alert</p>
                        <p className="text-[10px] text-amber-700">
                          {lowStockCount} items below minimum warning threshold.
                        </p>
                      </div>
                    </div>
                  )}

                  {overdueUdharCount > 0 && (
                    <div className="p-2 bg-red-50 rounded-xl border border-red-200 flex items-start space-x-2 text-red-900">
                      <i className="fa-solid fa-book-bookmark text-[#E64545] text-xs mt-0.5"></i>
                      <div>
                        <p className="font-bold text-[11px]">Overdue Udhaar</p>
                        <p className="text-[10px] text-red-700">
                          {overdueUdharCount} customers have pending ledger balance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm("Reset all store data to default multi-vertical sample data?")) {
                resetDemoData();
              }
            }}
            title="Reset Sample Demo Data"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <i className="fa-solid fa-rotate-left text-sm"></i>
          </button>

          {/* Owner Profile Badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                {storeConfig.ownerName || "Rajesh Gupta"}
              </span>
              <span className="block text-[10px] text-emerald-600 font-semibold">
                ● Shift Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
