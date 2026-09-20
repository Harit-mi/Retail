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
  Zap,
  Printer,
  ShieldCheck,
  Send,
  Volume2,
  VolumeX,
  Scale,
  QrCode,
  Sparkles,
  CheckCircle2,
  Sliders,
  Clock,
  TrendingUp,
  Lock,
} from "lucide-react";

// Web Audio API Crisp Cash Register Beep Synthesizer
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
  playBeep(587.33, 0.09); // D5
  setTimeout(() => playBeep(880, 0.14), 90); // A5
  setTimeout(() => playBeep(1174.66, 0.18), 200); // D6
};

const SAMPLE_PRODUCTS = [
  { id: "p1", ean: "8901030383854", name: "Aashirvaad Shudh Chakki Atta (5kg)", price: 245, gstRate: 5, category: "Grains" },
  { id: "p2", ean: "8901262010053", name: "Amul Pasteurised Butter (500g)", price: 275, gstRate: 12, category: "Dairy" },
  { id: "p3", ean: "8901058852653", name: "Tata Salt Vacuum Evaporated (1kg)", price: 28, gstRate: 5, category: "Spices" },
  { id: "p4", ean: "8901112000210", name: "Wagh Bakri Premium CTC Tea (500g)", price: 290, gstRate: 5, category: "Beverages" },
  { id: "p5", ean: "8906007280121", name: "Fortune Sunlite Refined Sunflower Oil (1L)", price: 165, gstRate: 5, category: "Edible Oil" },
  { id: "p6", ean: "8901248100143", name: "Dettol Antiseptic Liquid (250ml)", price: 140, gstRate: 18, category: "Personal Care" },
];

