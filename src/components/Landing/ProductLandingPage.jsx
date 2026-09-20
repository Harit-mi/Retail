import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useStore } from "../../context/useStore";
import { PrivacyPolicyModal } from "../Legal/PrivacyPolicyModal";
import {
  ArrowRight,
  Check,
  Plus,
  Minus,
  RotateCcw,
  Volume2,
  VolumeX,
  QrCode,
  CheckCircle2,
} from "lucide-react";

// Web Audio API Crisp Cash Register Beep
const playBeep = (freq = 880, duration = 0.08) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors if audio context blocked
  }
};

const playPaymentSuccessBeep = () => {
  playBeep(587.33, 0.09);
  setTimeout(() => playBeep(880, 0.12), 100);
};

const SAMPLE_PRODUCTS = [
  { id: "p1", name: "Aashirvaad Shudh Chakki Atta (5kg)", price: 245, gstRate: 5, category: "Grains" },
  { id: "p2", name: "Amul Pasteurised Butter (500g)", price: 275, gstRate: 12, category: "Dairy" },
  { id: "p3", name: "Tata Salt Vacuum Evaporated (1kg)", price: 28, gstRate: 5, category: "Spices" },
  { id: "p4", name: "Wagh Bakri Premium CTC Tea (500g)", price: 290, gstRate: 5, category: "Beverages" },
  { id: "p5", name: "Fortune Sunlite Sunflower Oil (1L)", price: 165, gstRate: 5, category: "Edible Oil" },
];

