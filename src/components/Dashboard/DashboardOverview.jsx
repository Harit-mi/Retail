import React from "react";
import { useStore } from "../../context/useStore";
import {
  IndianRupee,
  Receipt,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
} from "lucide-react";

export const DashboardOverview = () => {
  const {
    sales,
    products,
    customers,
    setPrintableBill,
    setPrintFormat,
    setActiveTab,
    t,
  } = useStore();

  const todaySalesTotal = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalOrdersCount = sales.length;
  const totalUdharOutstanding = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const lowStockProducts = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  );

  // Compute live tender breakdown across today's sales
  const tenderBreakdown = sales.reduce(
    (acc, s) => {
      const mode = s.paymentMode || "cash";
      acc[mode] = (acc[mode] || 0) + (s.grandTotal || 0);
      return acc;
    },
    { upi: 0, cash: 0, card: 0, udhar: 0 }
  );

  const upiPct = todaySalesTotal > 0 ? Math.round((tenderBreakdown.upi / todaySalesTotal) * 100) : 0;
  const cashPct = todaySalesTotal > 0 ? Math.round((tenderBreakdown.cash / todaySalesTotal) * 100) : 0;
  const cardPct = todaySalesTotal > 0 ? Math.round((tenderBreakdown.card / todaySalesTotal) * 100) : 0;
  const udharPct = todaySalesTotal > 0 ? Math.round((tenderBreakdown.udhar / todaySalesTotal) * 100) : 0;

  const handlePrint = (bill, format) => {
    setPrintableBill(bill);
    setPrintFormat(format);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-900">
      {/* 1. FINANCIAL KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Gross Revenue */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              {t("todayRevenue")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-zinc-950 tracking-tight tabular-nums">
              ₹{todaySalesTotal.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1.5 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders Processed */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              {t("ordersProcessed")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-zinc-950 tracking-tight tabular-nums">
              {totalOrdersCount}
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono mt-1.5">
              <span>Avg Ticket:</span>
              <strong className="text-zinc-900 font-semibold">
                ₹{totalOrdersCount > 0 ? Math.round(todaySalesTotal / totalOrdersCount).toLocaleString("en-IN") : "0"}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Udhaar Dues Outstanding */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              {t("udharDuesBalance")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-zinc-950 tracking-tight tabular-nums">
              ₹{totalUdharOutstanding.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mt-1.5">
              <span className="font-mono text-[11px]">{customers.filter((c) => (c.balance || 0) > 0).length} accounts due</span>
              <button
                type="button"
                onClick={() => setActiveTab("khata")}
                className="text-zinc-900 font-medium hover:underline text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                <span>Khata</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Warnings */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              {t("lowStockWarnings")}
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-zinc-950 tracking-tight tabular-nums">
              {lowStockProducts.length} <span className="text-sm font-sans font-normal text-zinc-400">items</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mt-1.5">
              <span className="text-[11px]">Refill required</span>
              <button
                type="button"
                onClick={() => setActiveTab("inventory")}
                className="text-zinc-900 font-medium hover:underline text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                <span>Inventory</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVE TENDER GAUGES & SALES VELOCITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-950 font-display">
                Sales Velocity & Volume (Today)
              </h3>
              <p className="text-xs text-zinc-400 font-mono">Hourly counter traffic in ₹</p>
            </div>

            <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Peak: 11:00 AM – 1:00 PM
            </span>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {[
              { time: "9 AM", val: 1200, height: "25%" },
              { time: "11 AM", val: 4500, height: "65%" },
              { time: "1 PM", val: 6800, height: "92%" },
              { time: "3 PM", val: 3200, height: "48%" },
              { time: "5 PM", val: 5100, height: "72%" },
              { time: "7 PM", val: 8200, height: "100%" },
              { time: "9 PM", val: 2400, height: "35%" },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                <div className="text-[10px] font-mono font-medium text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                  ₹{bar.val}
                </div>
                <div
                  style={{ height: bar.height }}
                  className="w-full bg-zinc-900 rounded-t transition-all duration-200 group-hover:bg-zinc-700 cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400 font-mono mt-2">{bar.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Till Tender Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-4">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-950 font-display">
                Till Tender Split
              </h3>
              <p className="text-xs text-zinc-400 font-mono">Real-time payment breakdown</p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Total ₹{todaySalesTotal.toLocaleString("en-IN")}</span>
          </div>

          {/* Stacked percentage progress bar */}
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/80">
            {cashPct > 0 && (
              <div style={{ width: `${cashPct}%` }} title={`Cash: ${cashPct}%`} className="bg-zinc-950 h-full"></div>
            )}
            {upiPct > 0 && (
              <div style={{ width: `${upiPct}%` }} title={`UPI: ${upiPct}%`} className="bg-emerald-600 h-full"></div>
            )}
            {cardPct > 0 && (
              <div style={{ width: `${cardPct}%` }} title={`Card: ${cardPct}%`} className="bg-zinc-400 h-full"></div>
            )}
            {udharPct > 0 && (
              <div style={{ width: `${udharPct}%` }} title={`Udhaar: ${udharPct}%`} className="bg-amber-500 h-full"></div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Cash Tile */}
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-zinc-700" />
                <div>
                  <span className="text-xs font-semibold text-zinc-900 block">Cash</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ₹{tenderBreakdown.cash.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-950">{cashPct}%</span>
            </div>

            {/* UPI Tile */}
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-semibold text-zinc-900 block">UPI</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ₹{tenderBreakdown.upi.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700">{upiPct}%</span>
            </div>

            {/* Card Tile */}
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="text-xs font-semibold text-zinc-900 block">Card</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ₹{tenderBreakdown.card.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-700">{cardPct}%</span>
            </div>

            {/* Udhaar Tile */}
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-xs font-semibold text-zinc-900 block">Udhaar</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ₹{tenderBreakdown.udhar.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700">{udharPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT BILLING TRANSACTIONS & STOCK WATCHLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Billing Transactions Table */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-950 font-display">
                Recent Invoices
              </h3>
              <p className="text-xs text-zinc-400 font-mono">Live counter sales ledger</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("reports")}
              className="text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 text-zinc-500 uppercase font-mono font-semibold text-[10px] border-y border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Tender</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-zinc-400 font-mono text-xs">
                      No sales recorded today yet.
                    </td>
                  </tr>
                ) : (
                  sales.slice(0, 7).map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-950">
                        {s.id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900">
                        {s.customerName}
                      </td>
                      <td className="py-2.5 px-3">
                        {s.isUdhaarSettlement ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 font-mono">
                            <span>✓ Khata Repay</span>
                          </span>
                        ) : s.paymentMode === "udhar" ? (
                          s.dueAmount > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-800 border border-red-200 inline-flex items-center gap-1 font-mono">
                              <span>Udhaar Unpaid</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 font-mono">
                              <span>Settled ✓</span>
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {s.paymentMode}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-mono font-bold block ${s.isUdhaarSettlement ? "text-emerald-700" : "text-zinc-950"}`}>
                          ₹{s.grandTotal.toLocaleString("en-IN")}
                        </span>
                        {s.paymentMode === "udhar" && s.dueAmount > 0 && (
                          <span className="text-[10px] font-mono font-semibold text-red-600 block">
                            Due: ₹{s.dueAmount}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handlePrint(s, "thermal")}
                          title="Print 80mm Thermal Receipt"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors inline-flex items-center cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Urgent Low Stock Watchlist */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-zinc-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-bold text-sm text-zinc-950 font-display flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{t("lowStockWarnings")}</span>
            </h3>
            <span className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-mono font-semibold border border-zinc-200">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 font-mono text-xs">
                All inventory levels are healthy!
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <h5 className="font-semibold text-zinc-900 truncate">{p.name}</h5>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Category: {p.category}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-amber-700 block">
                      {p.stock} {p.unit} left
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">
                      Min: {p.minStockWarning || 5}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
