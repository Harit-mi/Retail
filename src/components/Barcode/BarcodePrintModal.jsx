import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Printer, X, Tag, Check, LayoutGrid } from "lucide-react";

export const BarcodePrintModal = () => {
  const { products, storeConfig } = useStore();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [labelCount, setLabelCount] = useState(12);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-solid fa-barcode text-[#1E3A5F]"></i>
            <span>Kirana Barcode Label Generator & Printer</span>
          </h2>
          <p className="text-xs text-slate-500">
            Print EAN-13 barcode price stickers for loose pulses, sugar, dry fruits & local Kirana packs
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-md transition"
        >
          <Printer className="w-4 h-4 text-[#F5A623]" />
          <span>Print Sticker Sheet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Options Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm font-display border-b border-slate-100 pb-2">
            Select Product & Sticker Quantity
          </h3>

          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">
              Select Kirana Item
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.retailPrice} (Barcode: {p.barcode || "Auto-Gen"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Stickers Quantity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={labelCount}
                onChange={(e) => setLabelCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Paper Grid Format
              </label>
              <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none">
                <option value="24">A4 (24 Stickers / Sheet)</option>
                <option value="40">A4 (40 Stickers / Sheet)</option>
                <option value="single">Barcode Thermal Roll (50mm)</option>
              </select>
            </div>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700 font-mono">
              <p><strong className="text-slate-900 font-display">Item Name:</strong> {selectedProduct.name}</p>
              <p><strong className="text-slate-900 font-display">Selling Price:</strong> ₹{selectedProduct.retailPrice}/{selectedProduct.unit}</p>
              <p><strong className="text-slate-900 font-display">EAN Barcode:</strong> {selectedProduct.barcode || "890105800124"}</p>
              <p><strong className="text-slate-900 font-display">HSN Tax Code:</strong> {selectedProduct.hsn || "1902"}</p>
            </div>
          )}
        </div>

        {/* Right Barcode Sticker Sheet Preview */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm font-display flex items-center space-x-1.5">
              <LayoutGrid className="w-4 h-4 text-[#1E3A5F]" />
              <span>Printable Barcode Sheet Preview ({labelCount} Labels)</span>
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
              Ready to Print
            </span>
          </div>

          {/* Printable Barcode Sheet Grid */}
          <div id="barcode-printable-area" className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-100 rounded-2xl border border-slate-200 max-h-[450px] overflow-y-auto">
            {Array.from({ length: labelCount }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-between text-center shadow-xs font-mono select-none"
              >
                <div className="text-[10px] font-black text-slate-900 font-display truncate max-w-[140px]">
                  {storeConfig.name || "Gupta Kirana Store"}
                </div>
                <div className="text-[11px] font-bold text-slate-800 truncate max-w-[140px] mt-0.5">
                  {selectedProduct ? selectedProduct.name : "Kirana Item"}
                </div>

                {/* Simulated EAN-13 Barcode Lines */}
                <div className="w-full my-1 flex justify-center items-center space-x-0.5 h-7 px-1">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-950 h-full"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>

                <div className="text-[9px] text-slate-600 font-bold tracking-widest">
                  {selectedProduct?.barcode || "890105800124"}
                </div>

                <div className="text-xs font-black text-slate-900 mt-0.5">
                  MRP: ₹{selectedProduct?.retailPrice || "100"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
