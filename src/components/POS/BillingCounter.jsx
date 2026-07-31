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
  const { products, addToCart, cart, activeVertical } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut support: F2 to focus search
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

  // Filter products by selected activeVertical and search query
  const filteredProducts = products.filter((product) => {
    // Vertical filter
    const matchesVertical =
      activeVertical === "all" || product.vertical === activeVertical;

    // Category filter
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    // Search query filter (matches Name, Barcode, HSN, Brand, or IMEI)
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

  // Extract unique categories for current vertical
  const categories = [
    "All",
    ...new Set(
      products
        .filter((p) => activeVertical === "all" || p.vertical === activeVertical)
        .map((p) => p.category)
    ),
  ];

  // Barcode Scanner Simulator
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
      setTimeout(() => setLastScannedItem(null), 2500);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
      {/* Top Search & Barcode Scan Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, Barcode, HSN, IMEI, Brand... (Press F2)"
            className="w-full bg-slate-950/80 text-white text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Barcode Scanner Simulator Button */}
        <button
          onClick={simulateBarcodeScan}
          disabled={isScanning}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md ${
            isScanning
              ? "bg-amber-600 text-white animate-scan"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-950/40"
          }`}
        >
          <ScanBarcode className="w-5 h-5" />
          <span className="whitespace-nowrap">
            {isScanning ? "Scanning Barcode..." : "Simulate Scanner"}
          </span>
        </button>
      </div>

      {/* Toast Alert when Barcode Scanned */}
      {lastScannedItem && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>
              Scanned & Added: <strong>{lastScannedItem}</strong>
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded font-mono">
            +1 in Cart
          </span>
        </div>
      )}

      {/* Category Chips Horizontal Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? "bg-slate-100 text-slate-900 shadow-md"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
            <Package className="w-12 h-12 mb-2 text-slate-600 stroke-[1.5]" />
            <p className="text-base font-semibold text-slate-300">
              No products found for this vertical
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try switching store vertical in navbar or clear search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              const isLowStock =
                product.stock !== null &&
                product.stock <= (product.minStockWarning || 5);

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product, 1)}
                  className={`group relative bg-slate-950/70 hover:bg-slate-800/80 border transition-all duration-200 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer select-none ${
                    cartItem
                      ? "border-emerald-500/70 shadow-lg shadow-emerald-950/20 bg-emerald-950/10"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Top Header: Category & GST Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                      {product.category}
                    </span>

                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded">
                      GST {product.gst}%
                    </span>
                  </div>

                  {/* Product Title */}
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition line-clamp-2 leading-snug">
                    {product.name}
                  </h4>

                  {/* Dynamic Vertical Attributes Badge */}
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1">
                    {product.attributes?.batch_no && (
                      <span className="bg-rose-950/60 text-rose-300 px-1.5 py-0.2 rounded text-[10px] font-mono border border-rose-500/30">
                        Exp: {product.attributes.expiry_date}
                      </span>
                    )}
                    {product.attributes?.size && (
                      <span className="bg-indigo-950/60 text-indigo-300 px-1.5 py-0.2 rounded text-[10px] font-mono border border-indigo-500/30">
                        Size: {product.attributes.size}
                      </span>
                    )}
                    {product.attributes?.purity && (
                      <span className="bg-yellow-950/60 text-yellow-300 px-1.5 py-0.2 rounded text-[10px] font-semibold border border-yellow-500/30">
                        {product.attributes.purity}
                      </span>
                    )}
                    {product.attributes?.imei && (
                      <span className="bg-blue-950/60 text-blue-300 px-1.5 py-0.2 rounded text-[10px] font-mono border border-blue-500/30">
                        IMEI Logged
                      </span>
                    )}
                    {product.selling_unit_type === "service" && (
                      <span className="bg-purple-950/60 text-purple-300 px-1.5 py-0.2 rounded text-[10px] font-semibold border border-purple-500/30">
                        Salon Service
                      </span>
                    )}
                  </div>

                  {/* Price & Stock Row */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-end justify-between">
                    <div>
                      <div className="text-base font-extrabold text-emerald-400 flex items-baseline space-x-1">
                        <span>₹{product.retailPrice.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          /{product.unit}
                        </span>
                      </div>

                      {/* Stock Level Warning */}
                      <div className="text-[11px] mt-0.5">
                        {product.stock === null ? (
                          <span className="text-purple-400 font-semibold">
                            Service / Slot
                          </span>
                        ) : product.stock <= 0 ? (
                          <span className="text-rose-400 font-bold">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-amber-400 font-semibold">
                            Low: {product.stock} {product.unit} left
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Stock: {product.stock} {product.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cart Quantity Controller / Add Button */}
                    <div className="flex items-center">
                      {cartItem ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1.5 bg-emerald-600 text-white rounded-xl p-1 shadow-md shadow-emerald-950/40"
                        >
                          <button
                            onClick={() => addToCart(product, -1)}
                            className="p-1 hover:bg-emerald-700 rounded-lg transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold px-1 min-w-[18px] text-center">
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
                        <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-emerald-600 text-slate-300 group-hover:text-white flex items-center justify-center transition-all duration-200">
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

      {/* Footer Hotkey Reminder */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span>
            <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px] border border-slate-700">
              F2
            </kbd>{" "}
            Search
          </span>
          <span>
            <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px] border border-slate-700">
              F4
            </kbd>{" "}
            Customer Khata
          </span>
        </div>
        <span className="text-emerald-400 font-semibold">
          {filteredProducts.length} Items Available
        </span>
      </div>
    </div>
  );
};
