import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { WebcamBarcodeScannerModal } from "./WebcamBarcodeScannerModal";
import {
  Search,
  ScanBarcode,
  Camera,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  UserCheck,
  UserPlus,
  ArrowRight,
  Zap,
  Filter,
  Package,
  Receipt,
  Tag,
  Gift,
  AlertTriangle,
  CheckCircle,
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
  } catch (e) {
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
    activeVertical,
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

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category)),
  ];

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[calc(100vh-140px)] animate-fade-in">
      {/* LEFT COLUMN: ITEM SEARCH & PHYSICAL TILL TOUCH GRID (8 Cols on Desktop / 65% width) */}
      <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-col space-y-4 card-shadow">
        {/* Search & Barcode Scan Bar with F2 Shortcut Hint */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
              className="w-full bg-slate-50 text-slate-900 text-sm font-semibold pl-10 pr-20 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#1E3A5F] focus:bg-white outline-none transition placeholder-slate-400 shadow-xs"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded border border-slate-300 select-none">
              F2 Search
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Live Web Camera Barcode Scanner Trigger Button */}
            <button
              onClick={() => setWebcamModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold text-xs border border-slate-300 transition active:scale-95"
              title="Scan with Mobile/Tablet Camera"
            >
              <Camera className="w-4 h-4 text-[#1E3A5F]" />
              <span>Camera</span>
            </button>

            {/* Barcode Scanner Simulation Button */}
            <button
              onClick={simulateBarcodeScan}
              disabled={isScanning}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-md active:scale-95 ${
                isScanning
                  ? "bg-[#F5A623] text-slate-950 animate-scan"
                  : "bg-[#1E3A5F] hover:bg-[#152a45] text-white"
              }`}
            >
              <ScanBarcode className="w-5 h-5 text-[#F5A623]" />
              <span className="whitespace-nowrap font-display">
                {isScanning ? "Scanning..." : t("simulateScanner")}
              </span>
            </button>
          </div>
        </div>

        {/* Soft Stock Warning Toast Alert */}
        {stockWarningToast && (
          <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2 font-bold animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{stockWarningToast}</span>
          </div>
        )}

        {/* Unmatched Barcode Alert Banner (Non-blocking inline prompt) */}
        {unmatchedBarcode && (
          <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between font-bold animate-fade-in">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Barcode/Item '{unmatchedBarcode}' not found in inventory.</span>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-950 px-2.5 py-1 rounded-lg font-mono font-black uppercase">
              Add New Product in Stock
            </span>
          </div>
        )}

        {/* Scanned Success Toast Alert */}
        {lastScannedItem && (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-[#1FAA59] px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between font-bold animate-fade-in">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#1FAA59] animate-bounce" />
              <span>
                Scanned: <strong className="text-slate-900">{lastScannedItem}</strong>
              </span>
            </div>
            <span className="text-[10px] bg-[#1FAA59] text-white px-2.5 py-0.5 rounded-full font-mono font-black">
              +1 ADDED TO CART
            </span>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[44px] flex items-center ${
                  isSelected
                    ? "bg-[#1E3A5F] text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product Cards Touch Grid (44px Minimum Tap Targets) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
              <Package className="w-12 h-12 mb-2 text-slate-300 stroke-[1.5]" />
              <p className="text-base font-bold text-slate-700 font-display">
                No Kirana items match '{searchQuery}'
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
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
                    className={`group relative bg-white border-2 transition-all duration-150 rounded-2xl p-4 flex flex-col justify-between select-none card-shadow cursor-pointer active:scale-[0.98] ${
                      isOutOfStock
                        ? "border-amber-300 bg-amber-50/30"
                        : cartItem
                        ? "border-[#1FAA59] ring-2 ring-[#1FAA59]/30 bg-emerald-50/20"
                        : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                        {product.category}
                      </span>

                      <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                        GST {product.gst}%
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold font-display text-slate-900 group-hover:text-[#1E3A5F] transition line-clamp-2 leading-snug">
                      {product.name}
                    </h4>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <div className="text-base sm:text-lg font-black font-mono text-[#1E3A5F] flex items-baseline space-x-1">
                          <span>₹{product.retailPrice.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] font-sans font-normal text-slate-400">
                            /{product.unit}
                          </span>
                        </div>

                        <div className="text-[11px] mt-0.5 font-mono">
                          {isOutOfStock ? (
                            <span className="text-[#E64545] font-black uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              OUT OF STOCK ({product.stock})
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[#F5A623] font-bold">
                              Low Stock: {product.stock} {product.unit}
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Stock: {product.stock} {product.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper Buttons */}
                      <div className="flex items-center">
                        {cartItem ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center space-x-1 bg-[#1FAA59] text-white rounded-xl p-1 shadow-md"
                          >
                            <button
                              onClick={() => updateCartQty(product.id, cartItem.qty - 1)}
                              className="p-1 hover:bg-emerald-700 rounded-lg transition min-w-[32px] h-8 flex items-center justify-center font-bold"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono font-black px-1.5 min-w-[20px] text-center">
                              {cartItem.qty}
                            </span>
                            <button
                              onClick={() => handleAddItemToCart(product)}
                              className="p-1 hover:bg-emerald-700 rounded-lg transition min-w-[32px] h-8 flex items-center justify-center font-bold"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#1E3A5F] text-slate-700 group-hover:text-white flex items-center justify-center transition-all duration-150">
                            <Plus className="w-4 h-4 stroke-[2.5]" />
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

      {/* RIGHT COLUMN: RUNNING CART & LIVE GST TILL SUMMARY (4 Cols on Desktop / 35% width) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between space-y-4 card-shadow">
        {/* Cart Header & F4 Customer Linked Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 text-[#1FAA59] rounded-xl border border-emerald-100">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold font-display text-slate-900 text-base">
                  {t("counterPOS")} Cart
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {cart.length} {t("itemsInCart")}
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center space-x-1 text-xs text-[#E64545] hover:bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-200 transition font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t("clearCart")}</span>
              </button>
            )}
          </div>

          {/* Customer Account Selector Card (F4 Shortcut Hint) */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono">
                {cartCustomer ? cartCustomer.name.charAt(0) : "C"}
              </div>
              <div className="truncate">
                <p className="text-xs font-extrabold text-slate-900 truncate font-display">
                  {cartCustomer ? cartCustomer.name : t("walkInCustomer")}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {cartCustomer
                    ? `Loyalty: 🎁 ${cartCustomer.loyaltyPoints || 0} pts • Udhaar Bal: ₹${cartCustomer.balance}`
                    : "No customer account linked"}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCustomerModal}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-[#1E3A5F] hover:bg-[#152a45] text-white transition flex items-center space-x-1 shadow-xs min-h-[44px]"
            >
              {cartCustomer ? <UserCheck className="w-3.5 h-3.5 text-[#F5A623]" /> : <UserPlus className="w-3.5 h-3.5 text-[#F5A623]" />}
              <span>{cartCustomer ? "Change" : "F4 Customer"}</span>
            </button>
          </div>
        </div>

        {/* Cart Item Row Stream with Flash Highlight Effect */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[300px] lg:max-h-none">
          {cart.length === 0 ? (
            /* Empty Cart State */
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-2">
              <Receipt className="w-12 h-12 text-slate-300 stroke-[1.5]" />
              <div>
                <p className="text-sm font-bold text-slate-700 font-display">
                  Cart is Ready for Next Sale
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tap items on left till or scan barcode to add
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const isHighlighted = highlightedCartId === item.id;
              const isLowStockItem = item.stock !== null && item.stock <= (item.minStockWarning || 5);

              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-3 border transition-all duration-300 flex items-center justify-between gap-2 card-shadow ${
                    isHighlighted
                      ? "bg-emerald-100 border-[#1FAA59] ring-2 ring-[#1FAA59]"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h5 className="text-xs font-extrabold text-slate-900 truncate font-display">
                        {item.name}
                      </h5>
                      {isLowStockItem && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span className="text-[#1FAA59] font-bold">₹{item.price}</span>
                      <span>•</span>
                      <span>GST {item.gst}%</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                    <button
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="p-1 text-slate-700 hover:bg-slate-200 rounded-lg transition min-w-[32px] h-8 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateCartQty(item.id, Number(e.target.value))}
                      className="w-8 text-center text-xs font-mono font-black bg-transparent text-slate-900 outline-none"
                    />
                    <button
                      onClick={() => handleAddItemToCart(item)}
                      className="p-1 text-slate-700 hover:bg-slate-200 rounded-lg transition min-w-[32px] h-8 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[65px]">
                    <div className="text-xs font-black font-mono text-slate-900">
                      ₹{item.total.toLocaleString("en-IN")}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-600 transition text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Tax Summary & Loudest Grand Total Checkout Button */}
        {cart.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Promo (DIWALI10, FLAT200)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2 py-1.5 text-xs font-mono text-slate-900 outline-none uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#1E3A5F] text-white text-xs font-bold rounded-xl min-h-[44px]"
              >
                Apply
              </button>
            </form>

            {couponMsg && (
              <p className="text-[10px] font-bold text-indigo-700 bg-indigo-50 p-1.5 rounded-lg border border-indigo-200">
                {couponMsg}
              </p>
            )}

            {/* Loyalty Points Redemption Toggle */}
            {cartCustomer && (cartCustomer.loyaltyPoints || 0) > 0 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-xl text-xs text-amber-900">
                <span className="flex items-center space-x-1 font-bold">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>Redeem {cartCustomer.loyaltyPoints} Pts (₹{cartCustomer.loyaltyPoints})</span>
                </span>
                <input
                  type="checkbox"
                  checked={redeemedPoints > 0}
                  onChange={(e) => setRedeemedPoints(e.target.checked ? cartCustomer.loyaltyPoints : 0)}
                  className="w-5 h-5 accent-[#F5A623] cursor-pointer"
                />
              </div>
            )}

            {/* Live CGST & SGST Split Display */}
            <div className="space-y-1 text-xs pt-2 border-t border-slate-200">
              <div className="flex justify-between text-slate-600 font-mono">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
              </div>

              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-[#E64545] font-bold font-mono">
                  <span>Total Discount</span>
                  <span>- ₹{calculatedDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px] font-mono pt-1">
                <span>Taxable Base: ₹{Math.round(cartTaxDetails.taxableAmount)}</span>
                <span>CGST+SGST: ₹{Math.round(cartTaxDetails.totalTax)}</span>
              </div>
            </div>

            {/* Loudest Grand Total Display & F8 Checkout Trigger */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider font-display">
                  {t("grandTotal")}
                </span>
                <div className="text-3xl font-black font-mono text-slate-950 tracking-tight">
                  ₹{cartGrandTotal.toLocaleString("en-IN")}
                </div>
              </div>

              <button
                onClick={onOpenPaymentModal}
                className="flex items-center space-x-2 bg-[#F5A623] hover:bg-amber-500 text-slate-950 font-black font-display px-6 py-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] min-h-[52px]"
              >
                <span>F8 CHECKOUT</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
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
