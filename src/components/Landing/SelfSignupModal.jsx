import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { getBusinessProfile } from "../../config/businessProfiles";
import { OfflineQrCode } from "../../utils/qrCodeSvg";
import {
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  QrCode,
  CreditCard,
  Check,
  Lock,
} from "lucide-react";

export const SelfSignupModal = ({ isOpen, onClose, initialPlan = "pro" }) => {
  const { setStoreConfig, switchBusinessType, setActiveTab } = useStore();

  const [step, setStep] = useState(1); // 1: Sector, 2: Store Details, 3: Plan & Payment, 4: Launching
  const [selectedSector, setSelectedSector] = useState("electronics");
  const [storeDetails, setStoreDetails] = useState({
    name: "Gupta Electronics & Mobiles",
    ownerName: "Rajesh Gupta",
    phone: "+91 98765 43210",
    city: "New Delhi",
    address: "Shop 14, Main Electronics Market, Delhi",
    gstin: "07AAAAA0000A1Z5",
  });
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || "pro");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // 'upi' | 'card' | 'netbanking'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const currentProfile = getBusinessProfile(selectedSector);

  const availableSectors = [
    {
      id: "electronics",
      name: "Electronics, Mobile & Hardware",
      badge: "No Kgs · Serial & IMEI Ready",
      icon: "fa-mobile-screen",
      color: "blue",
      desc: "For smartphones, audio, accessories & laptops with serial/IMEI warranty tracking and discrete units (Pcs/Box).",
      highlights: ["Zero kilograms / no loose scales", "Serial No & IMEI tracking on bills", "12M / 24M warranty notes", "Accessory & charger quick presets"],
    },
    {
      id: "supermarket",
      name: "Supermarket, Grocery & FMCG Mart",
      badge: "Scale Integrated · 80mm Slip",
      icon: "fa-basket-shopping",
      color: "amber",
      desc: "For grocery marts and supermarkets needing rapid barcode checkout, loose grain scale chips, and decimal weights.",
      highlights: ["Digital weighing scale chips (100g, 250g, 1kg)", "3-decimal kg/gm/ltr precision", "80mm thermal barcode slips", "FSSAI license disclosures"],
    },
    {
      id: "apparel",
      name: "Fashion, Apparel & Footwear",
      badge: "Size × Color Matrix",
      icon: "fa-shirt",
      color: "indigo",
      desc: "For garments, ethnic wear & footwear with size, color, brand variants and 7-day exchange policies.",
      highlights: ["Size & color attribute matrix", "Hang-tag barcode printing", "Alteration & gift box presets", "No kilograms / weight scales"],
    },
    {
      id: "pharmacy",
      name: "Pharmacy & Wellness Store",
      badge: "Batch & Expiry Safe",
      icon: "fa-pills",
      color: "emerald",
      desc: "For chemist and medical stores with batch numbers, expiry warnings, and Schedule H prescription controls.",
      highlights: ["Batch number & expiry date tracking", "Strip, bottle, and box units", "Prescription & Schedule H flags", "No loose weighing scales"],
    },
    {
      id: "hardware",
      name: "Hardware, Electrical & Tools",
      badge: "Tools & Gauge Units",
      icon: "fa-wrench",
      color: "slate",
      desc: "For sanitary, electrical & tool stores with model numbers, technical specs, and wire rolls.",
      highlights: ["Model & series tracking", "Roll, Mtr & SqFt measurement units", "Cutting & transport presets", "No decimal grain weights"],
    },
    {
      id: "stationery",
      name: "Stationery, Books & Toys",
      badge: "Pack & Box Items",
      icon: "fa-book",
      color: "purple",
      desc: "For booksellers, student supplies & gift shops with quick barcode lookups and pack/dozen units.",
      highlights: ["Fast barcode scan under 0.8s", "Pack, dozen, and set units", "Gift wrap & school supplies", "Zero food/grain scales"],
    },
  ];

  const plans = [
    {
      id: "starter",
      name: "Cloud Retail Starter",
      price: 0,
      period: "14-Day Free Trial",
      desc: "Instant single-counter checkout with zero payment commitment.",
      features: ["Full POS Counter", "Barcode Scanning", "Basic Inventory", "No Credit Card Needed"],
    },
    {
      id: "pro",
      name: "Pro Retailer & Store",
      price: 499,
      period: "per month",
      desc: "Most popular for growing retail businesses with sticker studio and GST.",
      popular: true,
      features: [
        "Unlimited Sector SKUs",
        "Dual 3\" Thermal & A4 Invoices",
        "A4 & Thermal Barcode Sticker Studio",
        "GSTR-1 Reports & Tax Engine",
        "Offline Security & Cloud Sync",
      ],
    },
    {
      id: "enterprise",
      name: "Multi-Store Chain",
      price: 1499,
      period: "per month",
      desc: "For departmental stores and multi-counter supermarket chains.",
      features: [
        "Everything in Pro Plan",
        "Unlimited Multi-Counter Registers",
        "Multi-User Role-Based Access Control",
        "Centralized Inventory Synchronization",
      ],
    },
  ];

  const handleSectorSelect = (secId) => {
    setSelectedSector(secId);
    const prof = getBusinessProfile(secId);
    setStoreDetails((prev) => ({
      ...prev,
      name: prof.defaultStoreName,
    }));
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        handleFinalLaunch();
      }, 1200);
    }, 1500);
  };

  const handleFinalLaunch = () => {
    // 1. Configure the store according to customer's self-signup
    setStoreConfig((prev) => ({
      ...prev,
      name: storeDetails.name.trim() || currentProfile.defaultStoreName,
      businessType: selectedSector,
      ownerName: storeDetails.ownerName.trim(),
      phone: storeDetails.phone.trim(),
      address: `${storeDetails.address.trim()}, ${storeDetails.city.trim()}`,
      gstin: storeDetails.gstin.trim(),
      tagline: currentProfile.defaultTagline,
      receiptFooterNote: currentProfile.invoiceTerms,
      selectedPlan: selectedPlan,
      isSubscribed: selectedPlan !== "starter",
      subscriptionActivatedAt: new Date().toISOString(),
    }));

    // 2. Lock app to selected sector
    switchBusinessType(selectedSector);

    // 3. Close modal & navigate to live POS
    onClose();
    setActiveTab("pos");
  };

  const planAmount = selectedPlan === "enterprise" ? 1499 : selectedPlan === "pro" ? 499 : 0;
  const upiPayUri = `upi://pay?pa=dukaanpos@icici&pn=DukaanPOS%20Retail&am=${planAmount}&cu=INR&tn=DukaanPOS%20${selectedPlan.toUpperCase()}%20Subscription`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
    >
      <div className="bg-[#0F1F35] text-slate-100 rounded-2xl max-w-2xl w-full border-2 border-white/15 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-black text-sm shadow">
              <Sparkles className="w-4 h-4 fill-zinc-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base font-display text-white">
                Self Signup & Instant Store Setup
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Step {step} of 3 · Customized for your exact retail business
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="grid grid-cols-3 bg-slate-900/60 border-b border-white/10 text-xs font-mono font-bold shrink-0">
          <div
            className={`py-2 px-3 text-center border-r border-white/10 flex items-center justify-center gap-1.5 ${
              step === 1 ? "bg-white/10 text-white border-b-2 border-b-white" : "text-slate-400"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
            <span>Business Type</span>
          </div>
          <div
            className={`py-2 px-3 text-center border-r border-white/10 flex items-center justify-center gap-1.5 ${
              step === 2 ? "bg-white/10 text-white border-b-2 border-b-white" : "text-slate-400"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
            <span>Store Profile</span>
          </div>
          <div
            className={`py-2 px-3 text-center flex items-center justify-center gap-1.5 ${
              step === 3 ? "bg-white/10 text-white border-b-2 border-b-white" : "text-slate-400"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span>
            <span>Plan & Payment</span>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* ======================================================== */}
          {/* STEP 1: BUSINESS TYPE SELECTION                           */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-left space-y-1">
                <h4 className="text-base font-extrabold font-display text-white">
                  What kind of retail business do you operate?
                </h4>
                <p className="text-slate-300 text-xs">
                  DukaanPOS configures its units, receipt formatting, and attribute inputs specifically for your industry. For example, selecting Electronics automatically disables kilograms and loose scales.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {availableSectors.map((sec) => {
                  const isSelected = selectedSector === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => handleSectorSelect(sec.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-slate-900 border-white shadow-lg shadow-white/5 scale-[1.01]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className={`fa-solid ${sec.icon} text-sm ${isSelected ? "text-white" : "text-slate-300"}`} />
                            <h5 className="font-extrabold font-display text-white text-xs sm:text-sm">
                              {sec.name}
                            </h5>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug">
                          {sec.desc}
                        </p>

                        <div className="pt-2 border-t border-white/5 space-y-1">
                          {sec.highlights.map((h, i) => (
                            <div key={i} className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                              <span className="w-1 h-1 rounded-full bg-white"></span>
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2.5 mt-2 flex justify-end">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isSelected ? "bg-white text-slate-950 font-black" : "bg-white/10 text-slate-300"
                        }`}>
                          {sec.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: STORE & MERCHANT PROFILE                          */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-left space-y-1">
                <h4 className="text-base font-extrabold font-display text-white">
                  Enter Your Store & Owner Details
                </h4>
                <p className="text-slate-300 text-xs">
                  These details will appear on your customer receipts, GST tax invoices, and barcode stickers.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Store Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeDetails.name}
                      onChange={(e) => setStoreDetails({ ...storeDetails, name: e.target.value })}
                      placeholder="e.g. Apex Mobile World"
                      className="w-full bg-slate-950 border border-white/15 focus:border-white rounded-lg px-3 py-2 text-xs font-bold text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Proprietor / Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeDetails.ownerName}
                      onChange={(e) => setStoreDetails({ ...storeDetails, ownerName: e.target.value })}
                      placeholder="e.g. Rajesh Gupta"
                      className="w-full bg-slate-950 border border-white/15 focus:border-white rounded-lg px-3 py-2 text-xs font-bold text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      WhatsApp / Billing Mobile *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeDetails.phone}
                      onChange={(e) => setStoreDetails({ ...storeDetails, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-white/15 focus:border-white rounded-lg px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      City & State *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeDetails.city}
                      onChange={(e) => setStoreDetails({ ...storeDetails, city: e.target.value })}
                      placeholder="e.g. New Delhi, Delhi"
                      className="w-full bg-slate-950 border border-white/15 focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Store Address / Market Location
                  </label>
                  <input
                    type="text"
                    value={storeDetails.address}
                    onChange={(e) => setStoreDetails({ ...storeDetails, address: e.target.value })}
                    placeholder="Shop No., Market Road, Sector"
                    className="w-full bg-slate-950 border border-white/15 focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    GSTIN / Tax Registration No (Optional)
                  </label>
                  <input
                    type="text"
                    value={storeDetails.gstin}
                    onChange={(e) => setStoreDetails({ ...storeDetails, gstin: e.target.value })}
                    placeholder="e.g. 07AAAAA0000A1Z5 (Leave blank if composition/unregistered)"
                    className="w-full bg-slate-950 border border-white/15 focus:border-white rounded-lg px-3 py-2 text-xs font-mono uppercase text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: PLAN SELECTION & PAYMENT CHECKOUT                 */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-left space-y-1">
                <h4 className="text-base font-extrabold font-display text-white">
                  Choose Your Subscription Plan
                </h4>
                <p className="text-slate-300 text-xs">
                  Select your plan and complete instant automated activation.
                </p>
              </div>

              {/* Plan Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((p) => {
                  const isSelected = selectedPlan === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-b from-slate-900 to-slate-950 border-white shadow-lg shadow-white/5"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-zinc-950 text-[9px] font-black font-mono px-2 py-0.5 rounded-full uppercase">
                          Popular
                        </span>
                      )}
                      <div>
                        <h5 className="font-extrabold font-display text-white text-xs">{p.name}</h5>
                        <div className="mt-1">
                          <span className="text-xl font-black font-mono text-white">
                            {p.price === 0 ? "₹0" : `₹${p.price}`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1">{p.period}</span>
                        </div>
                        <ul className="mt-2.5 pt-2 border-t border-white/10 space-y-1 text-[10px] text-slate-300">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-white shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Select Plan</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-white bg-white" : "border-slate-500"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instant Payment Box (for Paid Plans) */}
              {selectedPlan !== "starter" ? (
                <div className="bg-slate-900 p-4 rounded-xl border border-white/15 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-white" />
                      <span className="font-bold text-white text-xs">
                        Instant Online Merchant Activation (₹{planAmount})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-200 font-bold bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                      UPI Auto-Approved
                    </span>
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="flex gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                        paymentMethod === "upi" ? "bg-white text-zinc-950 font-black" : "bg-white/5 text-slate-300"
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Instant UPI QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                        paymentMethod === "card" ? "bg-white text-zinc-950 font-black" : "bg-white/5 text-slate-300"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card / Netbanking</span>
                    </button>
                  </div>

                  {paymentMethod === "upi" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-950 p-3.5 rounded-xl border border-white/10">
                      <div className="sm:col-span-5 flex justify-center bg-white p-2.5 rounded-xl shadow">
                        <OfflineQrCode value={upiPayUri} size={130} />
                      </div>
                      <div className="sm:col-span-7 space-y-2 text-left">
                        <p className="text-[11px] text-slate-300 font-medium">
                          Scan with any UPI App (GPay, PhonePe, Paytm, BHIM) to activate your store license:
                        </p>
                        <div className="bg-white/5 p-2 rounded border border-white/10 font-mono text-[10px] text-zinc-300 space-y-0.5">
                          <div>VPA: <strong>dukaanpos@icici</strong></div>
                          <div>Amount: <strong>₹{planAmount}.00</strong></div>
                          <div>License: <strong>{selectedSector.toUpperCase()}-ANNUAL</strong></div>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Instant automated confirmation after scan.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-2.5">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 ···· ···· 1234"
                          defaultValue="4111 8920 4821 9920"
                          className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          defaultValue="08/29"
                          className="bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-white text-center"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          defaultValue="892"
                          className="bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-white text-center"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isProcessingPayment || paymentSuccess}
                    onClick={handleSimulatePayment}
                    className={`w-full py-3 rounded-xl font-black text-xs font-display flex items-center justify-center gap-2 transition shadow-lg ${
                      paymentSuccess
                        ? "bg-white text-zinc-950"
                        : "bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer"
                    }`}
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying Merchant Payment...</span>
                      </>
                    ) : paymentSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Payment Verified! Provisioning Store...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Payment & Launch Store (₹{planAmount})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h5 className="font-extrabold text-white text-xs">
                      14-Day Free Starter Trial
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      No card required. Instant full access to the POS counter.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFinalLaunch}
                    className="px-4 py-2.5 bg-[#1FAA59] hover:bg-emerald-600 text-white font-extrabold rounded-lg text-xs transition flex items-center gap-1.5 shadow"
                  >
                    <span>Activate Free Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Controls Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-white/10 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">
              Self-Serve Cloud POS Setup
            </span>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black font-display transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            selectedPlan === "starter" && (
              <button
                type="button"
                onClick={handleFinalLaunch}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Launch Free POS Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
