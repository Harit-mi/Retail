import React from "react";
import { useStore } from "../../context/useStore";
import { Sparkles, ArrowRight, PackageCheck } from "lucide-react";

export const AIDemandForecastingCard = () => {
  const { products, sales } = useStore();

  const lowStockItems = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5)
  );

  // Calculate actual sales velocity across a strict rolling 7-day window
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const rollingSevenDaySales = sales.filter((s) => {
    try {
      const time = new Date(s.date).getTime();
      return time >= sevenDaysAgo && time <= now;
    } catch {
      return false;
    }
  });

  const forecastData = lowStockItems.map((p) => {
    // Units sold strictly within the past 7 days
    const unitsSold = rollingSevenDaySales.reduce((acc, s) => {
      const match = (s.items || []).find((item) => item.id === p.id || item.name === p.name);
      return acc + (match ? Number(match.qty) || 0 : 0);
    }, 0);

    const dailyVelocity = Math.round((unitsSold / 7) * 10) / 10;
    const runoutDays = dailyVelocity > 0 ? Math.ceil((p.stock || 0) / dailyVelocity) : null;
    const reorderTarget = Math.max(0, Math.ceil((p.minStockWarning || 5) * 2 - (p.stock || 0)));

    let velocityLabel = "No recent sales (7d)";
    if (dailyVelocity >= 4) velocityLabel = "Very High (Peak Demand)";
    else if (dailyVelocity >= 1.5) velocityLabel = "High (Active Demand)";
    else if (dailyVelocity > 0) velocityLabel = "Moderate (Regular Demand)";

    return {
      ...p,
      dailyVelocity,
      predictedRunoutDays: runoutDays,
      recommendedOrderQty: reorderTarget,
      demandVelocity: velocityLabel,
    };
  });

  if (forecastData.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black font-display text-emerald-950">
              Inventory Buffer Status: Optimal
            </h4>
            <p className="text-[11px] text-emerald-700 font-mono">
              All Kirana catalog items meet minimum stock warning thresholds.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-emerald-200/60 text-emerald-900 px-2.5 py-1 rounded">
          100% Buffered
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#2A2825] text-white rounded-xl p-4 border border-[#E8E3DA]/20 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#C2782A] text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black font-display tracking-tight text-white flex items-center gap-1.5">
              <span>7-Day Sales Velocity & Reorder Heuristic</span>
              <span className="text-[9px] font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                Rule-Based
              </span>
            </h4>
            <p className="text-[10px] text-[#E8E3DA]/80 font-mono">
              Rolling 7-day sales velocity model & purchase order suggestions
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
          {forecastData.length} Low Stock
        </span>
      </div>

      <div className="space-y-2">
        {forecastData.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-white font-display truncate">
                {item.name}
              </div>
              <div className="text-[10px] text-amber-300 font-mono flex items-center gap-2 mt-0.5">
                <span>Stock: {item.stock} {item.unit} left</span>
                <span>•</span>
                <span>
                  {item.predictedRunoutDays !== null
                    ? `Runout in ~${item.predictedRunoutDays} day(s)`
                    : "No sales in 7d"}
                </span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-[11px] font-black font-mono text-emerald-400">
                Reorder +{item.recommendedOrderQty} {item.unit}
              </div>
              <button
                onClick={() => alert(`Created Purchase Order draft for ${item.name} (${item.recommendedOrderQty} ${item.unit})`)}
                className="mt-1 px-2.5 py-1 bg-[#C2782A] hover:bg-[#A8641F] text-white rounded font-bold text-[10px] flex items-center gap-1 ml-auto"
              >
                <span>Draft PO</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