export const ProductLandingPage = () => {
  const { setActiveTab } = useStore();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [privacyModalTab, setPrivacyModalTab] = useState("privacy");

  // Audio Beep Toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Interactive Playground State
  const [cart, setCart] = useState([
    { id: "p1", ean: "8901030383854", name: "Aashirvaad Shudh Chakki Atta (5kg)", price: 245, qty: 1, gstRate: 5 },
    { id: "p2", ean: "8901262010053", name: "Amul Pasteurised Butter (500g)", price: 275, qty: 1, gstRate: 12 },
  ]);
  const [paymentMode, setPaymentMode] = useState("cash"); // "cash" | "upi" | "khata"
  const [tenderCash, setTenderCash] = useState(600);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Funky Savings Calculator Slider State
  const [dailyBills, setDailyBills] = useState(250);

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

  // Simulate Payment with celebratory confetti
  const handleSimulatePayment = () => {
    if (cart.length === 0) return;
    if (soundEnabled) playPaymentSuccessBeep();
    setPaymentSuccess(true);
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#CEDB8C", "#0B2B1E", "#FF6B4A", "#10B981"],
      });
    } catch {
      // Ignore confetti if blocked
    }
  };

  // Savings math
  // Average cloud roundtrip delay: ~1.8s per scan/bill
  const monthlySecondsSaved = dailyBills * 1.8 * 30;
  const monthlyHoursSaved = (monthlySecondsSaved / 3600).toFixed(1);
  const annualSaaSSaved = 18000;

  const openLegal = (tab) => {
    setPrivacyModalTab(tab);
    setIsPrivacyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-zinc-900 selection:bg-[#CEDB8C] selection:text-[#0B2B1E] font-sans antialiased overflow-x-hidden">
      {/* RETRO-MODERN GRAPH PAPER / GEOMETRIC GRID TEXTURE */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.4] z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e7e7e2 1px, transparent 1px), linear-gradient(to bottom, #e7e7e2 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 1. RESTROIQ-INSPIRED FLOATING CAPSULE HEADER */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto max-w-5xl w-full bg-white/85 backdrop-blur-xl border border-zinc-200/90 shadow-md shadow-zinc-200/40 rounded-full px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tighter font-display text-zinc-950 flex items-center gap-1">
              DUKAAN<span className="bg-[#CEDB8C] text-[#0B331A] px-1.5 py-0.5 rounded-md text-xs font-mono font-bold tracking-normal">POS</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Local Engine v1.2
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
            <a href="#features" className="hover:text-zinc-950 transition-colors">
              Features
            </a>
            <a href="#calculator" className="hover:text-zinc-950 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Savings</span>
            </a>
            <a href="#playground" className="hover:text-zinc-950 transition-colors">
              Live Counter
            </a>
            <a href="#pricing" className="hover:text-zinc-950 transition-colors">
              Pricing
            </a>
            <button
              onClick={() => openLegal("privacy")}
              className="hover:text-zinc-950 transition-colors cursor-pointer"
            >
              DPDP Privacy
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Audio Feedback Toggle */}
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={soundEnabled ? "Mute Register Beeps" : "Enable Sound"}
              className="p-2 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-transform active:scale-90 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-400" />}
            </button>

            {/* Bouncy CTA */}
            <button
              onClick={() => setActiveTab("pos")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0B331A] bg-[#CEDB8C] hover:bg-[#d5e495] active:scale-95 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <span>Open Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      </div>

      {/* 2. HIGH-ENERGY FUNKY HERO SECTION */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        {/* Floating Playful Stickers (RestroIQ / BottlePOS style) */}
        <div className="hidden lg:block absolute top-36 right-10 z-20 rotate-6 hover:rotate-0 transition-transform cursor-default">
          <div className="bg-[#0B2B1E] text-[#CEDB8C] border-2 border-[#CEDB8C] px-3.5 py-1.5 rounded-2xl shadow-lg font-mono text-xs font-bold flex items-center gap-1.5">
            <span>🖨️ ESC/POS 80mm Native</span>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-24 left-6 z-20 -rotate-6 hover:rotate-0 transition-transform cursor-default">
          <div className="bg-white text-zinc-900 border-2 border-zinc-900 px-3.5 py-1.5 rounded-2xl shadow-lg font-mono text-xs font-bold flex items-center gap-1.5">
            <span className="text-emerald-600">⚡</span>
            <span>&lt; 2ms In-Memory Search</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          {/* Social Proof Avatars Stack */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 bg-white border border-zinc-200/90 rounded-full shadow-2xs">
            <div className="flex -space-x-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-xs">👨‍💼</span>
              <span className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs">👩‍🍳</span>
              <span className="w-7 h-7 rounded-full bg-sky-100 border-2 border-white flex items-center justify-center text-xs">👨‍🌾</span>
              <span className="w-7 h-7 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs">🧑‍💼</span>
            </div>
            <span className="text-xs font-semibold text-zinc-700">
              Trusted by <span className="font-bold text-zinc-950">2,400+</span> retail counters
            </span>
          </div>

          {/* Huge Funky Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.05] font-display">
            The{" "}
            <span className="relative inline-block bg-[#CEDB8C] text-[#0B331A] px-4 py-1 rounded-2xl -rotate-2 shadow-sm font-black">
              ridiculously fast
            </span>{" "}
            local POS for Indian retail.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-zinc-600 max-w-2xl font-normal leading-relaxed">
            No cloud buffering. Zero frozen screens during rush hour. Instant barcode scanning with on-premise SQLite, razor-sharp thermal receipts, and 1-touch WhatsApp Udhaar.
          </p>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab("pos")}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-[#CEDB8C] bg-[#0B2B1E] hover:bg-[#123524] active:scale-95 rounded-full transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <Zap className="w-5 h-5 text-[#CEDB8C]" />
              <span>Launch Billing Terminal</span>
              <ArrowRight className="w-4 h-4 text-[#CEDB8C]" />
            </button>

            <a
              href="#playground"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-zinc-900 hover:text-black hover:bg-zinc-100 active:scale-95 rounded-full transition-all border-2 border-zinc-900 bg-white shadow-xs"
            >
              <span>🎮 Test Live Till Simulator</span>
            </a>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-6 text-xs text-zinc-600 font-mono font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Offline Core</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>DPDP 2023 Statutory Shield</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>₹0 Standalone Forever</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. INTEGRATIONS & HARDWARE RAILS TICKER */}
      <section className="relative z-10 border-y-2 border-zinc-900 bg-[#CEDB8C] py-4 overflow-hidden">
        <div className="flex items-center gap-8 justify-around text-xs font-mono font-black text-[#0B331A] tracking-wider uppercase flex-wrap px-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0B331A]"></span>
            <span>⚡ NPCI DYNAMIC UPI QR</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0B331A]"></span>
            <span>💬 WHATSAPP KHATA API</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0B331A]"></span>
            <span>🖨️ RAW ESC/POS 58MM &amp; 80MM</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0B331A]"></span>
            <span>🏷️ TVS &amp; HONEYWELL LASER GUNS</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0B331A]"></span>
            <span>⚖️ RS-232 WEIGHING SCALES</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0B331A]"></span>
            <span>🏛️ GSTR-1 CSV AUDIT</span>
          </span>
        </div>
      </section>

      {/* 4. FUNKY BENTO GRID (RestroIQ & BottlePOS Vibe) */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-block px-3 py-1 bg-zinc-100 border border-zinc-300 rounded-full text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider">
            Engineered for Retail Reality
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 font-display">
            Why smart shopkeepers ditch clunky cloud POS.
          </h2>
          <p className="text-base text-zinc-600">
            Cloud systems choke the second the internet wobbles. DukaanPOS runs 100% locally on your counter device and treats the internet as optional.
          </p>
        </div>

        {/* The Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Card 1: Huge Forest Green Card */}
          <div className="md:col-span-8 bg-[#0B2B1E] text-white rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-between border-2 border-zinc-950 shadow-md">
            <div className="space-y-4 max-w-lg z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#CEDB8C] text-[#0B331A] rounded-full text-xs font-mono font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Zero Cloud Dependency</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                When the WiFi dies, your counter doesn't.
              </h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Transactions, barcode searches, and tax math commit directly to in-memory SQLite tables in under 2 milliseconds. You can bill customers during a 3-day broadband outage without missing a single rupee.
              </p>
            </div>

            <div className="pt-8 flex items-center gap-4 z-10">
              <div className="p-3 rounded-2xl bg-[#123524] border border-emerald-900/60 font-mono text-xs text-[#CEDB8C]">
                <code>LOCAL_LATENCY: 0.84ms // OFFLINE_SAFE</code>
              </div>
              <span className="text-xs text-zinc-400 font-mono">100% On-Premise Resilience</span>
            </div>

            {/* Background Decorative Circle */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#123524] opacity-50 blur-2xl pointer-events-none" />
          </div>

          {/* Bento Card 2: Electric Citron Card */}
          <div className="md:col-span-4 bg-[#CEDB8C] text-[#0B331A] rounded-3xl p-8 flex flex-col justify-between border-2 border-zinc-950 shadow-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B2B1E] text-[#CEDB8C] flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold font-display leading-snug">
                Driverless Thermal ESC/POS.
              </h3>
              <p className="text-xs sm:text-sm text-[#1b4329] leading-relaxed">
                Dispatches raw ESC/POS binary streams directly over WebUSB and Bluetooth. Instant paper cuts without browser print preview dialog delays.
              </p>
            </div>

            <div className="pt-6 font-mono text-xs font-bold text-[#0B331A] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#0B331A]" />
              <span>58mm &amp; 80mm Autocut Support</span>
            </div>
          </div>

          {/* Bento Card 3: Crisp White Card - WhatsApp Udhaar */}
          <div className="md:col-span-4 bg-white rounded-3xl p-8 flex flex-col justify-between border-2 border-zinc-200 hover:border-zinc-950 transition-colors shadow-sm">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold font-display text-zinc-950">
                1-Touch WhatsApp Khata.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Generate polite, itemized WhatsApp payment reminder links pre-filled with the customer’s pending balance and dynamic UPI intent strings.
              </p>
            </div>

            <div className="pt-6 font-mono text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Zero SMS fees · Instant payment links</span>
            </div>
          </div>

          {/* Bento Card 4: DPDP Statutory Privacy */}
          <div className="md:col-span-4 bg-[#FFF8EE] border-2 border-amber-900/20 rounded-3xl p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold font-display text-amber-950">
                DPDP 2023 Statutory Privacy.
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                Your customer contact list and store margins are encrypted locally with WebCrypto AES-GCM-256. Zero cloud telemetry. Zero data brokering.
              </p>
            </div>

            <div className="pt-6 font-mono text-xs text-amber-900 font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Full statutory compliance Section 5 &amp; 8</span>
            </div>
          </div>

          {/* Bento Card 5: Hardware Harmony */}
          <div className="md:col-span-4 bg-zinc-950 text-white rounded-3xl p-8 flex flex-col justify-between border-2 border-zinc-950 shadow-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-emerald-400 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold font-display">
                Plug &amp; Play Hardware.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Connects to standard TVS, Epson, NGX, and Honeywell barcode guns. Automatic RS-232 serial weight streaming for loose kirana pulses.
              </p>
            </div>

            <div className="pt-6 font-mono text-xs text-[#CEDB8C] font-semibold flex items-center gap-1.5">
              <span>RJ11 Cash Drawer auto-pulse</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE RETAIL SAVINGS CALCULATOR */}
      <section id="calculator" className="relative z-10 border-y-2 border-zinc-900 bg-white py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-mono font-bold uppercase">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive ROI Calculator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display">
              Calculate your counter time &amp; cash saved.
            </h2>
            <p className="text-sm text-zinc-600">
              Drag the slider to your daily checkout volume. See how much time local-first architecture puts back into your day.
            </p>
          </div>

          {/* The Interactive Slider Card */}
          <div className="p-8 md:p-12 bg-[#FBFBF9] border-2 border-zinc-900 rounded-3xl shadow-md space-y-10">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-bold font-mono uppercase text-zinc-700">
                  Daily Bills Generated at Counter:
                </label>
                <span className="text-3xl font-black font-mono text-zinc-950 bg-[#CEDB8C] px-3.5 py-1 rounded-xl border border-zinc-900 shadow-2xs">
                  {dailyBills} bills / day
                </span>
              </div>

              {/* Slider Control */}
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={dailyBills}
                onChange={(e) => setDailyBills(Number(e.target.value))}
                className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0B2B1E]"
              />

              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>50 (Cozy Kirana)</span>
                <span>500 (Busy Grocery)</span>
                <span>1,500 (High-Throughput Supermarket)</span>
              </div>
            </div>

            {/* Real-time Math Output Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t-2 border-zinc-900">
              <div className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-1">
                <div className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Time Saved / Mo</span>
                </div>
                <div className="text-3xl font-black font-mono text-zinc-950">
                  {monthlyHoursSaved} hrs
                </div>
                <div className="text-[11px] text-zinc-400">
                  Saved from eliminated 1.8s cloud roundtrips
                </div>
              </div>

              <div className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-1">
                <div className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SaaS Fees Kept</span>
                </div>
                <div className="text-3xl font-black font-mono text-emerald-700">
                  ₹{annualSaaSSaved.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Annual cloud subscription tax avoided
                </div>
              </div>

              <div className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-1">
                <div className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rush Clearance</span>
                </div>
                <div className="text-3xl font-black font-mono text-zinc-950">
                  +42% Fast
                </div>
                <div className="text-[11px] text-zinc-400">
                  Zero customer dropouts in peak evening rush
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE REGISTER PLAYGROUND */}
      <section id="playground" className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#CEDB8C] text-[#0B331A] rounded-full text-xs font-mono font-bold uppercase">
            <span>🎮 Hands-On Register Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display">
            Feel the local arithmetic in your fingers.
          </h2>
          <p className="text-base text-zinc-600">
            Click any FMCG item to simulate a barcode gun strike. Notice the audio confirmation, instant subtotal computation, and cash change math.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Catalog (Left) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider pb-1">
              Click Item to Scan Into Counter Till:
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SAMPLE_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="p-3.5 border-2 border-zinc-200 bg-white hover:border-zinc-900 hover:bg-zinc-50 active:scale-[0.99] rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div>
                    <div className="text-sm font-bold text-zinc-900 group-hover:text-black">
                      {prod.name}
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      {prod.category} · GST {prod.gstRate}% · EAN: {prod.ean.slice(-4)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-zinc-900">
                      ₹{prod.price}
                    </span>
                    <span className="w-7 h-7 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-700 group-hover:bg-[#0B2B1E] group-hover:text-[#CEDB8C] transition-colors">
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Realistic Receipt & Tender Box (Right) */}
          <div className="lg:col-span-6">
            <div className="border-2 border-zinc-900 bg-white rounded-3xl p-6 font-mono text-xs space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900">
                <div>
                  <div className="font-extrabold text-sm text-zinc-950">DUKAAN RETAIL // TILL-01</div>
                  <div className="text-[11px] text-zinc-400">ENGINE: IN-MEMORY B-TREE</div>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-zinc-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  Till empty. Click any item on the left to scan.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart rows */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex-1 pr-2 truncate">
                          <div className="font-semibold text-zinc-900 truncate">{item.name}</div>
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
                          <span className="w-16 text-right font-extrabold text-zinc-900">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="pt-3 border-t border-dashed border-zinc-300 space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Units Count:</span>
                      <span>{itemCount} items</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Taxable Value:</span>
                      <span>₹{taxableAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Combined GST (CGST + SGST):</span>
                      <span>₹{totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t-2 border-zinc-900">
                      <span>NET AMOUNT:</span>
                      <span className="text-lg">₹{grossTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Simulator */}
                  <div className="pt-2 border-t-2 border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>TENDER PROTOCOL:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setPaymentMode("cash")}
                          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            paymentMode === "cash" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          Cash
                        </button>
                        <button
                          onClick={() => setPaymentMode("upi")}
                          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            paymentMode === "upi" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          UPI QR
                        </button>
                      </div>
                    </div>

                    {paymentMode === "cash" ? (
                      <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-bold">Cash Tendered:</span>
                          <div className="flex gap-1">
                            {[grossTotal, 500, 1000, 2000].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => setTenderCash(amt)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                                  tenderCash === amt ? "bg-zinc-900 text-[#CEDB8C]" : "bg-white border border-zinc-300 text-zinc-700"
                                }`}
                              >
                                ₹{amt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="font-bold text-zinc-800">Change to Return to Customer:</span>
                          <span className="font-mono text-sm font-black text-emerald-700">
                            ₹{changeDue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-extrabold text-emerald-950">Dynamic UPI QR Intent</div>
                          <div className="text-[11px] text-emerald-800">Scan with GPay, PhonePe, Paytm, BHIM</div>
                        </div>
                        <div className="w-10 h-10 bg-white border border-emerald-300 rounded-xl flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-emerald-800" />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={handleSimulatePayment}
                        className="flex-1 py-3 bg-[#0B2B1E] hover:bg-[#123524] text-[#CEDB8C] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#CEDB8C]" />
                        <span>{paymentSuccess ? "Payment Settled ✓" : "Settle Counter Bill"}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("pos")}
                        className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-300"
                      >
                        <span>Open Live POS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="relative z-10 border-t-2 border-zinc-900 bg-white py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <div className="inline-block px-3 py-1 bg-zinc-100 border border-zinc-300 rounded-full text-xs font-mono font-bold text-zinc-700 uppercase">
              Transparent &amp; Fair
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-display">
              Honest retail terms. Zero surprises.
            </h2>
            <p className="text-base text-zinc-600">
              You own your billing counter. The standalone core runs indefinitely on your hardware without any subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Plan 1: Local Free */}
            <div className="p-8 md:p-10 border-2 border-zinc-200 bg-[#FBFBF9] rounded-3xl space-y-6">
              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 text-[11px] font-mono font-bold text-zinc-700 bg-white rounded-md border border-zinc-300">
                  Single Counter
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-950 font-display">Local Core</h3>
                <p className="text-xs text-zinc-500">For standalone kiranas, chemists, and boutique retail counters.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-mono text-zinc-950">₹0</span>
                <span className="text-xs text-zinc-500 font-bold">/ forever</span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited bills and SKU catalog</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Offline in-memory SQLite</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ESC/POS thermal printing &amp; barcode gun support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Customer Udhaar Khata ledger</span>
                </li>
              </ul>

              <button
                onClick={() => setActiveTab("pos")}
                className="w-full py-3 text-xs font-bold text-zinc-900 bg-white hover:bg-zinc-100 active:scale-95 rounded-full transition-all cursor-pointer border-2 border-zinc-900 shadow-2xs"
              >
                Start Billing Free
              </button>
            </div>

            {/* Plan 2: Pro Sync */}
            <div className="p-8 md:p-10 border-2 border-zinc-950 bg-[#0B2B1E] text-white rounded-3xl space-y-6 relative shadow-lg">
              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#0B331A] bg-[#CEDB8C] rounded-md">
                  Multi-Till Retail
                </div>
                <h3 className="text-2xl font-extrabold font-display text-white">Multi-Counter Sync</h3>
                <p className="text-xs text-zinc-300">For multi-till supermarkets, departmental chains, and branch outlets.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-mono text-[#CEDB8C]">₹499</span>
                <span className="text-xs text-zinc-300 font-bold">/ month</span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#CEDB8C] shrink-0" />
                  <span>Everything in Local Core</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#CEDB8C] shrink-0" />
                  <span>Multi-till real-time stock sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#CEDB8C] shrink-0" />
                  <span>Automated daily encrypted cloud backups</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#CEDB8C] shrink-0" />
                  <span>1-click WhatsApp payment reminders</span>
                </li>
              </ul>

              <button
                onClick={() => setActiveTab("pos")}
                className="w-full py-3 text-xs font-bold text-[#0B331A] bg-[#CEDB8C] hover:bg-[#d5e495] active:scale-95 rounded-full transition-all cursor-pointer shadow-xs"
              >
                Get Started with Sync
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RESTROIQ-INSPIRED FOOTER */}
      <footer className="relative z-10 border-t-2 border-zinc-900 bg-[#FBFBF9] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-zinc-300">
            <div className="space-y-2">
              <div className="font-black text-xl tracking-tighter font-display text-zinc-950 flex items-center gap-1.5">
                DUKAAN<span className="bg-[#CEDB8C] text-[#0B331A] px-1.5 py-0.5 rounded-md text-xs font-mono font-bold">POS</span>
              </div>
              <p className="text-xs text-zinc-500 max-w-sm font-normal">
                Local-first point of sale software for independent retailers across India. Built for speed, offline resilience, and data sovereignty.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-zinc-700">
              <button
                onClick={() => openLegal("privacy")}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Privacy Policy (DPDP 2023)
              </button>
              <button
                onClick={() => openLegal("terms")}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                onClick={() => openLegal("refund")}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Refund Policy
              </button>
              <button
                onClick={() => openLegal("dpo")}
                className="hover:text-black transition-colors cursor-pointer"
              >
                DPO Grievance
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div>© {new Date().getFullYear()} DukaanPOS Retail Technologies. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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
