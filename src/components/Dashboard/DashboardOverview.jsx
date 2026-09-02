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

  const handlePrint = (bill, format) => {
    setPrintableBill(bill);
    setPrintFormat(format);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. KPI CARD ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("todayRevenue")}
            </span>
            <div className="p-2.5 bg-emerald-50 text-[#1FAA59] rounded-xl border border-emerald-100">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              ₹{todaySalesTotal.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center space-x-1 text-xs text-[#1FAA59] font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders Count */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("ordersProcessed")}
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              {totalOrdersCount}
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium mt-1">
              <span>Avg Ticket:</span>
              <strong className="font-mono text-slate-800">
                ₹{totalOrdersCount > 0 ? Math.round(todaySalesTotal / totalOrdersCount) : 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Udhaar Outstanding */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("udharDuesBalance")}
            </span>
            <div className="p-2.5 bg-amber-50 text-[#F5A623] rounded-xl border border-amber-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-[#F5A623] tracking-tight">
              ₹{totalUdharOutstanding.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{customers.filter((c) => c.balance > 0).length} Customers due</span>
              <button
                onClick={() => setActiveTab("khata")}
                className="text-[#1E3A5F] font-bold hover:underline"
              >
                View Khata →
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("lowStockWarnings")}
            </span>
            <div className="p-2.5 bg-red-50 text-[#E64545] rounded-xl border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-[#E64545] tracking-tight">
              {lowStockProducts.length} Items
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Requires refill</span>
              <button
                onClick={() => setActiveTab("inventory")}
                className="text-[#1E3A5F] font-bold hover:underline"
              >
                Stock List →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN CHART ZONE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-sm">
                Sales Revenue Trend (Today)
              </h3>
              <p className="text-xs text-slate-400">Hourly billing volume in ₹</p>
            </div>

            <span className="text-xs bg-emerald-50 text-[#1FAA59] font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
              Peak Hours: 11:00 AM - 1:00 PM
            </span>
          </div>

          <div className="h-48 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {[
              { time: "9 AM", val: 1200, height: "30%" },
              { time: "11 AM", val: 4500, height: "70%" },
              { time: "1 PM", val: 6800, height: "95%" },
              { time: "3 PM", val: 3200, height: "50%" },
              { time: "5 PM", val: 5100, height: "75%" },
              { time: "7 PM", val: 8200, height: "100%" },
              { time: "9 PM", val: 2400, height: "40%" },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition mb-1">
                  ₹{bar.val}
                </div>
                <div
                  style={{ height: bar.height }}
                  className="w-full bg-gradient-to-t from-[#1E3A5F] to-teal-500 rounded-t-lg transition-all duration-300 group-hover:from-[#F5A623] group-hover:to-amber-400"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-2">{bar.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 card-shadow space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold font-display text-slate-900 text-sm">
              Top Selling Categories
            </h3>
            <p className="text-xs text-slate-400">Revenue split across store departments</p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Edible Oils & FMCG", pct: "42%", color: "bg-[#1FAA59]" },
              { label: "Atta, Rice & Pulses", pct: "28%", color: "bg-[#0EA5A5]" },
              { label: "Apparel & Menswear", pct: "18%", color: "bg-blue-500" },
              { label: "Dairy & Snacks", pct: "12%", color: "bg-[#F5A623]" },
            ].map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{cat.label}</span>
                  <span className="font-mono font-bold text-slate-900">{cat.pct}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: cat.pct }} className={`h-full ${cat.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold font-display text-slate-900 text-sm">
              Recent Billing Transactions
            </h3>
            <button
              onClick={() => setActiveTab("reports")}
              className="text-xs font-bold text-[#1E3A5F] hover:underline flex items-center"
            >
              <span>All Reports</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1E3A5F]">
                      {s.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {s.customerName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.paymentMode === "upi"
                            ? "bg-teal-50 text-[#0EA5A5]"
                            : s.paymentMode === "cash"
                            ? "bg-emerald-50 text-[#1FAA59]"
                            : s.paymentMode === "udhar"
                            ? "bg-amber-50 text-[#F5A623]"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {s.paymentMode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{s.grandTotal}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handlePrint(s, "thermal")}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold font-display text-slate-900 text-sm flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-[#E64545]" />
              <span>{t("lowStockWarnings")}</span>
            </h3>
            <span className="text-[10px] bg-red-50 text-[#E64545] px-2 py-0.5 rounded-full font-bold">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl border border-red-100 bg-red-50/40 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-slate-900">{p.name}</h5>
                  <p className="text-[10px] text-slate-500">
                    Category: {p.category}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-[#E64545]">
                    {p.stock} {p.unit} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
