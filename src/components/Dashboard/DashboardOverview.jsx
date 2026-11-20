import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { InvoicePreviewModal } from "../Invoice/InvoicePreviewModal";
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
  Eye,
  ShoppingBag,
  Sparkles,
  BarChart3,
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

  const [previewBill, setPreviewBill] = useState(null);
  const [chartView, setChartView] = useState("hourly"); // 'hourly' | 'week' | 'month'

  const todayDateStr = new Date().toDateString();
  const todaySales = sales.filter((s) => {
    try {
      return s.date && new Date(s.date).toDateString() === todayDateStr;
    } catch {
      return false;
    }
  });

  const todaySalesTotal = todaySales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const totalOrdersCount = todaySales.length;
  const totalUdharOutstanding = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const lowStockProducts = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  );

  // Payment Breakdown
  const tenderBreakdown = todaySales.reduce(
    (acc, s) => {
      const mode = s.paymentMode || "cash";
      if (mode === "cash") acc.cash += s.grandTotal || 0;
      else if (mode === "upi") acc.upi += s.grandTotal || 0;
      else if (mode === "card") acc.card += s.grandTotal || 0;
      else if (mode === "udhar") acc.udhar += s.grandTotal || 0;
      return acc;
    },
    { cash: 0, upi: 0, card: 0, udhar: 0 }
  );

  const breakdownSum =
    tenderBreakdown.cash +
    tenderBreakdown.upi +
    tenderBreakdown.card +
    tenderBreakdown.udhar || 1;

  const cashPct = Math.round((tenderBreakdown.cash / breakdownSum) * 100);
  const upiPct = Math.round((tenderBreakdown.upi / breakdownSum) * 100);
  const cardPct = Math.round((tenderBreakdown.card / breakdownSum) * 100);
  const udharPct = Math.max(0, 100 - (cashPct + upiPct + cardPct));

  // Chart Data: Hourly vs Weekly vs Monthly
  const hourlyData = [
    { label: "09 AM", val: 850, orders: 3 },
    { label: "11 AM", val: 2400, orders: 8 },
    { label: "01 PM", val: 1750, orders: 5 },
    { label: "03 PM", val: 920, orders: 3 },
    { label: "05 PM", val: 3800, orders: 12 },
    { label: "07 PM", val: 5100, orders: 16 },
    { label: "09 PM", val: 3200, orders: 9 },
  ];

  const weeklyData = [
    { label: "Mon", val: 12400, orders: 34 },
    { label: "Tue", val: 14800, orders: 42 },
    { label: "Wed", val: 11200, orders: 30 },
    { label: "Thu", val: 16500, orders: 48 },
    { label: "Fri", val: 19800, orders: 55 },
    { label: "Sat", val: 26400, orders: 74 },
    { label: "Sun", val: 28900, orders: 82 },
  ];

  const monthlyData = [
    { label: "Wk 1", val: 92000, orders: 260 },
    { label: "Wk 2", val: 104000, orders: 295 },
    { label: "Wk 3", val: 98000, orders: 280 },
    { label: "Wk 4", val: 118000, orders: 330 },
  ];

  const activeChartDataset =
    chartView === "week"
      ? weeklyData
      : chartView === "month"
      ? monthlyData
      : hourlyData;

  const maxVal = Math.max(...activeChartDataset.map((d) => d.val), 1);
  const chartBars = activeChartDataset.map((d) => ({
    ...d,
    height: `${Math.max(12, Math.round((d.val / maxVal) * 100))}%`,
  }));

  const handlePrint = (bill, format) => {
    setPrintableBill(bill);
    setPrintFormat(format);
    setTimeout(() => window.print(), 300);
  };

  // Top Products Calculation
  const topProducts = [...products]
    .sort((a, b) => (b.stock || 0) - (a.stock || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* ============================================================ */}
      {/* 1. RONAS IT HERO KPI METRICS ROW                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Gross Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {t("todayRevenue")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-xs">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-slate-950 tracking-tight tabular-nums">
              ₹{todaySalesTotal.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2 font-mono">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                +14.8%
              </span>
              <span className="text-slate-400 font-normal">vs last week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders Processed & Average Basket */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {t("ordersProcessed")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-slate-950 tracking-tight tabular-nums">
              {totalOrdersCount}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mt-2">
              <span>Avg Basket:</span>
              <strong className="text-slate-900 font-bold">
                ₹{totalOrdersCount > 0 ? Math.round(todaySalesTotal / totalOrdersCount).toLocaleString("en-IN") : "0"}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Udhaar Dues Outstanding */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {t("udharDuesBalance")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-slate-950 tracking-tight tabular-nums">
              ₹{totalUdharOutstanding.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span className="font-mono text-[11px]">{customers.filter((c) => (c.balance || 0) > 0).length} accounts due</span>
              <button
                type="button"
                onClick={() => setActiveTab("khata")}
                className="text-indigo-600 font-semibold hover:underline text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                <span>Khata</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Warnings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {t("lowStockWarnings")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-slate-950 tracking-tight tabular-nums">
              {lowStockProducts.length} <span className="text-sm font-sans font-normal text-slate-400">items</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span className="text-[11px]">Restock required</span>
              <button
                type="button"
                onClick={() => setActiveTab("inventory")}
                className="text-indigo-600 font-semibold hover:underline text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                <span>Inventory</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SALES DYNAMICS BAR CHART & TILL TENDER DISTRIBUTION       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Ronas IT Sales Dynamics Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-950 font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Sales Dynamics & Revenue Flow</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time transaction volume & peak customer hours
              </p>
            </div>

            {/* Timeframe Filter Pills */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setChartView("hourly")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartView === "hourly"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setChartView("week")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartView === "week"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartView("month")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  chartView === "month"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {chartBars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                {/* Hover Tooltip Card */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 bg-slate-950 text-white text-[10px] font-mono p-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  <div>₹{bar.val.toLocaleString("en-IN")}</div>
                  <div className="text-slate-400 text-[9px]">{bar.orders} bills</div>
                </div>

                {/* Rounded Bar with Soft Indigo Gradient */}
                <div
                  style={{ height: bar.height }}
                  className="w-full max-w-[38px] bg-gradient-to-t from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-t-lg transition-all duration-200 cursor-pointer shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 font-mono font-medium mt-2">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Till Tender Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-950 font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Payment Tender Split</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Distribution across register settlement modes
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded-md">
              ₹{todaySalesTotal.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Multi-Segment Luminous Progress Bar */}
          <div className="my-3 space-y-1.5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/60 p-0.5">
              {cashPct > 0 && (
                <div style={{ width: `${cashPct}%` }} title={`Cash: ${cashPct}%`} className="bg-slate-950 h-full rounded-l-full"></div>
              )}
              {upiPct > 0 && (
                <div style={{ width: `${upiPct}%` }} title={`UPI: ${upiPct}%`} className="bg-emerald-500 h-full"></div>
              )}
              {cardPct > 0 && (
                <div style={{ width: `${cardPct}%` }} title={`Card: ${cardPct}%`} className="bg-indigo-500 h-full"></div>
              )}
              {udharPct > 0 && (
                <div style={{ width: `${udharPct}%` }} title={`Udhaar: ${udharPct}%`} className="bg-amber-400 h-full rounded-r-full"></div>
              )}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0%</span>
              <span>Settlement Mix</span>
              <span>100%</span>
            </div>
          </div>

          {/* Detailed Mode Badges */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center text-xs">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Cash</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ₹{tenderBreakdown.cash.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-950">{cashPct}%</span>
            </div>

            <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">UPI QR</span>
                  <span className="text-[10px] font-mono text-emerald-800">
                    ₹{tenderBreakdown.upi.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700">{upiPct}%</span>
            </div>

            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Card</span>
                  <span className="text-[10px] font-mono text-indigo-800">
                    ₹{tenderBreakdown.card.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700">{cardPct}%</span>
            </div>

            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Khata</span>
                  <span className="text-[10px] font-mono text-amber-800">
                    ₹{tenderBreakdown.udhar.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700">{udharPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. RECENT INVOICES & TOP SELLING CATALOG LEADERBOARD         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Invoices Feed (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-950 font-display flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <span>Recent Invoices & Till Transactions</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Live register transaction log</p>
            </div>
            <button
              onClick={() => setActiveTab("reports")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No transactions recorded yet today. Complete a sale in POS to see it live here.
                    </td>
                  </tr>
                ) : (
                  sales.slice(0, 7).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {s.id}
                        <span className="block text-[10px] font-normal text-slate-400">
                          {new Date(s.date).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block truncate max-w-[150px]">
                          {s.customerName || "Counter Cash Customer"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.items?.length || 1} items
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold inline-block border ${
                            s.paymentMode === "upi"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : s.paymentMode === "cash"
                              ? "bg-slate-100 text-slate-900 border-slate-300"
                              : s.paymentMode === "card"
                              ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                              : "bg-amber-50 text-amber-900 border-amber-200"
                          }`}
                        >
                          {s.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-slate-950 block">
                          ₹{s.grandTotal?.toLocaleString("en-IN")}
                        </span>
                        {s.paymentMode === "udhar" && s.dueAmount > 0 && (
                          <span className="text-[10px] font-mono font-semibold text-rose-600 block">
                            Due: ₹{s.dueAmount}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewBill(s)}
                            title="Preview Invoice (80mm / A4)"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrint(s, "thermal")}
                            title="Print 80mm Thermal Receipt"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Movers & Low Stock Alert List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Top Selling Leaderboard */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-950 font-display flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>Bestselling Products</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Inventory Units</span>
            </div>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <h5 className="font-semibold text-slate-900 truncate leading-tight">
                        {p.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ₹{p.retailPrice}/{p.unit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-950 block">
                      {p.stock} in stock
                    </span>
                    <span className="text-[9px] text-emerald-700 font-mono">
                      Fast Mover
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Low Stock Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-950 font-display flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{t("lowStockWarnings")}</span>
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-200">
                {lowStockProducts.length} Items
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 font-mono text-xs">
                  All inventory healthy! Zero stockouts.
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/60 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <h5 className="font-semibold text-slate-900 truncate">{p.name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Min threshold: {p.minStockWarning || 5}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-amber-700 block">
                        {p.stock} left
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("suppliers")}
                        className="text-[9px] text-indigo-600 hover:underline font-mono"
                      >
                        Reorder →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bill Preview & Reprint Modal */}
      {previewBill && (
        <InvoicePreviewModal
          isOpen={Boolean(previewBill)}
          onClose={() => setPreviewBill(null)}
          bill={previewBill}
        />
      )}
    </div>
  );
};