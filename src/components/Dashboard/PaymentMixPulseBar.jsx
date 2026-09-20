import React from "react";
import { useStore } from "../../context/useStore";

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
    <div className="bg-[#FAFAF9]/90 backdrop-blur-md border-b border-zinc-200/80 px-4 py-2 sticky top-16 z-20 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Title Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
            Payment Mix
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            Total Today: <strong className="font-mono text-zinc-950 font-semibold">₹{totals.total.toLocaleString("en-IN")}</strong>
          </span>
        </div>

        {/* Pulse Bar Segments */}
        <div className="flex-1 w-full max-w-md mx-2">
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/80">
            <div
              style={{ width: `${cashPct}%` }}
              title={`Cash: ₹${totals.cash} (${cashPct}%)`}
              className="h-full bg-zinc-950 transition-all duration-300"
            />
            <div
              style={{ width: `${upiPct}%` }}
              title={`UPI: ₹${totals.upi} (${upiPct}%)`}
              className="h-full bg-emerald-600 transition-all duration-300"
            />
            <div
              style={{ width: `${cardPct}%` }}
              title={`Card: ₹${totals.card} (${cardPct}%)`}
              className="h-full bg-zinc-400 transition-all duration-300"
            />
            <div
              style={{ width: `${udharPct}%` }}
              title={`Udhaar: ₹${totals.udhar} (${udharPct}%)`}
              className="h-full bg-amber-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Legend Values */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-500 overflow-x-auto shrink-0">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
            <span>Cash:</span>
            <strong className="text-zinc-900 font-semibold">{cashPct}%</strong>
          </span>

          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>UPI:</span>
            <strong className="text-zinc-900 font-semibold">{upiPct}%</strong>
          </span>

          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>Card:</span>
            <strong className="text-zinc-900 font-semibold">{cardPct}%</strong>
          </span>

          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Udhaar:</span>
            <strong className="text-zinc-900 font-semibold">{udharPct}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
