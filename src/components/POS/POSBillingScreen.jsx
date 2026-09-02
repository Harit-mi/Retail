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
  Zap,
  Package,
  Receipt,
  Tag,
  Gift,
  AlertTriangle,
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
    osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz crisp beep
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
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

  const searchInputRef = useRef(null);

  // Global USB / Bluetooth Hardware Barcode Scanner Listener
  useBarcodeScanner((scannedProduct) => {
    if (scannedProduct) {
      playBeepSound();
      setLastScannedItem(scannedProduct.name);
      setHighlightedCartId(scannedProduct.id);
      setTimeout(() => setHighlightedCartId(null), 1200);
      setTimeout(() => setLastScannedItem(null), 2500);
    }
  });

  // Keyboard Shortcuts Listener (F2: Focus Search, F4: Customer Select, F8: Checkout)
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, onOpenCustomerModal, onOpenPaymentModal]);

  // Autofocus search on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleAddItemToCart = (product) => {
    playBeepSound();
    addToCart(product, 1);
    setHighlightedCartId(product.id);
    setTimeout(() => setHighlightedCartId(null), 1200);
  };

  // Search Submission via Enter Key
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      const q = searchQuery.toLowerCase().trim();
      const matched = products.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode === q) ||
          (p.hsn && p.hsn === q)
      );

      if (matched) {
        handleAddItemToCart(matched);
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
      handleAddItemToCart(randomItem);
      setLastScannedItem(randomItem.name);
      setIsScanning(false);
      setTimeout(() => setLastScannedItem(null), 2500);
    }, 400);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCouponCode(couponInput);
    setCouponMsg(res.message);
    if (res.success) setCouponInput("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[calc(100vh-140px)] animate-fade-in">
      {/* ============================================================ */}
      {/* LEFT: THE SHELF — flush against the page, no card chrome.     */}
      {/* Flat, sharp-edged tiles read as counter/shelf signage rather  */}
      {/* than dashboard widgets.                                       */}
      {/* ============================================================ */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
        {/* Search & Scan Row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUnmatchedBarcode(null);
              }}
              onKeyDown={handleSearchSubmit}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-white text-slate-900 text-sm font-semibold pl-11 pr-24 py-3.5 rounded-lg border-2 border-slate-300 focus:border-[#1E3A5F] outline-none transition placeholder-slate-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-300 select-none">
              F2
            </span>
          </div>

          <div className="flex items-stretch gap-2">
            <button
              onClick={() => setWebcamModalOpen(true)}
              title="Scan with Mobile/Tablet Camera"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 rounded-lg font-bold text-xs bg-white border-2 border-slate-300 text-slate-700 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition active:scale-95 min-h-[48px]"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>

            <button
              onClick={simulateBarcodeScan}
              disabled={isScanning}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 rounded-lg font-extrabold text-sm transition-all active:scale-95 min-h-[48px] ${
                isScanning
                  ? "bg-[#F5A623] text-slate-950"
                  : "bg-[#1E3A5F] hover:bg-[#152a45] text-white"
              }`}
            >
              <ScanBarcode className={`w-5 h-5 ${isScanning ? "text-slate-950" : "text-[#F5A623]"}`} />
              <span className="whitespace-nowrap font-display">
                {isScanning ? "Scanning…" : t("simulateScanner")}
              </span>
            </button>
          </div>
        </div>

        {/* Inline status strip — one slot, one message at a time */}
        {stockWarningToast && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 px-4 py-2.5 rounded text-xs flex items-center gap-2 font-bold animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{stockWarningToast}</span>
          </div>
        )}

        {unmatchedBarcode && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 px-4 py-2.5 rounded text-xs flex items-center justify-between font-bold animate-fade-in gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="truncate">Barcode/Item '{unmatchedBarcode}' not found in inventory.</span>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-950 px-2.5 py-1 rounded font-mono font-black uppercase whitespace-nowrap">
              Add New Product
            </span>
          </div>
        )}

        {lastScannedItem && (
          <div className="bg-emerald-50 border-l-4 border-[#1FAA59] text-[#1FAA59] px-4 py-2.5 rounded text-xs flex items-center justify-between font-bold animate-fade-in">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#1FAA59]" />
              <span>
                Scanned: <strong className="text-slate-900">{lastScannedItem}</strong>
              </span>
            </div>
            <span className="text-[10px] bg-[#1FAA59] text-white px-2.5 py-0.5 rounded font-mono font-black">
              +1 ADDED
            </span>
          </div>
        )}

        {/* Category Rail — till function keys, not filter chips */}
        <div className="flex items-stretch gap-1.5 overflow-x-auto no-scrollbar border-b-2 border-slate-200 pb-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all min-h-[44px] border-b-[3px] -mb-[2px] ${
                  isSelected
                    ? "border-[#1E3A5F] text-[#1E3A5F]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product Shelf Grid — flat tiles, sharp corners, price is the loudest thing on each tile */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
              <Package className="w-12 h-12 mb-2 text-slate-300 stroke-[1.5]" />
              <p className="text-base font-bold text-[#1E3A5F] font-display">
                No Kirana items match '{searchQuery}'
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                const isOutOfStock = product.stock !== null && product.stock <= 0;
                const isLowStock =
                  product.stock !== null &&
                  product.stock > 0 &&
                  product.stock <= (product.minStockWarning || 5);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddItemToCart(product)}
                    className={`group relative bg-white border-2 rounded-lg p-3.5 flex flex-col justify-between select-none cursor-pointer transition-colors active:scale-[0.98] ${
                      isOutOfStock
                        ? "border-amber-300"
                        : cartItem
                        ? "border-[#1FAA59]"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-extrabold font-display text-slate-900 leading-snug line-clamp-2 flex-1">
                        {product.name}
                      </h4>
                      <span className="text-[9px] font-mono font-bold text-slate-400 whitespace-nowrap pt-0.5">
                        GST{product.gst}
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-lg font-black font-mono text-[#1E3A5F] leading-none">
                          ₹{product.retailPrice.toLocaleString("en-IN")}
                          <span className="text-[10px] font-sans font-normal text-slate-400">
                            /{product.unit}
                          </span>
                        </div>
                        <div className="text-[10px] mt-1 font-mono">
                          {isOutOfStock ? (
                            <span className="text-[#E64545] font-black uppercase">
                              Out of stock
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[#F5A623] font-bold">
                              {product.stock} {product.unit} left
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              {product.stock} {product.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {cartItem ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-0.5 bg-[#1FAA59] text-white rounded p-0.5"
                        >
                          <button
                            onClick={() => updateCartQty(product.id, cartItem.qty - 1)}
                            className="hover:bg-emerald-700 rounded transition min-w-[30px] h-8 flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-mono font-black px-1 min-w-[18px] text-center">
                            {cartItem.qty}
                          </span>
                          <button
                            onClick={() => handleAddItemToCart(product)}
                            className="hover:bg-emerald-700 rounded transition min-w-[30px] h-8 flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded bg-slate-100 group-hover:bg-[#1E3A5F] text-slate-500 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4 stroke-[2.5]" />
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
      {/* RIGHT: THE REGISTER — a dark ledger panel, the one bold thing */}
      {/* on the screen. Receipt-style dotted rules, amber LED total.   */}
      {/* ============================================================ */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
        <div className="flex-1 flex flex-col bg-[#0F1F35] rounded-xl overflow-hidden shadow-xl shadow-slate-900/20">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/10">
            <div>
              <h3 className="font-extrabold font-display text-white text-sm tracking-wide">
                {t("counterPOS")}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {cart.length} {t("itemsInCart")}
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-[11px] text-red-300 hover:text-red-200 px-2 py-1.5 rounded border border-red-400/30 hover:border-red-300/50 transition font-bold"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t("clearCart")}</span>
              </button>
            )}
          </div>

          {/* Customer strip */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#F5A623] flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono">
                {cartCustomer ? cartCustomer.name.charAt(0) : "C"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {cartCustomer ? cartCustomer.name : t("walkInCustomer")}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {cartCustomer
                    ? `${cartCustomer.loyaltyPoints || 0} pts · Udhaar ₹${cartCustomer.balance}`
                    : "No account linked"}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenCustomerModal}
              className="flex-shrink-0 px-2.5 py-2 rounded text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 min-h-[36px]"
            >
              {cartCustomer ? <UserCheck className="w-3.5 h-3.5 text-[#F5A623]" /> : <UserPlus className="w-3.5 h-3.5 text-[#F5A623]" />}
              <span>{cartCustomer ? "Change" : "F4"}</span>
            </button>
          </div>

          {/* Receipt tape — cart lines */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0 max-h-[280px] lg:max-h-none">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-slate-500 space-y-2">
                <Receipt className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-400">
                  Tap items on the shelf or scan a barcode
                </p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const isHighlighted = highlightedCartId === item.id;
                const isLowStockItem = item.stock !== null && item.stock <= (item.minStockWarning || 5);

                return (
                  <div
                    key={item.id}
                    className={`py-2.5 flex items-center justify-between gap-2 transition-colors duration-300 ${
                      idx !== 0 ? "border-t border-dashed border-white/15" : ""
                    } ${isHighlighted ? "bg-[#1FAA59]/15 -mx-4 px-4" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                        {isLowStockItem && (
                          <span className="text-[8px] bg-amber-400/20 text-amber-300 px-1 rounded font-mono font-bold whitespace-nowrap">
                            LOW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>₹{item.price}</span>
                        <span>×</span>
                        <span>{item.qty}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 bg-white/10 rounded p-0.5">
                      <button
                        onClick={() => updateCartQty(item.id, item.qty - 1)}
                        className="text-slate-300 hover:text-white rounded transition min-w-[26px] h-7 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateCartQty(item.id, Number(e.target.value))}
                        className="w-7 text-center text-[11px] font-mono font-black bg-transparent text-white outline-none"
                      />
                      <button
                        onClick={() => handleAddItemToCart(item)}
                        className="text-slate-300 hover:text-white rounded transition min-w-[26px] h-7 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[58px]">
                      <div className="text-xs font-black font-mono text-white">
                        ₹{item.total.toLocaleString("en-IN")}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-red-300 transition text-[9px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ledger footer + amber LED total */}
          {cart.length > 0 && (
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/10 bg-black/10">
              {/* Promo code */}
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2 pt-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded pl-8 pr-2 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none uppercase focus:border-[#F5A623]/60"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded min-h-[36px]"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className="text-[10px] font-bold text-sky-200 bg-sky-400/10 p-1.5 rounded border border-sky-400/20">
                  {couponMsg}
                </p>
              )}

              {cartCustomer && (cartCustomer.loyaltyPoints || 0) > 0 && (
                <label className="flex items-center justify-between bg-amber-400/10 border border-amber-400/20 p-2 rounded text-xs text-amber-200 cursor-pointer">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Redeem {cartCustomer.loyaltyPoints} pts (₹{cartCustomer.loyaltyPoints})</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={redeemedPoints > 0}
                    onChange={(e) => setRedeemedPoints(e.target.checked ? cartCustomer.loyaltyPoints : 0)}
                    className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                  />
                </label>
              )}

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400 font-mono">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-200">₹{cartSubtotal}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-red-300 font-bold font-mono">
                    <span>Discount</span>
                    <span>−₹{calculatedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[10px] font-mono">
                  <span>Taxable ₹{Math.round(cartTaxDetails.taxableAmount)}</span>
                  <span>CGST+SGST ₹{Math.round(cartTaxDetails.totalTax)}</span>
                </div>
              </div>

              {/* The one loud element on the whole screen */}
              <div className="pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    {t("grandTotal")}
                  </span>
                  <div className="text-4xl font-black font-mono text-[#F5A623] tracking-tight tabular-nums">
                    ₹{cartGrandTotal.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenPaymentModal}
                className="w-full flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black font-display py-4 rounded-lg transition-all active:scale-[0.98] min-h-[52px]"
              >
                <span>F8 CHECKOUT</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
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
    </div>
  );
};
