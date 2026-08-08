import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Search,
  ScanBarcode,
  Plus,
  Minus,
  Zap,
  Filter,
  Package,
} from "lucide-react";

export const BillingCounter = () => {
  const { products, addToCart, cart, activeVertical, t } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesVertical =
      activeVertical === "all" || product.vertical === activeVertical;

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.barcode && product.barcode.includes(q)) ||
      (product.hsn && product.hsn.includes(q)) ||
      (product.attributes?.brand && product.attributes.brand.toLowerCase().includes(q)) ||
      (product.attributes?.imei && product.attributes.imei.includes(q));

    return matchesVertical && matchesCategory && matchesSearch;
  });

  const categories = [
    "All",
    ...new Set(
      products
        .filter((p) => activeVertical === "all" || p.vertical === activeVertical)
        .map((p) => p.category)
    ),
  ];

  const simulateBarcodeScan = () => {
    setIsScanning(true);
    const vertProducts = products.filter(
      (p) => activeVertical === "all" || p.vertical === activeVertical
    );
    if (vertProducts.length === 0) return;

    const randomItem =
      vertProducts[Math.floor(Math.random() * vertProducts.length)];

    setTimeout(() => {
      addToCart(randomItem, 1);
      setLastScannedItem(randomItem.name);
      setIsScanning(false);
      setTimeout(() => setLastScannedItem(null), 2000);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 p-4 space-y-4 card-shadow">
      {/* Search & Barcode Scan Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-slate-50 text-slate-900 text-sm font-medium pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-[#1E3A5F] focus:bg-white outline-none transition placeholder-slate-400 card-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-900 bg-slate-200 px-2 py-0.5 rounded font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <button
          onClick={simulateBarcodeScan}
          disabled={isScanning}
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
            isScanning
              ? "bg-amber-500 text-white animate-scan"
              : "bg-[#1E3A5F] hover:bg-[#152a45] text-white shadow-slate-900/20"
          }`}
        >
          <ScanBarcode className="w-5 h-5" />
          <span className="whitespace-nowrap font-display">
            {isScanning ? "..." : t("simulateScanner")}
          </span>
        </button>
      </div>

      {/* Barcode Alert Toast */}
      {lastScannedItem && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#1FAA59] px-3.5 py-2 rounded-xl text-xs flex items-center justify-between animate-fade-in font-medium">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#1FAA59] animate-bounce" />
            <span>
              Scanned: <strong>{lastScannedItem}</strong>
            </span>
          </div>
          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
            +1 Cart
          </span>
        </div>
      )}

      {/* Category Chips Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#1E3A5F] text-white shadow-md font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Cards Touch Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
            <Package className="w-12 h-12 mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-base font-semibold text-slate-700 font-display">
              No items match search '{searchQuery}'
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              const isLowStock =
                product.stock !== null &&
                product.stock <= (product.minStockWarning || 5);

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product, 1)}
                  className={`group relative bg-white hover:bg-slate-50 border transition-all duration-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer select-none card-shadow ${
                    cartItem
                      ? "border-[#1FAA59] ring-2 ring-[#1FAA59]/30 bg-emerald-50/20"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {product.category}
                    </span>

                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      GST {product.gst}%
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-display text-slate-900 group-hover:text-[#1E3A5F] transition line-clamp-2 leading-snug">
                    {product.name}
                  </h4>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <div className="text-lg font-black font-mono text-[#1E3A5F] flex items-baseline space-x-1">
                        <span>₹{product.retailPrice.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-sans font-normal text-slate-400">
                          /{product.unit}
                        </span>
                      </div>

                      <div className="text-[11px] mt-0.5">
                        {product.stock === null ? (
                          <span className="text-purple-600 font-semibold">
                            Service / Slot
                          </span>
                        ) : product.stock <= 0 ? (
                          <span className="text-[#E64545] font-bold">
                            {t("outOfStock")}
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[#F5A623] font-semibold">
                            {t("lowStock")}: {product.stock} {product.unit}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Stock: {product.stock} {product.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {cartItem ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1.5 bg-[#1FAA59] text-white rounded-xl p-1 shadow-md"
                        >
                          <button
                            onClick={() => addToCart(product, -1)}
                            className="p-1 hover:bg-emerald-700 rounded-lg transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-mono font-bold px-1 min-w-[18px] text-center">
                            {cartItem.qty}
                          </span>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="p-1 hover:bg-emerald-700 rounded-lg transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#1E3A5F] text-slate-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
