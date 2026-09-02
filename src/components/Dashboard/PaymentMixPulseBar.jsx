import React from "react";
import { useStore } from "../../context/useStore";
// Simple payment breakdown pulse bar component

export const PaymentMixPulseBar = () => {
  const { sales } = useStore();

  // Calculate today's sales breakdown by payment mode
  const totals = sales.reduce(
    (acc, s) => {
      const mode = (s.paymentMode || "cash").toLowerCase();
      const amount = s.grandTotal || 0;
      if (mode === "upi") acc.upi += amount;
      else if (mode === "card") acc.card += amount;
      else if (mode === "udhar" || mode === "credit") acc.udhar += amount;
      else acc.cash += amount;
      acc.total += amount;
      return acc;
    },
    { cash: 0, upi: 0, card: 0, udhar: 0, total: 0 }
  );

  const grandTotal = totals.total || 1; // Prevent div by zero
  const cashPct = Math.round((totals.cash / grandTotal) * 100);
  const upiPct = Math.round((totals.upi / grandTotal) * 100);
  const cardPct = Math.round((totals.card / grandTotal) * 100);
  const udharPct = Math.max(0, 100 - (cashPct + upiPct + cardPct));

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-2 sticky top-16 z-20 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Title Badge */}
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-800 text-[11px] tracking-wide uppercase font-display">
            Live Payment Mix Pulse
          </span>
          <span className="text-[10px] text-slate-400">
            Total Today: <strong className="font-mono text-slate-900">₹{totals.total.toLocaleString("en-IN")}</strong>
          </span>
        </div>

        {/* Pulse Bar Segments */}
        <div className="flex-1 w-full max-w-md mx-2">
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/80 shadow-inner">
            <div
              style={{ width: `${cashPct}%` }}
              title={`Cash: ₹${totals.cash} (${cashPct}%)`}
              className="h-full bg-[#1FAA59] rounded-l-full pulse-bar-segment"
            />
            <div
              style={{ width: `${upiPct}%` }}
              title={`UPI: ₹${totals.upi} (${upiPct}%)`}
              className="h-full bg-[#0EA5A5] pulse-bar-segment"
            />
            <div
              style={{ width: `${cardPct}%` }}
              title={`Card: ₹${totals.card} (${cardPct}%)`}
              className="h-full bg-blue-500 pulse-bar-segment"
            />
            <div
              style={{ width: `${udharPct}%` }}
              title={`Udhaar: ₹${totals.udhar} (${udharPct}%)`}
              className="h-full bg-[#F5A623] rounded-r-full pulse-bar-segment"
            />
          </div>
        </div>

        {/* Legend Values */}
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600 overflow-x-auto">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#1FAA59]" />
            <span>Cash:</span>
            <strong className="font-mono text-slate-900">{cashPct}%</strong>
          </span>

          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#0EA5A5]" />
            <span>UPI:</span>
            <strong className="font-mono text-slate-900">{upiPct}%</strong>
          </span>

          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Card:</span>
            <strong className="font-mono text-slate-900">{cardPct}%</strong>
          </span>

          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
            <span>Udhaar:</span>
            <strong className="font-mono text-slate-900">{udharPct}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
