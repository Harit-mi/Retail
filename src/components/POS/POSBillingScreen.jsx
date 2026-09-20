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
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);
  const [unmatchedBarcode, setUnmatchedBarcode] = useState(null);
  const [highlightedCartId, setHighlightedCartId] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [webcamModalOpen, setWebcamModalOpen] = useState(false);
  const [showParkedModal, setShowParkedModal] = useState(false);
  const [cartActionToast, setCartActionToast] = useState(null);

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

  // Keyboard Shortcuts Listener (F2: Search, F4: Customer Select, F8: Checkout)
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-130px)] text-zinc-900">
      {/* ============================================================ */}
      {/* LEFT: THE PRODUCT CATALOG — Minimalist Clean Retail Shelf    */}
      {/* ============================================================ */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUnmatchedBarcode(null);
              }}
              onKeyDown={handleSearchSubmit}
              placeholder="Search product name, barcode, or HSN code..."
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

          <div className="flex items-stretch gap-2">
            <button
              onClick={() => setWebcamModalOpen(true)}
              title="Scan with Camera"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-xs bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98] cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-500" />
              <span>Camera</span>
            </button>

            <button
              onClick={simulateBarcodeScan}
              disabled={isScanning}
              title="Test Barcode Scanner"
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-xs transition active:scale-[0.98] cursor-pointer shadow-2xs ${
                isScanning
                  ? "bg-zinc-900 text-white"
                  : "bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <ScanBarcode className={`w-3.5 h-3.5 ${isScanning ? "animate-pulse" : "text-zinc-500"}`} />
              <span className="whitespace-nowrap">
                {isScanning ? "Scanning..." : "Test Scan"}
              </span>
            </button>
          </div>
        </div>

        {/* Live Feedback Banners */}
        {stockWarningToast && (
          <div className="bg-amber-50/90 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 font-medium">
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
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-semibold uppercase shrink-0">
              Not in catalog
            </span>
          </div>
        )}

        {lastScannedItem && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-lg text-xs flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Scanned: <strong className="text-zinc-900 font-semibold">{lastScannedItem}</strong>
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold">
              Added to Cart
            </span>
          </div>
        )}

        {/* Category Filter Rail */}
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
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border border-zinc-200/80"
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

        {/* Product Shelf Grid — Minimalist Cards */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-400 bg-white rounded-xl border border-dashed border-zinc-200 p-6">
              <Package className="w-10 h-10 mb-2 text-zinc-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-zinc-700">
                No products match "{searchQuery}"
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Try searching with a shorter keyword or clearing category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                const isOutOfStock = product.stock !== null && product.stock <= 0;
                const isLowStock =
                  product.stock !== null &&
                  product.stock > 0 &&
                  product.stock <= (product.minStockWarning || 5);
                const isLoose = isLooseWeightUnit(product.unit);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddItemToCart(product, 1)}
                    className={`bg-white border rounded-xl p-3.5 flex flex-col justify-between select-none cursor-pointer transition-colors ${
                      isOutOfStock
                        ? "border-red-200/80 bg-red-50/10 opacity-70"
                        : cartItem
                        ? "border-zinc-900 ring-1 ring-zinc-900/10 bg-zinc-50/40"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div>
                      {/* Name and GST Slab */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-zinc-900 leading-snug line-clamp-2 flex-1">
                          {product.name}
                        </h4>
                        <span className="text-[9px] font-mono font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60 whitespace-nowrap">
                          GST {product.gst}%
                        </span>
                      </div>

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

                    {/* Loose Weight Chips */}
                    {isLoose && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 mb-2.5 pt-1.5 border-t border-zinc-100 text-[9px] font-mono"
                      >
                        <Scale className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="text-zinc-400 mr-0.5">Quick:</span>
                        {[
                          { label: "250g", qty: 0.25 },
                          { label: "500g", qty: 0.5 },
                          { label: "1kg", qty: 1.0 },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => handleAddItemToCart(product, chip.qty)}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-800 hover:text-white text-zinc-600 transition-colors border border-zinc-200 cursor-pointer"
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
                          className="flex items-center gap-0.5 bg-zinc-900 text-white rounded-lg p-0.5"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const step = isLoose ? 0.25 : 1;
                              updateCartQty(product.id, Math.max(0, Math.round((cartItem.qty - step) * 1000) / 1000));
                            }}
                            className="hover:bg-zinc-750 rounded transition min-w-[24px] h-6 flex items-center justify-center active:scale-95 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold px-1.5 min-w-[20px] text-center">
                            {cartItem.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const step = isLoose ? 0.25 : 1;
                              updateCartQty(product.id, Math.round((cartItem.qty + step) * 1000) / 1000);
                            }}
                            className="hover:bg-zinc-750 rounded transition min-w-[24px] h-6 flex items-center justify-center active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 group-hover:bg-zinc-900 text-zinc-600 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT: THE REGISTER CONSOLE — Quiet Monospace Financial Tape */}
      {/* ============================================================ */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          {/* Top Console Bar */}
          <div className="px-4 py-3 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-0.5">
                <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 font-medium">
                terminal_01 // <span className="text-emerald-700 font-semibold">ready</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCashDrawerOpen(true)}
                title="Cash Drawer Audit & Float (F9)"
                className="flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-950 px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 transition font-medium cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-zinc-600" />
                <span>Drawer</span>
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
                  <span>Hold</span>
                </button>
              )}

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  title="Clear Cart"
                  className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 px-2 py-1 rounded border border-red-200/60 hover:bg-red-50 transition font-medium cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {cartActionToast && (
            <div className="bg-amber-50 text-amber-900 px-4 py-2 text-xs font-mono font-medium flex items-center gap-2 border-b border-amber-200">
              <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>{cartActionToast}</span>
            </div>
          )}

          {/* Customer Selection Strip */}
          <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-zinc-200/80 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                {cartCustomer ? cartCustomer.name.charAt(0) : "C"}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 truncate">
                    {cartCustomer ? cartCustomer.name : t("walkInCustomer")}
                  </p>
                  {cartCustomer && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-semibold">
                      Account
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate font-mono">
                  {cartCustomer
                    ? `★ ${cartCustomer.loyaltyPoints || 0} pts · Udhaar: ₹${cartCustomer.balance || 0}`
                    : "Walk-in Customer (Anonymous)"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenCustomerModal}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-700 transition flex items-center gap-1.5 border border-zinc-200 cursor-pointer shadow-2xs"
            >
              {cartCustomer ? <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> : <UserPlus className="w-3.5 h-3.5 text-zinc-500" />}
              <kbd className="font-mono text-[10px] text-zinc-500">F4</kbd>
            </button>
          </div>

          {/* Receipt Cart Lines */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0 min-h-[160px] max-h-[320px] lg:max-h-none">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-400 space-y-2">
                <Receipt className="w-9 h-9 text-zinc-300 stroke-[1.5]" />
                <p className="text-xs font-semibold text-zinc-700">
                  Receipt tape empty
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Select items from shelf or scan barcode gun
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

                    {/* Stepper with Decimal Support */}
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

                    <div className="text-right min-w-[60px]">
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
            <div className="px-4 pb-4 pt-3 space-y-3 border-t border-zinc-200 bg-zinc-50/50">
              {/* Promo code input */}
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. FESTIVE10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-7 pr-2 py-1.5 text-[11px] font-mono text-zinc-900 placeholder-zinc-400 outline-none uppercase focus:border-zinc-800"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-lg transition border border-zinc-200 cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className="text-[10px] font-mono text-zinc-700 bg-zinc-100 p-1.5 rounded border border-zinc-200">
                  {couponMsg}
                </p>
              )}

              {cartCustomer && (cartCustomer.loyaltyPoints || 0) > 0 && (
                <label className="flex items-center justify-between bg-amber-50/80 border border-amber-200 p-2 rounded-lg text-xs text-amber-900 cursor-pointer">
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

              {/* Financial Subtotals */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">₹{cartSubtotal}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>−₹{calculatedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>Taxable: ₹{Math.round(cartTaxDetails.taxableAmount)}</span>
                  <span>GST: ₹{Math.round(cartTaxDetails.totalTax)}</span>
                </div>
              </div>

              {/* Minimalist High-Readability Total Card */}
              <div className="rounded-lg p-3.5 bg-zinc-950 text-white shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-400 block">
                    Total Due
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {cart.length} line items (GST incl.)
                  </span>
                </div>
                <div className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                  ₹{cartGrandTotal.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Primary Checkout Button */}
              <button
                type="button"
                onClick={onOpenPaymentModal}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-semibold py-3.5 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded">
                  F8
                </kbd>
                <span className="text-sm">Tender & Checkout · ₹{cartGrandTotal.toLocaleString("en-IN")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

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
