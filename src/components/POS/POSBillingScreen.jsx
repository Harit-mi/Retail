import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/useStore";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { WebcamBarcodeScannerModal } from "./WebcamBarcodeScannerModal";
import {
  Search,
  ScanBarcode,
  Camera,
  Plus,
  Minus,
  Trash2,
  UserCheck,
  UserPlus,
  ArrowRight,
  Package,
  Receipt,
  Tag,
  Gift,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Clock,
  X,
  Scale,
  CheckCircle2,
  Coins,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";

// Web Audio API Crisp Cash Register Beep Synthesizer
const playBeepSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore audio restriction if muted
  }
};

// Category theme palette for Square-style visual tiles
const getCategoryAccent = (category = "") => {
  const cat = category.toLowerCase();
  if (cat.includes("oil") || cat.includes("ghee")) return { bg: "bg-amber-500/10", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" };
  if (cat.includes("grain") || cat.includes("dal") || cat.includes("rice") || cat.includes("atta")) return { bg: "bg-orange-500/10", text: "text-orange-800", border: "border-orange-200", dot: "bg-orange-500" };
  if (cat.includes("dairy") || cat.includes("milk") || cat.includes("paneer")) return { bg: "bg-blue-500/10", text: "text-blue-800", border: "border-blue-200", dot: "bg-blue-500" };
  if (cat.includes("tea") || cat.includes("beverage") || cat.includes("coffee")) return { bg: "bg-emerald-500/10", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500" };
  if (cat.includes("snack") || cat.includes("biscuit") || cat.includes("noodle")) return { bg: "bg-rose-500/10", text: "text-rose-800", border: "border-rose-200", dot: "bg-rose-500" };
  if (cat.includes("care") || cat.includes("soap") || cat.includes("shampoo")) return { bg: "bg-purple-500/10", text: "text-purple-800", border: "border-purple-200", dot: "bg-purple-500" };
  return { bg: "bg-zinc-500/10", text: "text-zinc-800", border: "border-zinc-200", dot: "bg-zinc-500" };
};

export const POSBillingScreen = ({ onOpenPaymentModal, onOpenCustomerModal }) => {
  const {
    products,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCustomer,
    applyCouponCode,
    redeemedPoints,
    setRedeemedPoints,
    cartSubtotal,
    cartTaxDetails,
    cartGrandTotal,
    calculatedDiscount,
    stockWarningToast,
    parkedCarts,
    parkCurrentCart,
    resumeParkedCart,
    discardParkedCart,
    setIsCashDrawerOpen,
    t,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);
  const [unmatchedBarcode, setUnmatchedBarcode] = useState(null);
  const [highlightedCartId, setHighlightedCartId] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [webcamModalOpen, setWebcamModalOpen] = useState(false);
  const [showParkedModal, setShowParkedModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [cartActionToast, setCartActionToast] = useState(null);

  // Quick Custom Amount / Loose uncatalogued item state
  const [customItemForm, setCustomItemForm] = useState({
    name: "",
    price: "",
    unit: "Pcs",
    gst: 0,
    qty: 1,
  });

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const searchInputRef = useRef(null);
  const lastHardwareScanRef = useRef({ time: 0, barcode: "" });

  // Global USB / Bluetooth Hardware Barcode Scanner Listener
  useBarcodeScanner((scannedProduct, scannedCode) => {
    if (scannedProduct) {
      lastHardwareScanRef.current = {
        time: Date.now(),
        barcode: scannedCode || scannedProduct.barcode || "",
      };
      setSearchQuery("");
      playBeepSound();
      setLastScannedItem(scannedProduct.name);
      setHighlightedCartId(scannedProduct.id);
      setTimeout(() => setHighlightedCartId(null), 1200);
      setTimeout(() => setLastScannedItem(null), 2500);
    }
  });

  // Keyboard Shortcuts Listener (F2: Search, F4: Customer, F8: Checkout, F9: Drawer)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        onOpenCustomerModal();
      } else if (e.key === "F8" && cart.length > 0) {
        e.preventDefault();
        onOpenPaymentModal();
      } else if (e.key === "F9") {
        e.preventDefault();
        setIsCashDrawerOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, onOpenCustomerModal, onOpenPaymentModal, setIsCashDrawerOpen]);

  // Autofocus search on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleAddItemToCart = (product, qty = 1) => {
    playBeepSound();
    addToCart(product, qty);
    setHighlightedCartId(product.id);
    setTimeout(() => setHighlightedCartId(null), 1200);
  };

  // Search Submission via Enter Key with hardware scanner de-duplication
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      if (Date.now() - lastHardwareScanRef.current.time < 500) {
        setSearchQuery("");
        return;
      }

      const q = searchQuery.toLowerCase().trim();
      const matched = products.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase() === q) ||
          (p.hsn && p.hsn.toLowerCase() === q)
      );

      if (matched) {
        handleAddItemToCart(matched, 1);
        setSearchQuery("");
      } else {
        setUnmatchedBarcode(searchQuery);
      }
    }
  };

  // Multi-Attribute Search Engine
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.barcode && product.barcode.includes(q)) ||
      (product.hsn && product.hsn.includes(q));

    return matchesCategory && matchesSearch;
  });

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Barcode Scanner Simulator
  const simulateBarcodeScan = () => {
    setIsScanning(true);
    if (products.length === 0) return;

    const randomItem = products[Math.floor(Math.random() * products.length)];

    setTimeout(() => {
      handleAddItemToCart(randomItem, 1);
      setLastScannedItem(randomItem.name);
      setIsScanning(false);
      setTimeout(() => setLastScannedItem(null), 2500);
    }, 350);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCouponCode(couponInput);
    setCouponMsg(res.message);
    if (res.success) setCouponInput("");
  };

  const isLooseWeightUnit = (unit) => {
    if (!unit) return false;
    const u = unit.toLowerCase();
    return u === "kg" || u === "ltr" || u === "gm" || u === "liter";
  };

  // Quick Custom Loose Item Handler (Square Retail + Indian Kirana)
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(customItemForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price in ₹");
      return;
    }

    const name = customItemForm.name.trim() || "खुला सामान (Custom Item)";
    const customProduct = {
      id: `custom_${Date.now()}`,
      name: name,
      retailPrice: priceNum,
      unit: customItemForm.unit || "Pcs",
      gst: Number(customItemForm.gst) || 0,
      stock: null, // Unrestricted stock for loose/custom item
      category: "Loose / Kirana",
    };

    handleAddItemToCart(customProduct, parseFloat(customItemForm.qty) || 1);
    setShowCustomItemModal(false);
    setCustomItemForm({
      name: "",
      price: "",
      unit: "Pcs",
      gst: 0,
      qty: 1,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-130px)] text-zinc-900">
      {/* ============================================================ */}
      {/* LEFT: THE PRODUCT CATALOG — Square Retail Shelf + Indian Presets */}
      {/* ============================================================ */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3.5">
        {/* Top Search & High-Speed Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUnmatchedBarcode(null);
              }}
              onKeyDown={handleSearchSubmit}
              placeholder="Search product, barcode, HSN... (F2)"
              className="w-full bg-white text-zinc-900 text-sm font-medium pl-10 pr-20 py-2.5 rounded-lg border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs outline-none transition placeholder-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded select-none">
              F2
            </kbd>
          </div>

          {/* Quick Actions: Custom Item (फुटकर), View Toggle, Camera & Scanner */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Square Retail: Quick Custom Item / खुला सामान Button */}
            <button
              onClick={() => setShowCustomItemModal(true)}
              title="Add Custom Item or Loose Kirana (खुला सामान / फुटकर)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-semibold">+ खुला सामान</span>
            </button>

            {/* Square Retail View Switcher: Grid vs List */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Visual Tiles Grid View"
                className={`p-1.5 rounded transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="Scanner List View (High Density)"
                className={`p-1.5 rounded transition cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setWebcamModalOpen(true)}
              title="Scan with Camera"
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg font-medium text-xs bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Camera</span>
            </button>

            <button
              onClick={simulateBarcodeScan}
              disabled={isScanning}
              title="Test Barcode Scanner Gun"
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg font-medium text-xs transition active:scale-[0.98] cursor-pointer shadow-2xs ${
                isScanning
                  ? "bg-zinc-900 text-white"
                  : "bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <ScanBarcode className={`w-3.5 h-3.5 ${isScanning ? "animate-pulse" : "text-zinc-500"}`} />
              <span className="hidden sm:inline">
                {isScanning ? "Scanning..." : "Test Scan"}
              </span>
            </button>
          </div>
        </div>

        {/* Live Feedback Banners */}
        {stockWarningToast && (
          <div className="bg-amber-50/90 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 font-medium animate-fade-in">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{stockWarningToast}</span>
          </div>
        )}

        {unmatchedBarcode && (
          <div className="bg-amber-50/90 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-lg text-xs flex items-center justify-between font-medium gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">SKU or Barcode '{unmatchedBarcode}' not recognized.</span>
            </div>
            <button
              onClick={() => {
                setCustomItemForm((prev) => ({ ...prev, name: `Item (${unmatchedBarcode})` }));
                setShowCustomItemModal(true);
              }}
              className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded font-medium shrink-0 cursor-pointer"
            >
              + Quick Add
            </button>
          </div>
        )}

        {lastScannedItem && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-lg text-xs flex items-center justify-between font-medium animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Scanned: <strong className="text-zinc-900 font-semibold">{lastScannedItem}</strong>
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold">
              Added to Cart ✓
            </span>
          </div>
        )}

        {/* Square-style Category Pill Filter Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === "All"
              ? products.length
              : products.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border border-zinc-200"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Catalog Display (Grid View or List View) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-400 bg-white rounded-xl border border-dashed border-zinc-200 p-6">
              <Package className="w-10 h-10 mb-2 text-zinc-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-zinc-700">
                No products match "{searchQuery}"
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Try searching with a shorter keyword or tap "+ खुला सामान" to bill uncatalogued goods.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* ============================================================ */
            /* 1. SQUARE RETAIL TILE GRID VIEW WITH INDIAN LOOSE PRESETS    */
            /* ============================================================ */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                const isOutOfStock = product.stock !== null && product.stock <= 0;
                const isLowStock =
                  product.stock !== null &&
                  product.stock > 0 &&
                  product.stock <= (product.minStockWarning || 5);
                const isLoose = isLooseWeightUnit(product.unit);
                const accent = getCategoryAccent(product.category);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddItemToCart(product, 1)}
                    className={`bg-white border rounded-xl p-3 flex flex-col justify-between select-none cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
                      isOutOfStock
                        ? "border-red-200 bg-red-50/10 opacity-70"
                        : cartItem
                        ? "border-zinc-900 ring-1 ring-zinc-900/10 bg-zinc-50/30"
                        : "border-zinc-200/90 hover:border-zinc-300"
                    }`}
                  >
                    <div>
                      {/* Category Tag & GST Slab */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${accent.bg} ${accent.text} border ${accent.border} truncate max-w-[150px]`}>
                          {product.category}
                        </span>
                        <span className="text-[9px] font-mono font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 whitespace-nowrap">
                          GST {product.gst}%
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="text-xs font-semibold text-zinc-900 leading-snug line-clamp-2 mb-1.5">
                        {product.name}
                      </h4>

                      {/* Stock Health */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono mb-2 text-zinc-400">
                        {isOutOfStock ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Low: {product.stock} {product.unit}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {product.stock !== null ? `${product.stock} ${product.unit}` : "In Stock"}
                          </span>
                        )}
                        {product.hsn && <span>· HSN {product.hsn}</span>}
                      </div>
                    </div>

                    {/* Loose Weight Chips (तौल / खुली सामग्री: 100g, 250g 'पाव', 500g, 1kg) */}
                    {isLoose && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-wrap items-center gap-1 mb-2 pt-1.5 border-t border-zinc-100 text-[10px] font-mono"
                      >
                        <Scale className="w-3 h-3 text-zinc-400 shrink-0 mr-0.5" />
                        <span className="text-zinc-400 text-[9px] mr-0.5">तौल:</span>
                        {[
                          { label: "100g", qty: 0.1 },
                          { label: "पाव (250g)", qty: 0.25 },
                          { label: "आधा किलो (500g)", qty: 0.5 },
                          { label: "1kg", qty: 1.0 },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => handleAddItemToCart(product, chip.qty)}
                            title={`Add ${chip.label} of ${product.name}`}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 transition-colors border border-zinc-200 cursor-pointer active:scale-95"
                          >
                            +{chip.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Bottom Row: Price & Quantity Stepper */}
                    <div className="flex items-end justify-between pt-2 border-t border-zinc-100 mt-auto">
                      <div className="font-mono">
                        <span className="text-base font-bold text-zinc-950">
                          ₹{product.retailPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-0.5">
                          /{product.unit}
                        </span>
                      </div>

                      {cartItem ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-0.5 bg-zinc-900 text-white rounded-lg p-0.5 shadow-2xs"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const step = isLoose ? 0.25 : 1;
                              updateCartQty(product.id, Math.max(0, Math.round((cartItem.qty - step) * 1000) / 1000));
                            }}
                            className="hover:bg-zinc-800 rounded transition min-w-[24px] h-6 flex items-center justify-center active:scale-95 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold px-1.5 min-w-[24px] text-center">
                            {cartItem.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const step = isLoose ? 0.25 : 1;
                              updateCartQty(product.id, Math.round((cartItem.qty + step) * 1000) / 1000);
                            }}
                            className="hover:bg-zinc-800 rounded transition min-w-[24px] h-6 flex items-center justify-center active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 group-hover:bg-zinc-900 text-zinc-700 flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ============================================================ */
            /* 2. SQUARE RETAIL HIGH-SPEED SCANNER LIST VIEW                */
            /* ============================================================ */
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Item & Category</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Barcode / HSN</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map((product) => {
                    const cartItem = cart.find((item) => item.id === product.id);
                    const isOutOfStock = product.stock !== null && product.stock <= 0;
                    const isLowStock =
                      product.stock !== null &&
                      product.stock > 0 &&
                      product.stock <= (product.minStockWarning || 5);
                    const isLoose = isLooseWeightUnit(product.unit);

                    return (
                      <tr
                        key={product.id}
                        onClick={() => handleAddItemToCart(product, 1)}
                        className={`hover:bg-zinc-50/80 cursor-pointer transition-colors ${
                          cartItem ? "bg-zinc-50/50" : ""
                        }`}
                      >
                        <td className="py-2 px-3">
                          <div className="font-semibold text-zinc-900 leading-snug">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-zinc-500">{product.category}</span>
                            <span>·</span>
                            <span>GST {product.gst}%</span>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-mono text-[11px] text-zinc-400 hidden sm:table-cell">
                          {product.barcode || product.hsn || "—"}
                        </td>

                        <td className="py-2 px-3 font-mono text-[11px]">
                          {isOutOfStock ? (
                            <span className="text-red-600 font-medium">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="text-amber-600 font-medium">Low: {product.stock} {product.unit}</span>
                          ) : (
                            <span className="text-zinc-600">{product.stock !== null ? `${product.stock} ${product.unit}` : "In Stock"}</span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-right font-mono font-bold text-zinc-950 text-xs">
                          ₹{product.retailPrice.toLocaleString("en-IN")}
                          <span className="text-[9px] font-normal text-zinc-400 block">/{product.unit}</span>
                        </td>

                        <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {cartItem ? (
                            <div className="inline-flex items-center gap-0.5 bg-zinc-900 text-white rounded-md p-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const step = isLoose ? 0.25 : 1;
                                  updateCartQty(product.id, Math.max(0, Math.round((cartItem.qty - step) * 1000) / 1000));
                                }}
                                className="hover:bg-zinc-800 rounded min-w-[20px] h-5 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs font-mono font-bold px-1.5 min-w-[18px] text-center">
                                {cartItem.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const step = isLoose ? 0.25 : 1;
                                  updateCartQty(product.id, Math.round((cartItem.qty + step) * 1000) / 1000);
                                }}
                                className="hover:bg-zinc-800 rounded min-w-[20px] h-5 flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddItemToCart(product, 1)}
                              className="px-2 py-1 bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 text-xs font-medium rounded transition cursor-pointer"
                            >
                              Add
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT: THE REGISTER CONSOLE — Persistent Square Retail Tape  */}
      {/* ============================================================ */}
      <div className={`fixed inset-0 z-50 lg:static lg:z-auto bg-black/50 lg:bg-transparent transition-opacity ${
        isMobileCartOpen ? "flex items-end lg:block" : "hidden lg:flex"
      } lg:col-span-5 xl:col-span-4 flex-col`}>
        <div 
          onClick={() => setIsMobileCartOpen(false)} 
          className="absolute inset-0 lg:hidden"
        />
        <div className="relative z-10 w-full max-h-[85vh] lg:max-h-none flex-1 flex flex-col bg-white rounded-t-2xl lg:rounded-xl border border-zinc-200 shadow-xl lg:shadow-xs overflow-hidden">
          {/* Top Console Bar */}
          <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono text-zinc-600 font-medium">
                काउंटर 01 // <span className="text-emerald-700 font-semibold">तैयार है</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(false)}
                className="lg:hidden p-1 text-zinc-400 hover:text-zinc-700 rounded mr-1 cursor-pointer"
                aria-label="Close cart sheet"
              >
                <X className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCashDrawerOpen(true)}
                title="Cash Drawer Audit & Float (F9)"
                className="flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-950 px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 transition font-medium cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-zinc-600" />
                <span>गल्ला (F9)</span>
              </button>

              {parkedCarts?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowParkedModal(true)}
                  className="px-2 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-mono font-semibold flex items-center gap-1 transition border border-amber-200 cursor-pointer"
                >
                  <Clock className="w-3 h-3" />
                  <span>{parkedCarts.length} Held</span>
                </button>
              )}

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const res = parkCurrentCart();
                    if (res.success) {
                      setCartActionToast(res.message);
                      setTimeout(() => setCartActionToast(null), 3000);
                    }
                  }}
                  title="Hold bill for next customer"
                  className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-900 px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 transition font-medium cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>होल्ड</span>
                </button>
              )}

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  title="Clear Cart"
                  className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition font-medium cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>खाली</span>
                </button>
              )}
            </div>
          </div>

          {cartActionToast && (
            <div className="bg-amber-50 text-amber-900 px-4 py-2 text-xs font-mono font-medium flex items-center gap-2 border-b border-amber-200 animate-fade-in">
              <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>{cartActionToast}</span>
            </div>
          )}

          {/* Customer Khata Strip with Udhaar Warning */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                {cartCustomer ? cartCustomer.name.charAt(0) : "G"}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 truncate">
                    {cartCustomer ? cartCustomer.name : t("walkInCustomer")}
                  </p>
                  {cartCustomer && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-semibold">
                      खाता ग्राहक
                    </span>
                  )}
                </div>
                <p className="text-[10px] truncate font-mono">
                  {cartCustomer ? (
                    cartCustomer.balance > 0 ? (
                      <span className="text-amber-700 font-semibold">
                        ⚠️ पुराना उधार: ₹{cartCustomer.balance.toLocaleString("en-IN")} · ★ {cartCustomer.loyaltyPoints || 0} pts
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">
                        ✓ उधार शून्य · ★ {cartCustomer.loyaltyPoints || 0} pts
                      </span>
                    )
                  ) : (
                    <span className="text-zinc-400">फुटकर ग्राहक (Walk-in Customer)</span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenCustomerModal}
              title="Select or attach customer account (F4)"
              className="shrink-0 px-2 py-1 rounded-lg text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-700 transition flex items-center gap-1 border border-zinc-200 cursor-pointer shadow-2xs"
            >
              {cartCustomer ? <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> : <UserPlus className="w-3.5 h-3.5 text-zinc-500" />}
              <kbd className="font-mono text-[10px] text-zinc-500">F4</kbd>
            </button>
          </div>

          {/* Receipt Cart Lines */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-0 min-h-[160px] max-h-[320px] lg:max-h-none">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-400 space-y-2">
                <Receipt className="w-9 h-9 text-zinc-300 stroke-[1.5]" />
                <p className="text-xs font-semibold text-zinc-700">
                  बिलिंग टेप खाली है (Receipt Empty)
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Scan barcode, click shelf item, or add custom item (+ खुला सामान)
                </p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const isHighlighted = highlightedCartId === item.id;
                const isLowStockItem = item.stock !== null && item.stock <= (item.minStockWarning || 5);
                const isLoose = isLooseWeightUnit(item.unit);

                return (
                  <div
                    key={item.id}
                    className={`py-2.5 flex items-center justify-between gap-2 transition-colors ${
                      idx !== 0 ? "border-t border-zinc-100" : ""
                    } ${isHighlighted ? "bg-emerald-50/50 -mx-4 px-4" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-medium text-zinc-900 truncate">{item.name}</h5>
                        {isLowStockItem && (
                          <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded font-mono font-semibold whitespace-nowrap">
                            LOW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono mt-0.5">
                        <span>₹{item.price}</span>
                        <span>×</span>
                        <span>{item.qty} {item.unit || "unit"}</span>
                      </div>
                    </div>

                    {/* Stepper with Decimal Support for Loose Goods */}
                    <div className="flex items-center gap-0.5 bg-zinc-100 border border-zinc-200 rounded-md p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const step = isLoose ? 0.25 : 1;
                          updateCartQty(item.id, Math.max(0, Math.round((item.qty - step) * 1000) / 1000));
                        }}
                        className="text-zinc-600 hover:text-zinc-900 rounded transition min-w-[22px] h-5 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        type="number"
                        step="any"
                        min="0.001"
                        value={item.qty}
                        onChange={(e) => updateCartQty(item.id, parseFloat(e.target.value) || 0)}
                        className="w-10 text-center text-xs font-mono font-bold bg-transparent text-zinc-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const step = isLoose ? 0.25 : 1;
                          updateCartQty(item.id, Math.round((item.qty + step) * 1000) / 1000);
                        }}
                        className="text-zinc-600 hover:text-zinc-900 rounded transition min-w-[22px] h-5 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[65px]">
                      <div className="text-xs font-bold font-mono text-zinc-950 tabular-nums">
                        ₹{item.total.toLocaleString("en-IN")}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-400 hover:text-red-600 transition text-[9px] font-mono cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Register Footer & Total Deck */}
          {cart.length > 0 && (
            <div className="px-4 pb-4 pt-2.5 space-y-2.5 border-t border-zinc-200 bg-zinc-50/50">
              {/* Promo code input */}
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Tag className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. DIWALI10, FLAT200)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-7 pr-2 py-1 text-[11px] font-mono text-zinc-900 placeholder-zinc-400 outline-none uppercase focus:border-zinc-800"
                  />
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-lg transition border border-zinc-200 cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className="text-[10px] font-mono text-zinc-700 bg-zinc-100 p-1 rounded border border-zinc-200">
                  {couponMsg}
                </p>
              )}

              {cartCustomer && (cartCustomer.loyaltyPoints || 0) > 0 && (
                <label className="flex items-center justify-between bg-amber-50/80 border border-amber-200 p-1.5 rounded-lg text-xs text-amber-900 cursor-pointer">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>Redeem {cartCustomer.loyaltyPoints} pts (₹{cartCustomer.loyaltyPoints})</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={redeemedPoints > 0}
                    onChange={(e) => setRedeemedPoints(e.target.checked ? cartCustomer.loyaltyPoints : 0)}
                    className="w-4 h-4 accent-zinc-900 cursor-pointer"
                  />
                </label>
              )}

              {/* Financial Subtotals & Indian Round-off indicator */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal (सकल योग)</span>
                  <span className="font-semibold text-zinc-900">₹{cartSubtotal}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount (छूट)</span>
                    <span>−₹{calculatedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>Taxable: ₹{Math.round(cartTaxDetails.taxableAmount)}</span>
                  <span>GST: ₹{Math.round(cartTaxDetails.totalTax)}</span>
                </div>
              </div>

              {/* Square-style High-Readability Total Card */}
              <div className="rounded-lg p-3 bg-zinc-950 text-white shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block">
                    कुल देय राशि (TOTAL DUE)
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {cart.length} line items (GST incl.)
                  </span>
                </div>
                <div className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                  ₹{cartGrandTotal.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Primary Tender Checkout Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileCartOpen(false);
                  onOpenPaymentModal();
                }}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-semibold py-3.5 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded">
                  F8
                </kbd>
                <span className="text-sm">Tender & Pay · भुगतान करें (₹{cartGrandTotal.toLocaleString("en-IN")})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Mobile Cart Bar */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-14 inset-x-3 z-30 animate-fade-in">
          <div className="bg-zinc-950 text-white rounded-xl p-3 shadow-xl border border-zinc-800 flex items-center justify-between">
            <div 
              onClick={() => setIsMobileCartOpen(true)}
              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                {cart.length}
              </div>
              <div className="truncate">
                <span className="text-xs text-zinc-400 block font-mono leading-none">Total Due</span>
                <span className="text-base font-bold font-mono text-white leading-tight">
                  ₹{cartGrandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(true)}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-lg text-zinc-200 cursor-pointer"
              >
                View Bill
              </button>
              <button
                type="button"
                onClick={onOpenPaymentModal}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Pay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* QUICK CUSTOM ITEM / खुला सामान (फुटकर) MODAL                 */}
      {/* ============================================================ */}
      {showCustomItemModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl border border-zinc-200">
            <div className="bg-zinc-50 text-zinc-900 px-5 py-3.5 flex items-center justify-between border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-zinc-900">
                  खुला सामान / Quick Custom Item (फुटकर)
                </h3>
              </div>
              <button
                onClick={() => setShowCustomItemModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded transition text-xs font-mono cursor-pointer"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="p-5 space-y-4">
              {/* Common Kirana Quick Presets */}
              <div>
                <label className="text-[11px] font-medium text-zinc-500 mb-1.5 block">
                  Quick Kirana Presets (तुरंत चयन करें):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "धनिया (Coriander) ₹10", name: "धनिया / Coriander", price: "10", unit: "Pcs" },
                    { label: "खुला दूध (Loose Milk) ₹30", name: "खुला दूध / Loose Milk", price: "30", unit: "Ltr" },
                    { label: "दही पाउच (Curd) ₹25", name: "दही पाउच / Curd Pouch", price: "25", unit: "Pcs" },
                    { label: "पैकिंग चार्ज ₹20", name: "पैकिंग / Delivery Charge", price: "20", unit: "Pcs" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCustomItemForm({
                        name: preset.name,
                        price: preset.price,
                        unit: preset.unit,
                        gst: 0,
                        qty: 1,
                      })}
                      className="px-2 py-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 rounded border border-zinc-200 text-zinc-700 transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Item Description / नाम
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. खुला बेसन / Loose Besan, Repair service"
                  value={customItemForm.name}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    Price (₹) प्रति इकाई
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 50"
                    value={customItemForm.price}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, price: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    Quantity / मात्रा
                  </label>
                  <input
                    type="number"
                    required
                    min="0.001"
                    step="any"
                    value={customItemForm.qty}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, qty: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* Unit & GST Slab */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    Unit / इकाई
                  </label>
                  <select
                    value={customItemForm.unit}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, unit: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-900"
                  >
                    <option value="Pcs">Pcs (नग)</option>
                    <option value="kg">kg (किलो)</option>
                    <option value="gm">gm (ग्राम)</option>
                    <option value="Ltr">Ltr (लीटर)</option>
                    <option value="packet">Packet (पैकेट)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    GST Slab
                  </label>
                  <select
                    value={customItemForm.gst}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, gst: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-900"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5% (Grocery / Food)</option>
                    <option value="12">12%</option>
                    <option value="18">18% (Standard)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomItemModal(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition shadow-xs cursor-pointer"
                >
                  + Add to Bill (बिल में जोड़ें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Live Barcode Scanner Modal */}
      <WebcamBarcodeScannerModal
        isOpen={webcamModalOpen}
        onClose={() => setWebcamModalOpen(false)}
        onBarcodeDetected={(prod) => {
          playBeepSound();
          setLastScannedItem(prod.name);
          setHighlightedCartId(prod.id);
          setTimeout(() => setHighlightedCartId(null), 1200);
          setTimeout(() => setLastScannedItem(null), 2500);
        }}
      />

      {/* Held / Parked Carts Drawer Modal */}
      {showParkedModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-xl border border-zinc-200">
            <div className="bg-zinc-50 text-zinc-900 px-5 py-3.5 flex items-center justify-between border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-700" />
                <h3 className="font-semibold text-sm text-zinc-900">
                  Held Customer Bills ({parkedCarts?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setShowParkedModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded transition text-xs font-mono cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {(!parkedCarts || parkedCarts.length === 0) ? (
                <div className="text-center py-8 text-zinc-400 text-xs font-mono">
                  No bills are currently on hold.
                </div>
              ) : (
                parkedCarts.map((pCart) => (
                  <div
                    key={pCart.id}
                    className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between gap-3 hover:border-zinc-300 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-zinc-900 truncate">
                          {pCart.label}
                        </span>
                        <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded font-mono font-medium">
                          {pCart.items?.length || 0} items
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-400 mt-1">
                        Held at {new Date(pCart.parkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ₹{pCart.grandTotal?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          const res = resumeParkedCart(pCart.id);
                          setShowParkedModal(false);
                          if (res.success) {
                            setCartActionToast(res.message);
                            setTimeout(() => setCartActionToast(null), 3000);
                          }
                        }}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md flex items-center gap-1 transition cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>

                      <button
                        onClick={() => discardParkedCart(pCart.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded transition cursor-pointer"
                        title="Discard this held cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
