import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import {
  Printer,
  LayoutGrid,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Eye,
  Sliders,
  Tag,
  Calendar,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { BarcodeSticker } from "./BarcodeSticker";

export const BarcodePrintModal = () => {
  const { products, storeConfig } = useStore();

  // Grid / Template selection: 24, 40, 65, 'thermal-50x25', 'thermal-50x38'
  const [gridFormat, setGridFormat] = useState(24);
  const [previewMode, setPreviewMode] = useState("sheet"); // 'sheet' | 'inspect'
  const [zoomLevel, setZoomLevel] = useState(100); // 50, 75, 100, 125 percent
  const [selectedInspectIndex, setSelectedInspectIndex] = useState(0);

  // Sticker content options
  const [stickerOptions, setStickerOptions] = useState({
    showStoreName: true,
    showPrice: true,
    showUnit: true,
    showDate: true,
    showBatch: true,
    showFssai: false,
    packedDate: "Nov 2026",
    batchNo: "B26-04",
  });

  // Print Queue: array of { productId, qty }
  const [printList, setPrintList] = useState([
    { productId: products[0]?.id || "p1", qty: 12 },
    { productId: products[1]?.id || "p2", qty: 12 },
  ]);

  // Derived template key
  const templateKey = String(gridFormat).startsWith("thermal")
    ? gridFormat
    : `a4-${gridFormat}`;

  // Capacity per page
  const stickersPerPage = typeof gridFormat === "number" ? gridFormat : 1;

  // Add item to queue
  const handleAddPrintItem = (prodId) => {
    if (!prodId) return;
    const existing = printList.find((item) => item.productId === prodId);
    if (existing) {
      handleUpdateQty(prodId, existing.qty + 6);
    } else {
      setPrintList([...printList, { productId: prodId, qty: 6 }]);
    }
  };

  // Update item quantity in queue
  const handleUpdateQty = (prodId, newQty) => {
    if (newQty <= 0) {
      setPrintList(printList.filter((item) => item.productId !== prodId));
      return;
    }
    setPrintList(
      printList.map((item) =>
        item.productId === prodId ? { ...item, qty: Math.min(newQty, 500) } : item
      )
    );
  };

  // Auto-fill full sheet
  const handleAutoFillSheet = () => {
    if (products.length === 0) return;
    const count = stickersPerPage;
    const numItems = Math.min(products.length, 4);
    const perItemQty = Math.max(1, Math.floor(count / numItems));
    const itemsToFill = products.slice(0, numItems).map((p, idx) => ({
      productId: p.id,
      qty:
        idx === numItems - 1
          ? count - perItemQty * (numItems - 1) // fill exact remainder
          : perItemQty,
    }));
    setPrintList(itemsToFill);
  };

  // Add all inventory products with 1 label each
  const handleAddAllProducts = () => {
    if (products.length === 0) return;
    const all = products.map((p) => ({
      productId: p.id,
      qty: 2,
    }));
    setPrintList(all);
  };

  // Clear queue
  const handleClearAll = () => {
    setPrintList([]);
  };

  // Flat array of stickers to render
  const stickerStream = printList.flatMap((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return [];
    return Array.from({ length: item.qty }).map((_, idx) => ({
      ...prod,
      stickerId: `${prod.id}_${idx}`,
    }));
  });

  // Sheets count
  const totalSheets = typeof gridFormat === "number"
    ? Math.max(1, Math.ceil(stickerStream.length / stickersPerPage))
    : stickerStream.length;

  const handlePrint = () => {
    window.print();
  };

  // Grid columns class based on format
  const getGridColsClass = () => {
    if (templateKey === "a4-24") return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    if (templateKey === "a4-40") return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
    if (templateKey === "a4-65") return "grid-cols-2 sm:grid-cols-3 md:grid-cols-5";
    return "grid-cols-1 max-w-[55mm] mx-auto";
  };

  const getPrintGridColsClass = () => {
    if (templateKey === "a4-24") return "grid-cols-3";
    if (templateKey === "a4-40") return "grid-cols-4";
    if (templateKey === "a4-65") return "grid-cols-5";
    return "grid-cols-1";
  };

  return (
    <div className="space-y-5 animate-fade-in text-zinc-900">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & INSTANT PRINT BAR                            */}
      {/* ============================================================ */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                GST / GS1 EAN-13 Standards
              </span>
              <span className="text-xs text-zinc-400 font-mono">·</span>
              <span className="text-xs font-mono text-zinc-500">
                A4 Peel-off Sheets & Thermal Direct
              </span>
            </div>
            <h2 className="font-bold text-lg text-zinc-950 font-display mt-1 flex items-center gap-2">
              <span>Barcode & Price Tag Studio · बारकोड लेबल प्रिंटर</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Print optical-scanner verified EAN-13 stickers on standard commercial label sheets (24/40/65 per A4) or roll printers.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              disabled={stickerStream.length === 0}
              className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>
                Print Labels ({stickerStream.length} Stickers · {totalSheets} {typeof gridFormat === "number" ? "Sheet" : "Roll Label"}{totalSheets > 1 ? "s" : ""})
              </span>
            </button>
          </div>
        </div>

        {/* Quick Format Info Bar */}
        <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
          <div className="flex items-center gap-4">
            <span>
              Format: <strong className="font-mono text-zinc-900">{templateKey.toUpperCase()}</strong>
            </span>
            <span>
              Page Capacity: <strong className="font-mono text-zinc-900">{stickersPerPage} / sheet</strong>
            </span>
            <span>
              Total Queued: <strong className="font-mono text-emerald-800">{stickerStream.length} Labels</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>SVG Crisp-Edges Ready · 300/600 DPI Calibrated</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN 2-COLUMN STUDIO WORKBENCH                            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card A: Template Selector */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs font-display text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
                <span>1. Select Label Template</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                Standard Indian Sizes
              </span>
            </div>

            {/* Template Buttons Grid */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">
                A4 Sticker Sheets (Laser / Inkjet):
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGridFormat(24)}
                  className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between ${
                    gridFormat === 24
                      ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <span className="font-bold text-xs font-mono">24 Labels</span>
                  <span className="text-[10px] opacity-75 font-mono">3 × 8 · 66×34mm</span>
                  <span className="text-[9px] mt-1 font-sans opacity-90">Atta / FMCG / Boxes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGridFormat(40)}
                  className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between ${
                    gridFormat === 40
                      ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <span className="font-bold text-xs font-mono">40 Labels</span>
                  <span className="text-[10px] opacity-75 font-mono">4 × 10 · 48×25mm</span>
                  <span className="text-[9px] mt-1 font-sans opacity-90">Spices / Grocery / Soap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGridFormat(65)}
                  className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between ${
                    gridFormat === 65
                      ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <span className="font-bold text-xs font-mono">65 Labels</span>
                  <span className="text-[10px] opacity-75 font-mono">5 × 13 · 38×21mm</span>
                  <span className="text-[9px] mt-1 font-sans opacity-90">Mini / Jars / Jewelry</span>
                </button>
              </div>

              <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold pt-1.5">
                Direct Thermal Barcode Printers (TVS / TSC / Zebra):
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGridFormat("thermal-50x25")}
                  className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between ${
                    gridFormat === "thermal-50x25"
                      ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <span className="font-bold text-xs font-mono">50 × 25 mm Roll</span>
                  <span className="text-[10px] opacity-75 font-mono">2" × 1" Standard</span>
                  <span className="text-[9px] mt-0.5 font-sans opacity-90">Most Popular Indian Roll</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGridFormat("thermal-50x38")}
                  className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between ${
                    gridFormat === "thermal-50x38"
                      ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <span className="font-bold text-xs font-mono">50 × 38 mm Roll</span>
                  <span className="text-[10px] opacity-75 font-mono">2" × 1.5" Large</span>
                  <span className="text-[9px] mt-0.5 font-sans opacity-90">Apparel / Cartons</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Sticker Content Customizer */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs font-display text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              <span>2. Sticker Content & Fields</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stickerOptions.showStoreName}
                  onChange={(e) =>
                    setStickerOptions({
                      ...stickerOptions,
                      showStoreName: e.target.checked,
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-zinc-500" />
                  Store Name
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stickerOptions.showPrice}
                  onChange={(e) =>
                    setStickerOptions({
                      ...stickerOptions,
                      showPrice: e.target.checked,
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-zinc-500" />
                  MRP & Taxes
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stickerOptions.showDate}
                  onChange={(e) =>
                    setStickerOptions({
                      ...stickerOptions,
                      showDate: e.target.checked,
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  Packed Date
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stickerOptions.showBatch}
                  onChange={(e) =>
                    setStickerOptions({
                      ...stickerOptions,
                      showBatch: e.target.checked,
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800">
                  Batch No
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stickerOptions.showUnit}
                  onChange={(e) =>
                    setStickerOptions({
                      ...stickerOptions,
                      showUnit: e.target.checked,
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800">
                  Net Wt / Unit
                </span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stickerOptions.showFssai}
                  onChange={(e) =>
                    setStickerOptions({
                      ...stickerOptions,
                      showFssai: e.target.checked,
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800">
                  FSSAI Lic No
                </span>
              </label>
            </div>

            {/* Custom Packed Date / Batch inputs */}
            {(stickerOptions.showDate || stickerOptions.showBatch) && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {stickerOptions.showDate && (
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">
                      Packed Date Text:
                    </label>
                    <input
                      type="text"
                      value={stickerOptions.packedDate}
                      onChange={(e) =>
                        setStickerOptions({
                          ...stickerOptions,
                          packedDate: e.target.value,
                        })
                      }
                      placeholder="e.g. Nov 2026"
                      className="w-full text-xs font-mono p-1.5 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                )}

                {stickerOptions.showBatch && (
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">
                      Batch Code:
                    </label>
                    <input
                      type="text"
                      value={stickerOptions.batchNo}
                      onChange={(e) =>
                        setStickerOptions({
                          ...stickerOptions,
                          batchNo: e.target.value,
                        })
                      }
                      placeholder="e.g. B26-04"
                      className="w-full text-xs font-mono p-1.5 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card C: Queue Management & Product Selector */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs font-display text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                <span>3. Add Items & Quantities</span>
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAutoFillSheet}
                  title="Auto-fill exact labels for 1 full sheet"
                  className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-2 py-1 rounded border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Fill Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddAllProducts}
                  title="Add all catalog products"
                  className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium px-2 py-1 rounded border border-zinc-300 transition cursor-pointer"
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  title="Clear printing list"
                  className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium px-2 py-1 rounded border border-zinc-300 transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Select product dropdown */}
            <div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddPrintItem(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">+ Choose product from catalog to add...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.retailPrice}/{p.unit || "unit"} (Barcode: {p.barcode || "Auto"})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Queue List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {printList.length === 0 ? (
                <div className="p-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-300 text-center text-xs text-zinc-500 font-medium">
                  Queue is empty. Select a product above or click <strong>Fill Sheet</strong>.
                </div>
              ) : (
                printList.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;

                  return (
                    <div
                      key={item.productId}
                      className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-zinc-900 truncate">
                          {prod.name}
                        </h5>
                        <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                          <span>₹{prod.retailPrice}/{prod.unit || "unit"}</span>
                          <span>·</span>
                          <span className="truncate">{prod.barcode || "890105800124"}</span>
                        </div>
                      </div>

                      {/* Stepper & Action Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center bg-white border border-zinc-300 rounded-md p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.productId, item.qty - 1)}
                            className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateQty(
                                item.productId,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-9 text-center text-xs font-mono font-bold text-zinc-900 border-none outline-none"
                            min="1"
                            max="500"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.productId, item.qty + 1)}
                            className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 rounded cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Quick Add +6 Pill */}
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, item.qty + 6)}
                          title="Add 6 more labels"
                          className="px-1.5 py-1 text-[10px] font-mono font-semibold bg-white border border-zinc-300 rounded text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                        >
                          +6
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, 0)}
                          title="Remove item from print queue"
                          className="p-1 text-zinc-400 hover:text-red-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Preview Studio (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
          {/* Studio Top Control Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
            {/* View Mode Toggle: Sheet vs Single Inspector */}
            <div className="bg-zinc-100 p-1 rounded-lg flex gap-1 border border-zinc-200">
              <button
                type="button"
                onClick={() => setPreviewMode("sheet")}
                className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  previewMode === "sheet"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Full Sheet View</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewMode("inspect")}
                className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  previewMode === "inspect"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Zoomed Label Inspector (2.5×)</span>
              </button>
            </div>

            {/* Zoom Controls */}
            {previewMode === "sheet" && (
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 p-1 rounded-lg text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                  disabled={zoomLevel <= 50}
                  className="p-1 rounded text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-zinc-800 font-bold">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.min(125, zoomLevel + 25))}
                  disabled={zoomLevel >= 125}
                  className="p-1 rounded text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Preview Canvas */}
          <div className="bg-zinc-200/70 border border-zinc-300 rounded-lg p-3 sm:p-5 min-h-[460px] max-h-[600px] overflow-auto flex justify-center items-start">
            {stickerStream.length === 0 ? (
              <div className="my-auto text-center py-12 text-zinc-500 space-y-2">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-zinc-400 stroke-[1.5]" />
                <h4 className="font-bold text-sm text-zinc-700">No Barcode Stickers in Queue</h4>
                <p className="text-xs max-w-sm mx-auto text-zinc-500">
                  Select products from the left or click <strong>Fill Sheet</strong> to preview your print-ready EAN-13 labels.
                </p>
              </div>
            ) : previewMode === "sheet" ? (
              /* A4 / Roll Physical Sheet Simulation */
              <div
                className="bg-white rounded shadow-md border border-zinc-400/80 p-4 transition-all mx-auto select-none"
                style={{
                  width: String(gridFormat).startsWith("thermal") ? "70mm" : "210mm",
                  minHeight: String(gridFormat).startsWith("thermal") ? "40mm" : "280mm",
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                }}
              >
                {/* Physical Sheet Header Guide */}
                <div className="text-center pb-2 mb-3 border-b border-dashed border-zinc-200">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                    A4 Self-Adhesive Sticker Sheet Simulation ({templateKey.toUpperCase()})
                  </div>
                </div>

                {/* Simulated Die-Cut Sticker Grid */}
                <div className={`grid gap-2 ${getGridColsClass()}`}>
                  {stickerStream.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedInspectIndex(idx);
                        setPreviewMode("inspect");
                      }}
                      className="group cursor-pointer transition-transform hover:scale-[1.02] relative"
                      title="Click to inspect this sticker in high zoom"
                    >
                      <BarcodeSticker
                        item={item}
                        storeConfig={storeConfig}
                        format={templateKey}
                        options={stickerOptions}
                        isZoomed={false}
                      />
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400 rounded-xs pointer-events-none transition-colors"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* High-Resolution Single Label Zoom Inspector */
              <div className="w-full flex flex-col items-center justify-center py-6 space-y-4">
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                    Macro Single Sticker Inspection (2.5× Zoom)
                  </span>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Showing label #{selectedInspectIndex + 1} of {stickerStream.length}:{" "}
                    <strong>{stickerStream[selectedInspectIndex]?.name}</strong>
                  </p>
                </div>

                {/* Realistic Zoomed Sticker Card */}
                <div className="relative">
                  <BarcodeSticker
                    item={stickerStream[selectedInspectIndex] || stickerStream[0]}
                    storeConfig={storeConfig}
                    format={templateKey}
                    options={stickerOptions}
                    isZoomed={true}
                  />
                  <div className="absolute -top-3 -right-3 bg-amber-400 text-zinc-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                    Verified GS1 EAN-13
                  </div>
                </div>

                {/* Sticker Navigation Selector */}
                {stickerStream.length > 1 && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInspectIndex(
                          (selectedInspectIndex - 1 + stickerStream.length) %
                            stickerStream.length
                        )
                      }
                      className="px-3 py-1 bg-white border border-zinc-300 rounded text-xs font-semibold hover:bg-zinc-100 cursor-pointer shadow-2xs"
                    >
                      ← Previous Label
                    </button>
                    <span className="text-xs font-mono font-bold text-zinc-700">
                      {selectedInspectIndex + 1} / {stickerStream.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInspectIndex(
                          (selectedInspectIndex + 1) % stickerStream.length
                        )
                      }
                      className="px-3 py-1 bg-white border border-zinc-300 rounded text-xs font-semibold hover:bg-zinc-100 cursor-pointer shadow-2xs"
                    >
                      Next Label →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. DEDICATED PRINT CONTAINER (@media print)                 */}
      {/* ============================================================ */}
      {stickerStream.length > 0 && (
        <div
          id="printable-barcode-sheet"
          className="hidden print:block w-full bg-white text-black"
          style={{
            maxWidth: String(gridFormat).startsWith("thermal") ? "50mm" : "210mm",
            margin: "0 auto",
          }}
        >
          <div className={`grid gap-1.5 p-2 ${getPrintGridColsClass()}`}>
            {stickerStream.map((item, idx) => (
              <BarcodeSticker
                key={idx}
                item={item}
                storeConfig={storeConfig}
                format={templateKey}
                options={stickerOptions}
                isZoomed={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};