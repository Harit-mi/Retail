import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { INDIAN_LANGUAGES } from "../../i18n/translations";
import {
  Zap,
  CheckCircle2,
  Sparkles,
  Barcode,
  BookOpen,
  MessageSquare,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  Play,
  Star,
  Check,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export const ProductLandingPage = () => {
  const { setActiveTab, currentLanguage, changeLanguage } = useStore();
  const [activeVertical, setActiveVertical] = useState("kirana");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  const verticals = [
    {
      id: "kirana",
      name: "Kirana & Grocery",
      icon: "fa-solid fa-[#F5A623] fa-basket-shopping",
      tagline: "Weight-based pricing & FMCG batch expiry tracking",
      features: [
        "Weight & loose item pricing (Kg/Gm/Ltr)",
        "Batch & Expiry Date tracking for perishables",
        "Barcode scanner & instant thermal receipt",
        "Udhaar ledger integration for credit sales",
      ],
      color: "from-amber-500/20 to-orange-500/20 border-amber-400",
    },
    {
      id: "apparel",
      name: "Apparel & Footwear",
      icon: "fa-solid fa-shirt",
      tagline: "Size, Color & Style Matrix Management",
      features: [
        "Multi-attribute matrix (Size, Color, Brand)",
        "Seasonal discount coupon engine",
        "Garment tag & sticker printing",
        "Customer loyalty points & VIP tiers",
      ],
      color: "from-blue-500/20 to-indigo-500/20 border-blue-400",
    },
    {
      id: "pharmacy",
      name: "Pharmacy & Medical",
      icon: "fa-solid fa-[#1FAA59] fa-pills",
      tagline: "Schedule H Flags & Prescription Validation",
      features: [
        "Schedule H & OTC drug classification flags",
        "Doctor prescription requirement prompts",
        "Batch expiry warning alerts before billing",
        "HSN 3004 GST calculation (12% tax slab)",
      ],
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-400",
    },
    {
      id: "electronics",
      name: "Electronics & Mobile",
      icon: "fa-solid fa-mobile-screen-button",
      tagline: "15-Digit IMEI & Serial Number Tracking",
      features: [
        "15-digit IMEI & Serial Number capture",
        "12-Month warranty certificate generator",
        "Bajaj/HDFC No-Cost EMI invoice breakdown",
        "Trade-in exchange discount management",
      ],
      color: "from-purple-500/20 to-pink-500/20 border-purple-400",
    },
    {
      id: "salon",
      name: "Salon & Spa",
      icon: "fa-solid fa-scissors",
      tagline: "Stylist Commissions & Service Packages",
      features: [
        "Service duration & staff commission logs",
        "Haircut + Beard combo package pricing",
        "Advance appointment slot management",
        "Customer visit history & preferred stylist",
      ],
      color: "from-rose-500/20 to-pink-500/20 border-rose-400",
    },
    {
      id: "restaurant",
      name: "Restaurant & Cafe",
      icon: "fa-solid fa-utensils",
      tagline: "KOT Kitchen Routing & Table Bills",
      features: [
        "Kitchen Order Ticket (KOT) department routing",
        "Table billing & split payment modes",
        "Spice level & special kitchen notes",
        "5% Restaurant GST billing configuration",
      ],
      color: "from-red-500/20 to-amber-500/20 border-red-400",
    },
    {
      id: "jewelry",
      name: "Jewelry & Gold",
      icon: "fa-solid fa-gem",
      tagline: "Live Gold/Silver Rates & Hallmark Verification",
      features: [
        "Live 22K/24K Gold & Silver market rates",
        "Gross vs Net weight & making charge math",
        "BIS Hallmark certificate number on bill",
        "3% Jewelry GST calculation slab",
      ],
      color: "from-[#F5A623]/20 to-yellow-500/20 border-yellow-400",
    },
  ];

  const coreFeatures = [
    {
      icon: Zap,
      title: "Lightning-Fast Billing Counter",
      desc: "Process transactions in 0.8 seconds with hardware barcode scanner support, camera barcode scanning, F2 search, F4 customer link, and F8 checkout.",
      badge: "F2 • F4 • F8 Shortcuts",
    },
    {
      icon: BookOpen,
      title: "Udhaar Khata & Customer Loyalty",
      desc: "Complete credit ledger tracking with emerald green payment receipts (-₹450), red debt balances (+₹450), WhatsApp reminders, and VIP reward tiers.",
      badge: "Udhaar + Points",
    },
    {
      icon: Barcode,
      title: "A4 Barcode Sticker Printing",
      desc: "Auto-fill 24 (3×8) or 40 (4×10) labels per A4 sheet with vector EAN-13 barcodes, MRP tags, and custom shop logo.",
      badge: "A4 24/40 Labels",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Marketing Engine",
      desc: "Send 1-tap WhatsApp payment reminders, festive offer broadcasts, and new arrival alerts directly to customer phones.",
      badge: "1-Tap Broadcasts",
    },
    {
      icon: FileSpreadsheet,
      title: "GST Compliance & Reports",
      desc: "Real-time daily revenue analytics, live payment mix pulse (Cash/UPI/Udhaar), and GSTR-1 CSV exports with formula injection shielding.",
      badge: "GSTR-1 CSV Export",
    },
    {
      icon: Lock,
      title: "DPDP Privacy & PIN Security",
      desc: "100% offline-first local crypto storage, 4-digit cashier PIN counter register lock, and DPDP Section 12 Right-to-Erasure tools.",
      badge: "DPDP Act Compliant",
    },
  ];

  const faqs = [
    {
      q: "Does DukaanPOS work 100% offline without internet?",
      a: "Yes! DukaanPOS is designed with a local-first offline architecture. Your products, sales, customers, and GST reports are stored safely on your device using native browser crypto storage. You never lose access to billing even during internet outages."
    },
    {
      q: "Can I print barcode stickers on standard A4 sticker paper?",
      a: "Absolutely! DukaanPOS includes built-in templates for 24-label (3×8) and 40-label (4×10) A4 sticker sheets. You can click 'Auto-Fill Sheet' to instantly populate stickers from your active inventory with vector EAN-13 barcodes."
    },
    {
      q: "How does Udhaar Khata payment collection work?",
      a: "When a customer buys on credit, the bill is logged as an Udhaar Credit sale (+₹450 in red). When the customer pays via Cash or UPI, recording the payment logs a green '✓ Payment Received' receipt (-₹450 in green), automatically updating the pending balance."
    },
    {
      q: "Is DukaanPOS compliant with India's DPDP Act 2023?",
      a: "Yes! All customer data remains local to your device. DukaanPOS provides cashier PIN counter locks, GSTR CSV formula injection shielding, and DPDP Section 12 Right-to-Erasure data deletion tools."
    },
    {
      q: "What hardware printers and barcode scanners are supported?",
      a: "DukaanPOS supports all standard 80mm thermal receipt printers, A4 desktop printers, USB barcode scanners, Bluetooth wireless scanners, and mobile/tablet built-in cameras."
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Gupta",
      store: "Gupta Kirana Store, Sector 14, Delhi",
      quote: "DukaanPOS changed my shop completely. Billing speed increased 3x, and my customers love getting WhatsApp Udhaar payment reminders!",
      rating: 5,
      vertical: "Kirana",
    },
    {
      name: "Sunil Verma",
      store: "Verma Garments & Sarees, Jaipur",
      quote: "Managing size and color variants used to be a nightmare. DukaanPOS variant matrix and barcode sticker printing solved it in 1 day.",
      rating: 5,
      vertical: "Apparel",
    },
    {
      name: "Dr. Ananya Roy",
      store: "MedPlus Wellness Pharmacy, Kolkata",
      quote: "Schedule H flags and batch expiry alerts saved us from billing expired medicines multiple times. Highly recommended for medical shops!",
      rating: 5,
      vertical: "Pharmacy",
    },
  ];

  const pricingTiers = [
    {
      name: "Offline Starter",
      price: "₹0",
      period: "Forever Free",
      desc: "Perfect for single retail counters wanting offline speed and zero recurring costs.",
      features: [
        "Full Billing POS Counter",
        "Unlimited Inventory & Products",
        "Udhaar Ledger & Customer Management",
        "A4 Barcode Printing (24 & 40 Labels)",
        "100% Offline Local Crypto Storage",
      ],
      cta: "Launch Live POS Counter",
      popular: false,
    },
    {
      name: "Pro Retailer",
      price: "₹499",
      period: "per month",
      desc: "Designed for growing retail outlets wanting WhatsApp marketing and multi-vertical power.",
      features: [
        "Everything in Starter Plan",
        "All 7 Business Verticals (Kirana, Pharmacy, etc.)",
        "1-Tap WhatsApp Broadcast Marketing",
        "GSTR-1 CSV Exports & Tax Reports",
        "Cashier 4-Digit Register PIN Lock",
        "Customer Loyalty Tier Program",
      ],
      cta: "Try Pro Demo App",
      popular: true,
    },
    {
      name: "Multi-Store Enterprise",
      price: "₹1,499",
      period: "per month",
      desc: "For multi-outlet retail chains needing centralized stock sync and dedicated support.",
      features: [
        "Everything in Pro Plan",
        "Unlimited Multi-Counter Registers",
        "Centralized Inventory Warehouse Sync",
        "Custom Thermal Receipt Branding",
        "Priority 24/7 WhatsApp Support",
        "Custom HSN/GST Auto-Filing",
      ],
      cta: "Contact Enterprise Sales",
      popular: false,
    },
  ];

  return (
    <div className="bg-[#0F1F35] text-slate-100 min-h-screen font-sans selection:bg-[#F5A623] selection:text-slate-950">
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-amber-500 via-[#F5A623] to-orange-500 text-slate-950 px-4 py-2 text-center text-xs font-extrabold flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="w-4 h-4 fill-slate-950" />
        <span>DukaanPOS 2.0 Released: 100% Offline Multi-Vertical Retail Platform with GST, Udhaar & DPDP Security!</span>
        <button
          onClick={() => setActiveTab("pos")}
          className="underline hover:text-white transition ml-2 font-mono text-[11px] font-black"
        >
          Launch Live POS App →
        </button>
      </div>

      {/* Website Navigation Header */}
      <header className="border-b border-white/10 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5A623] flex items-center justify-center shadow text-slate-950 font-black text-base">
              <i className="fa-solid fa-shop"></i>
            </div>
            <div>
              <span className="font-black text-lg font-display text-white tracking-tight">
                Dukaan<span className="text-[#F5A623]">POS</span>
              </span>
              <span className="ml-2 text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded font-bold uppercase">
                🇮🇳 Retail India
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-300">
            <a href="#verticals" className="hover:text-amber-400 transition">Verticals</a>
            <a href="#features" className="hover:text-amber-400 transition">Features</a>
            <a href="#video" className="hover:text-amber-400 transition">Demo Video</a>
            <a href="#pricing" className="hover:text-amber-400 transition">Pricing</a>
            <a href="#faq" className="hover:text-amber-400 transition">FAQ</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher Dropdown */}
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-white/10 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-white/15 outline-none cursor-pointer hover:bg-white/20 transition"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.native}
                </option>
              ))}
            </select>

            {/* Launch App Button */}
            <button
              onClick={() => setActiveTab("pos")}
              className="px-4 py-2 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black font-display text-xs rounded-lg shadow-md transition flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Launch Live POS App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-7xl mx-auto overflow-hidden">
        {/* Glow background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F5A623]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
            <span className="w-2 h-2 rounded-full bg-[#1FAA59] animate-pulse"></span>
            <span>🇮🇳 Built Specifically for Indian Retail Shopkeepers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
            India's #1 Retail POS Platform — <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#F5A623] via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Built for Speed & 100% Offline Power
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Manage Kirana, Apparel, Pharmacy, Electronics, Salon, Restaurant & Jewelry in one 
            lightning-fast offline app. Includes GST billing, Udhaar ledger, Barcode printing, 
            and WhatsApp marketing out of the box.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab("pos")}
              className="w-full sm:w-auto px-8 py-4 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black font-display rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-sm min-h-[52px]"
            >
              <span>⚡ Open Live Billing Counter</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/15 transition flex items-center justify-center gap-2 text-sm min-h-[52px]"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Watch Hindi Voiceover Video (40s)</span>
            </button>
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/10 max-w-3xl mx-auto text-left">
            <div>
              <div className="text-2xl font-black font-mono text-[#F5A623]">0.8 Sec</div>
              <div className="text-xs text-slate-400 font-medium">Avg Checkout Speed</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-[#1FAA59]">₹0 / Mo</div>
              <div className="text-xs text-slate-400 font-medium">100% Local Offline Tier</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-blue-400">7 Verticals</div>
              <div className="text-xs text-slate-400 font-medium">Kirana to Jewelry</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-amber-300">100% DPDP</div>
              <div className="text-xs text-slate-400 font-medium">Offline Crypto Privacy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Player */}
      {isVideoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-[#0F1F35] rounded-2xl max-w-3xl w-full overflow-hidden border-2 border-white/20 shadow-2xl">
            <div className="px-5 py-4 bg-slate-950 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
                <h4 className="font-extrabold text-sm text-white">
                  DukaanPOS Demo Video Walkthrough (Hindi Female Voiceover)
                </h4>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white px-2.5 py-1 rounded text-xs bg-white/10 font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4">
              <video
                controls
                autoPlay
                className="w-full h-auto rounded-lg border border-white/10"
                src="file:///Users/haritmishra/.gemini/antigravity/brain/1a6fb965-ca9b-442a-84a9-9384077e7b01/dukaan_pos_demo_walkthrough.webm"
              >
                Your browser does not support WebM video playback.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Vertical Showcase Section */}
      <section id="verticals" className="px-4 sm:px-6 lg:px-8 py-16 bg-slate-950/50 border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#F5A623] uppercase tracking-widest">
              Multi-Vertical Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
              Tailored for Every Retail Industry in India
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Select your business vertical to discover specialized billing workflows.
            </p>
          </div>

          {/* Vertical Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {verticals.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVertical(v.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeVertical === v.id
                    ? "bg-[#F5A623] text-slate-950 shadow-md font-black"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                <i className={v.icon}></i>
                <span>{v.name}</span>
              </button>
            ))}
          </div>

          {/* Selected Vertical Detail Card */}
          {verticals.map((v) => {
            if (v.id !== activeVertical) return null;
            return (
              <div
                key={v.id}
                className={`bg-gradient-to-br ${v.color} p-6 sm:p-8 rounded-2xl border-2 backdrop-blur-xs transition-all animate-fade-in`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-slate-950/60 px-3 py-1 rounded-lg text-xs font-mono text-amber-300 font-bold border border-white/10">
                      <i className={v.icon}></i>
                      <span>{v.name} Vertical</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                      {v.tagline}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {v.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#1FAA59] flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab("pos")}
                      className="mt-4 px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-bold rounded-lg text-xs transition flex items-center gap-2 border border-white/15"
                    >
                      <span>Try {v.name} Billing Mode</span>
                      <ChevronRight className="w-4 h-4 text-[#F5A623]" />
                    </button>
                  </div>

                  <div className="md:col-span-5 bg-slate-950/80 p-5 rounded-xl border border-white/10 text-xs font-mono space-y-3 shadow-xl">
                    <div className="flex justify-between text-slate-400 border-b border-white/10 pb-2">
                      <span>Feature Spec</span>
                      <span className="text-emerald-400 font-bold">✓ Active in DukaanPOS</span>
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Offline Hardware Sync:</span>
                        <span className="text-amber-300 font-bold">Supported</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST Auto Calculator:</span>
                        <span className="text-amber-300 font-bold">5%, 12%, 18%, 28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thermal Slip Engine:</span>
                        <span className="text-amber-300 font-bold">80mm & 58mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-[#F5A623] uppercase tracking-widest">
            Core Modules
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
            Everything Required to Run a Modern Retail Store
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/10 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center border border-[#F5A623]/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white/10 px-2.5 py-1 rounded text-amber-300 border border-white/10">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold font-display text-lg text-white">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("pos")}
                  className="pt-4 mt-4 border-t border-white/5 flex items-center text-xs font-bold text-[#F5A623] group-hover:translate-x-1 transition-transform"
                >
                  <span>Launch Live Module</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Retailer Reviews & Testimonials */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-slate-950/60 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#1FAA59] uppercase tracking-widest">
              Trusted by 10,000+ Shopkeeper Owners
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
              Loved by Retailers Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-white font-display">
                      {t.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {t.store}
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded font-mono">
                    {t.vertical}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-[#F5A623] uppercase tracking-widest">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
            Simple Plans with Zero Hidden Fees
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((p, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border-2 flex flex-col justify-between relative ${
                p.popular
                  ? "bg-gradient-to-b from-[#1E3A5F] to-[#0F1F35] border-[#F5A623] shadow-2xl shadow-amber-500/10 scale-105"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F5A623] text-slate-950 text-[10px] font-black uppercase font-mono px-3 py-1 rounded-full shadow-md">
                  Most Popular for Retail Shops
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold font-display text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                </div>

                <div>
                  <span className="text-4xl font-black font-mono text-white">{p.price}</span>
                  <span className="text-xs text-slate-400 font-mono ml-2">{p.period}</span>
                </div>

                <ul className="space-y-3 pt-2 border-t border-white/10">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-[#1FAA59] flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setActiveTab("pos")}
                className={`w-full mt-8 py-3.5 rounded-xl font-extrabold text-xs transition font-display flex items-center justify-center gap-2 ${
                  p.popular
                    ? "bg-[#F5A623] hover:bg-amber-400 text-slate-950 shadow-lg"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                }`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16 bg-slate-950/60 border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#F5A623] uppercase tracking-widest">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-extrabold font-display text-white">
                      {faq.q}
                    </h4>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-[#F5A623]" : ""}`} />
                  </div>
                  {isOpen && (
                    <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-white/10 leading-relaxed font-sans">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 px-4 sm:px-6 lg:px-8 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#F5A623] text-slate-950 flex items-center justify-center font-black text-xs">
              D
            </div>
            <span className="font-extrabold font-display text-white text-sm">
              Dukaan<span className="text-[#F5A623]">POS</span> Platform
            </span>
          </div>

          <p className="text-center sm:text-right text-slate-500 font-mono">
            © 2026 DukaanPOS Inc. 100% Local-First Offline Technology • Made with ❤️ in India
          </p>
        </div>
      </footer>
    </div>
  );
};