export const ProductLandingPage = () => {
  const { setActiveTab } = useStore();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [privacyModalTab, setPrivacyModalTab] = useState("privacy");

  // Audio Feedback Toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Interactive Playground State
  const [cart, setCart] = useState([
    { id: "p1", name: "Aashirvaad Shudh Chakki Atta (5kg)", price: 245, qty: 1, gstRate: 5 },
    { id: "p2", name: "Amul Pasteurised Butter (500g)", price: 275, qty: 1, gstRate: 12 },
  ]);
  const [paymentMode, setPaymentMode] = useState("cash"); // "cash" | "upi"
  const [tenderCash, setTenderCash] = useState(600);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const triggerBeep = (freq, dur) => {
    if (soundEnabled) playBeep(freq, dur);
  };

  const addToCart = (product) => {
    triggerBeep(880, 0.08);
    setPaymentSuccess(false);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    triggerBeep(delta > 0 ? 880 : 660, 0.06);
    setPaymentSuccess(false);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    triggerBeep(440, 0.1);
    setCart([]);
    setPaymentSuccess(false);
  };

  // Calculations
  const grossTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalTax = cart.reduce((sum, i) => {
    const itemTotal = i.price * i.qty;
    const taxPart = itemTotal - itemTotal / (1 + i.gstRate / 100);
    return sum + taxPart;
  }, 0);
  const taxableAmount = grossTotal - totalTax;
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const changeDue = Math.max(0, tenderCash - grossTotal);

  // Simulate Payment
  const handleSimulatePayment = () => {
    if (cart.length === 0) return;
    if (soundEnabled) playPaymentSuccessBeep();
    setPaymentSuccess(true);
    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.8 },
        colors: ["#18181b", "#059669", "#71717a"],
      });
    } catch {
      // Ignore confetti error if blocked
    }
  };

  const openLegal = (tab) => {
    setPrivacyModalTab(tab);
    setIsPrivacyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans antialiased">
      {/* 1. MINIMALIST STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight font-display text-zinc-950">
              DUKAAN<span className="text-zinc-400 font-normal">POS</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Local Engine v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-600">
            <a href="#playground" className="hover:text-zinc-950 transition-colors">
              Interactive Demo
            </a>
            <a href="#pricing" className="hover:text-zinc-950 transition-colors">
              Pricing
            </a>
            <button
              onClick={() => openLegal("privacy")}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              DPDP 2023 Privacy
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={soundEnabled ? "Mute Cash Register Beeps" : "Enable Sound"}
              className="p-1.5 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
            </button>

            <button
              onClick={() => setActiveTab("pos")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] rounded-md transition-all cursor-pointer shadow-xs"
            >
              <span>Open Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. AIRY EDITORIAL HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Focused Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-medium text-zinc-700 bg-zinc-100 border border-zinc-200/80 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>100% Offline Core</span>
              <span className="text-zinc-300">/</span>
              <span>DPDP 2023 Statutory Privacy</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.08] font-display">
              Pure retail checkout. Fast, offline, private.
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl font-normal">
              Engineered for high-throughput retail counters. Instant barcode lookup with local SQLite, driverless thermal ESC/POS printing, and zero cloud lag.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => setActiveTab("pos")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <span>Launch Billing Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#playground"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-all border border-zinc-200/90 bg-white"
              >
                <span>Try Live Demo</span>
              </a>
            </div>

            <div className="pt-2 flex items-center gap-6 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>WebCrypto AES-256</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>0ms Cloud Lag</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>ESC/POS Thermal</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Tactile Thermal Receipt Preview */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl shadow-sm p-6 font-mono text-xs text-zinc-800 space-y-4">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-300">
                <div className="font-bold text-sm text-zinc-950 tracking-wider">DUKAAN SUPERMARKET</div>
                <div className="text-[10px] text-zinc-500">GSTIN: 27AAAAA0000A1Z5 · REG-01</div>
                <div className="text-[10px] text-zinc-400">INVOICE #9812 · CASHIER: VIKRAM</div>
              </div>

              <div className="space-y-2.5 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-zinc-900">Aashirvaad Atta (5kg)</div>
                    <div className="text-[10px] text-zinc-400">HSN: 1101 · GST 5%</div>
                  </div>
                  <div className="text-right font-medium">1 × ₹245.00</div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-zinc-900">Amul Butter (500g)</div>
                    <div className="text-[10px] text-zinc-400">HSN: 0405 · GST 12%</div>
                  </div>
                  <div className="text-right font-medium">1 × ₹275.00</div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-zinc-900">Tata Salt (1kg)</div>
                    <div className="text-[10px] text-zinc-400">HSN: 2501 · GST 5%</div>
                  </div>
                  <div className="text-right font-medium">1 × ₹28.00</div>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-zinc-300 space-y-1 text-[11px] text-zinc-600">
                <div className="flex justify-between">
                  <span>Taxable Amount</span>
                  <span>₹513.56</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST + SGST (Combined)</span>
                  <span>₹34.44</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-900">
                  <span>GRAND TOTAL</span>
                  <span className="text-base">₹548.00</span>
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="pt-3 text-center space-y-1">
                <div className="flex justify-center items-center h-7 gap-[1.5px] px-4 py-1 bg-zinc-50 border border-zinc-100 rounded">
                  {[1, 2, 1, 3, 1, 1, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2, 4, 1, 2, 1, 3, 1, 2].map((w, i) => (
                    <span
                      key={i}
                      className="h-5 bg-zinc-900 inline-block"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <div className="text-[9px] text-zinc-400 tracking-widest">*INV-2026-9812*</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE CORE PROOF METRICS STRIP */}
      <section className="border-y border-zinc-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            <div className="space-y-1.5 md:pr-8">
              <div className="text-3xl font-bold font-mono text-zinc-950 tracking-tight">&lt; 2ms</div>
              <div className="text-sm font-semibold text-zinc-900">Local SKU Search</div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Indexed in-memory B-Trees execute barcode lookups in milliseconds. Zero cloud lag.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:px-8 space-y-1.5">
              <div className="text-3xl font-bold font-mono text-zinc-950 tracking-tight">100%</div>
              <div className="text-sm font-semibold text-zinc-900">Offline Resilience</div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Never frozen by broadband dropouts. Transactions commit straight to counter hardware.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:pl-8 space-y-1.5">
              <div className="text-3xl font-bold font-mono text-zinc-950 tracking-tight">DPDP 2023</div>
              <div className="text-sm font-semibold text-zinc-900">On-Premise Privacy</div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Customer mobile numbers and ledgers stay on your counter with AES-GCM-256 encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE REGISTER PLAYGROUND */}
      <section id="playground" className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-xl mb-10 space-y-2">
          <div className="text-xs font-mono font-semibold tracking-wider uppercase text-zinc-500">
            Live Terminal Playground
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-display">
            Experience the checkout speed.
          </h2>
          <p className="text-sm text-zinc-600">
            Click items to simulate scanning. Notice the instant subtotal math, tax calculation, and cash change calculation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item Catalog (Left) */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider pb-1">
              Click Item to Scan Into Till:
            </div>

            {SAMPLE_PRODUCTS.map((prod) => (
              <button
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="w-full p-3.5 border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99] rounded-lg text-left flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-950">
                    {prod.name}
                  </div>
                  <div className="text-xs font-mono text-zinc-400">
                    {prod.category} · GST {prod.gstRate}%
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-zinc-900">
                    ₹{prod.price}
                  </span>
                  <span className="w-6 h-6 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Receipt & Tender Box (Right) */}
          <div className="lg:col-span-6">
            <div className="border border-zinc-200 bg-white rounded-xl p-5 font-mono text-xs space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div>
                  <div className="font-bold text-zinc-900">COUNTER RECEIPT TAPE</div>
                  <div className="text-[11px] text-zinc-400">POS-01 // CASH TILL</div>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-zinc-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-10 text-center text-zinc-400 text-xs">
                  Cart is empty. Click any item on the left to test.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {/* Cart rows */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex-1 pr-2 truncate">
                          <div className="font-medium text-zinc-900 truncate">{item.name}</div>
                          <div className="text-[11px] text-zinc-400">₹{item.price} each · GST {item.gstRate}%</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-5 h-5 rounded border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-100 cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-4 text-center font-bold text-zinc-900">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-5 h-5 rounded border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-100 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-16 text-right font-bold text-zinc-900">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="pt-3 border-t border-dashed border-zinc-300 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Items: {itemCount} units</span>
                      <span>Taxable: ₹{taxableAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Combined GST:</span>
                      <span>₹{totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                      <span>NET PAYABLE:</span>
                      <span className="text-base">₹{grossTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quick Payment Tender Simulation */}
                  <div className="pt-2 border-t border-zinc-200 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>TENDER METHOD:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPaymentMode("cash")}
                          className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                            paymentMode === "cash" ? "bg-zinc-950 text-white font-bold" : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          Cash
                        </button>
                        <button
                          onClick={() => setPaymentMode("upi")}
                          className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                            paymentMode === "upi" ? "bg-emerald-600 text-white font-bold" : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          UPI QR
                        </button>
                      </div>
                    </div>

                    {paymentMode === "cash" ? (
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <span className="text-zinc-600">Tender ₹{tenderCash}:</span>
                          <span className="ml-2 font-bold text-emerald-700">Change Due: ₹{changeDue.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-1">
                          {[500, 1000].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setTenderCash(amt)}
                              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                                tenderCash === amt ? "bg-zinc-900 text-white" : "bg-white border border-zinc-300"
                              }`}
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-emerald-900">Scan UPI Dynamic QR</div>
                          <div className="text-[10px] text-emerald-700">GPay, PhonePe, Paytm</div>
                        </div>
                        <QrCode className="w-6 h-6 text-emerald-800" />
                      </div>
                    )}

                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={handleSimulatePayment}
                        className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{paymentSuccess ? "Payment Settled ✓" : "Settle Bill"}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("pos")}
                        className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer border border-zinc-200"
                      >
                        <span>Open Live Terminal</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENT PRICING */}
      <section id="pricing" className="border-t border-zinc-200/80 bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-xl mb-12 space-y-2">
            <div className="text-xs font-mono font-semibold tracking-wider uppercase text-zinc-500">
              Fair Pricing
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-display">
              Honest retail terms. No lock-in.
            </h2>
            <p className="text-sm text-zinc-600">
              You own your billing terminal. The local standalone core is free and runs indefinitely on your counter without subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            {/* Local Free */}
            <div className="p-7 border border-zinc-200 bg-[#FAFAF9] rounded-xl space-y-5">
              <div className="space-y-1">
                <div className="inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-600 bg-white rounded border border-zinc-200">
                  Single Counter
                </div>
                <h3 className="text-xl font-bold text-zinc-950 font-display">Local Core</h3>
                <p className="text-xs text-zinc-500">For standalone kiranas, pharmacies, and single retail counters.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-zinc-950">₹0</span>
                <span className="text-xs text-zinc-500 font-medium">/ forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited invoices and SKU items</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% Offline SQLite local storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ESC/POS thermal printer driver support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Local Udhaar Khata ledger</span>
                </li>
              </ul>

              <button
                onClick={() => setActiveTab("pos")}
                className="w-full py-2.5 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-100 active:scale-[0.98] rounded-lg transition-all cursor-pointer border border-zinc-200 shadow-2xs"
              >
                Start Billing Free
              </button>
            </div>

            {/* Pro Sync */}
            <div className="p-7 border-2 border-zinc-900 bg-white rounded-xl space-y-5 relative shadow-xs">
              <div className="space-y-1">
                <div className="inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-white bg-zinc-900 rounded">
                  Multi-Device Retail
                </div>
                <h3 className="text-xl font-bold text-zinc-950 font-display">Multi-Counter Sync</h3>
                <p className="text-xs text-zinc-500">For multi-till supermarkets, apparel chains, and branch outlets.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-zinc-950">₹499</span>
                <span className="text-xs text-zinc-500 font-medium">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Everything in Local Core</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time multi-counter inventory sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Encrypted automated daily cloud backups</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>One-click WhatsApp payment reminders</span>
                </li>
              </ul>

              <button
                onClick={() => setActiveTab("pos")}
                className="w-full py-2.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-lg transition-all cursor-pointer shadow-xs"
              >
                Get Started with Sync
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REFINED EDITORIAL FOOTER */}
      <footer className="border-t border-zinc-200 bg-[#FAFAF9] py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-200/80">
            <div className="space-y-1">
              <div className="font-bold text-base tracking-tight font-display text-zinc-950">
                DUKAAN<span className="text-zinc-400 font-normal">POS</span>
              </div>
              <p className="text-xs text-zinc-500 max-w-sm">
                Local-first point of sale software for independent retailers across India.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-600">
              <button
                onClick={() => openLegal("privacy")}
                className="hover:text-zinc-950 transition-colors cursor-pointer"
              >
                Privacy (DPDP 2023)
              </button>
              <button
                onClick={() => openLegal("terms")}
                className="hover:text-zinc-950 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                onClick={() => openLegal("refund")}
                className="hover:text-zinc-950 transition-colors cursor-pointer"
              >
                Refund Policy
              </button>
              <button
                onClick={() => openLegal("dpo")}
                className="hover:text-zinc-950 transition-colors cursor-pointer"
              >
                DPO Grievance
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
            <div>© {new Date().getFullYear()} DukaanPOS Retail Technologies. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Local Encryption: AES-GCM-256</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Statutory DPDP 2023 Privacy & Legal Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        initialTab={privacyModalTab}
      />
    </div>
  );
};
