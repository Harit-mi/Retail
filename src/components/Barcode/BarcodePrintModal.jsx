import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Printer, LayoutGrid, Plus, Minus, Trash2, CheckCircle2, Tag } from "lucide-react";

export const BarcodePrintModal = () => {
  const { products, storeConfig } = useStore();
  const [gridFormat, setGridFormat] = useState(24); // 24 or 40 per A4 sheet
  const [printList, setPrintList] = useState([
    { productId: products[0]?.id || "p1", qty: 12 },
    { productId: products[1]?.id || "p2", qty: 12 },
  ]);

  const handleAddPrintItem = (prodId) => {
    if (printList.some((item) => item.productId === prodId)) return;
    setPrintList([...printList, { productId: prodId, qty: 6 }]);
  };

  const handleUpdateQty = (prodId, newQty) => {
    if (newQty <= 0) {
      setPrintList(printList.filter((item) => item.productId !== prodId));
      return;
    }
    setPrintList(
      printList.map((item) => (item.productId === prodId ? { ...item, qty: newQty } : item))
    );
  };

  // Generate full sticker stream based on quantities
  const stickerStream = printList.flatMap((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return [];
    return Array.from({ length: item.qty }).map((_, idx) => ({
      ...prod,
      stickerId: `${prod.id}_${idx}`,
    }));
  });

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
            <span>Kirana Barcode Sticker Sheet Generator</span>
          </h2>
          <p className="text-xs text-slate-500">
            Print-ready EAN-13 barcode sticker sheets (24/40 stickers per A4) for loose Kirana items
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold text-xs rounded-2xl flex items-center space-x-2 shadow-md transition transform active:scale-95 min-h-[44px]"
        >
          <Printer className="w-4 h-4 text-[#F5A623]" />
          <span>Print Sticker Sheet Now</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Multi-Select Items & Quantity Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm font-display">
              Multi-Select Kirana Items & Quantities
            </h3>
            <span className="text-[10px] bg-slate-100 font-mono font-bold text-slate-700 px-2 py-0.5 rounded">
              {stickerStream.length} Total Labels
            </span>
          </div>

          {/* Select A4 Sheet Layout Template */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-slate-900 font-display block">
              A4 Sticker Sheet Template Grid:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGridFormat(24)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  gridFormat === 24
                    ? "bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                A4 (24 Stickers: 3 × 8)
              </button>

              <button
                type="button"
                onClick={() => setGridFormat(40)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  gridFormat === 40
                    ? "bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                A4 (40 Stickers: 4 × 10)
              </button>
            </div>
          </div>

          {/* Add Item Dropdown */}
          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">
              Add Kirana Item to Print Sheet
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddPrintItem(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
            >
              <option value="">-- Choose Item to Add --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.retailPrice}/{p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Print Items Quantity List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {printList.map((item) => {
              const prod = products.find((p) => p.id === item.productId);
              if (!prod) return null;

              return (
                <div
                  key={item.productId}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 font-display">
                      {prod.name}
                    </h5>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      MRP: ₹{prod.retailPrice} • Barcode: {prod.barcode || "890105800124"}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl p-1 shadow-xs">
                    <button
                      onClick={() => handleUpdateQty(item.productId, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-black w-6 text-center text-slate-900">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.productId, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: On-Screen Printable Barcode Sheet Preview */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm font-display flex items-center space-x-1.5">
              <LayoutGrid className="w-4 h-4 text-[#1E3A5F]" />
              <span>Live A4 Printable Sheet Preview ({gridFormat} Grid Layout)</span>
            </h3>
            <span className="text-[10px] bg-emerald-50 text-[#1FAA59] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
              Print-CSS Calibrated
            </span>
          </div>

          {/* Printable Area Container */}
          <div
            id="barcode-printable-area"
            className={`grid gap-2.5 p-4 bg-slate-100 rounded-2xl border border-slate-300 max-h-[500px] overflow-y-auto ${
              gridFormat === 24 ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            {stickerStream.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium text-xs">
                No items selected for barcode sticker printing.
              </div>
            ) : (
              stickerStream.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-between text-center font-mono select-none shadow-xs"
                  style={{ minHeight: gridFormat === 24 ? "100px" : "85px" }}
                >
                  <div className="text-[9px] font-black text-slate-900 font-display truncate max-w-[130px]">
                    {storeConfig.name || "Gupta Kirana Store"}
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 truncate max-w-[130px] mt-0.5">
                    {item.name}
                  </div>

                  {/* High-Contrast Crisp EAN-13 Barcode Vector Visual */}
                  <div className="w-full my-1 flex justify-center items-center space-x-0.5 h-6 px-1">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 1].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-950 h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>

                  <div className="text-[8px] text-slate-600 font-bold tracking-widest">
                    {item.barcode || "890105800124"}
                  </div>

                  <div className="text-[11px] font-black text-slate-950 mt-0.5">
                    MRP: ₹{item.retailPrice}/{item.unit || "kg"}
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
