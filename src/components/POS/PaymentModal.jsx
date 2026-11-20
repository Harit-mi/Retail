import React, { useState, useEffect } from "react";
import { useStore } from "../../context/useStore";
import { calculateCashChange } from "../../utils/moneyMath";
import { OfflineQrCode } from "../../utils/qrCodeSvg";
import {
  Banknote,
  QrCode,
  CreditCard,
  BookOpen,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  Volume2,
  Share2,
  Eye,
} from "lucide-react";
import { InvoicePreviewModal } from "../Invoice/InvoicePreviewModal";

// Web Audio API: Authentic Indian UPI Soundbox Two-Tone Confirmation Chime
const playSoundboxChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1174.66, now + 0.14); // D6
    gain2.gain.setValueAtTime(0.25, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.48);
  } catch {
    // Ignore audio restrictions if sound is blocked by browser
  }
};

// Calculate exact Indian Banknote & Coin Denomination breakdown for change
const calculateDenominations = (changeAmount) => {
  if (!changeAmount || changeAmount <= 0) return [];
  const notes = [500, 200, 100, 50, 20, 10, 5, 2, 1];
  let rem = Math.floor(changeAmount);
  const result = [];
  for (const n of notes) {
    if (rem >= n) {
      const count = Math.floor(rem / n);
      result.push({ denom: n, count, isCoin: n <= 5 });
      rem = rem % n;
    }
  }
  return result;
};

export const PaymentModal = ({ isOpen, onClose }) => {
  const {
    cartGrandTotal,
    cartCustomer,
    completeCheckout,
    storeConfig,
    setPrintFormat,
    setPrintableBill,
  } = useStore();

  const [paymentMode, setPaymentMode] = useState("upi"); // 'cash', 'upi', 'card', 'udhar'
  const [cashTendered, setCashTendered] = useState(cartGrandTotal);
  const [completedBill, setCompletedBill] = useState(null);
  const [upiVerified, setUpiVerified] = useState(false);
  const [cardAuthCode, setCardAuthCode] = useState("");
  const [soundboxPlaying, setSoundboxPlaying] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Re-sync cash tendered to CURRENT bill total on modal open
  useEffect(() => {
    if (isOpen) {
      setCashTendered(cartGrandTotal);
      setUpiVerified(false);
      setCardAuthCode("");
      setSoundboxPlaying(false);
    }
  }, [isOpen, cartGrandTotal]);

  if (!isOpen) return null;

  const cashChangeReturn = calculateCashChange(cashTendered, cartGrandTotal);
  const denominations = calculateDenominations(cashChangeReturn);
  const isUdhar = paymentMode === "udhar";

  const upiUri = `upi://pay?pa=${encodeURIComponent(
    storeConfig.upiId || "guptakirana@upi"
  )}&pn=${encodeURIComponent(
    storeConfig.name
  )}&am=${cartGrandTotal}&cu=INR&tn=Invoice Payment`;

  // Quick Currency Banknote Tender Chips (Exact, ₹50, ₹100, ₹200, ₹500, ₹1000)
  const getCurrencyChips = () => {
    const total = cartGrandTotal;
    const chips = [total];

    if (total % 50 !== 0 && total < 500) {
      chips.push(Math.ceil(total / 50) * 50);
    }
    if (total % 100 !== 0 && total < 1000) {
      chips.push(Math.ceil(total / 100) * 100);
    }
    if (total < 500) chips.push(500);
    if (total < 1000 && total >= 400) chips.push(1000);
    if (total < 2000 && total >= 900) chips.push(2000);

    return [...new Set(chips)].sort((a, b) => a - b);
  };

  const handleTriggerSoundbox = () => {
    setSoundboxPlaying(true);
    playSoundboxChime();
    setUpiVerified(true);
    setTimeout(() => setSoundboxPlaying(false), 2000);
  };

  const handleFinalCheckout = () => {
    // 1. Guard against Udhaar without an identified customer account
    if (isUdhar && !cartCustomer) {
      alert("Udhaar (Credit) requires selecting a registered customer account. Please attach a customer before proceeding.");
      return;
    }

    // 2. Validate Cash payment amount
    if (paymentMode === "cash") {
      if (cashTendered < cartGrandTotal) {
        alert(`Cash tendered (₹${cashTendered}) cannot be less than the bill total of ₹${cartGrandTotal}.`);
        return;
      }
    }

    // 3. Confirm UPI verification
    if (paymentMode === "upi" && !upiVerified) {
      const confirmProceed = window.confirm(
        "UPI payment has not been marked as verified via Soundbox/UPI App. Do you want to proceed anyway as manual cashier override?"
      );
      if (!confirmProceed) return;
    }

    const details = {
      mode: paymentMode,
      paidAmount: isUdhar ? 0 : cartGrandTotal,
      cashTendered: paymentMode === "cash" ? cashTendered : undefined,
      tenderedAmount: paymentMode === "cash" ? cashTendered : (isUdhar ? 0 : cartGrandTotal),
      changeReturned: paymentMode === "cash" ? cashChangeReturn : undefined,
      upiVerified: paymentMode === "upi" ? upiVerified : undefined,
      cardAuthCode: paymentMode === "card" ? cardAuthCode : undefined,
    };
    const bill = completeCheckout(details);
    setCompletedBill(bill);
  };

  const handlePrintReceipt = (format) => {
    setPrintFormat(format);
    if (completedBill) {
      setPrintableBill(completedBill);
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleSendWhatsApp = () => {
    if (!completedBill) return;
    const storeName = storeConfig?.name || "Gupta Retail Store";
    const customerName = completedBill.customerName || "ग्राहक";
    const phone = completedBill.customerPhone ? completedBill.customerPhone.replace(/\D/g, "") : "";
    const dateStr = new Date(completedBill.date).toLocaleDateString("en-IN");
    
    const text = encodeURIComponent(
      `*${storeName} — बिल रसीद*\n\n` +
      `नमस्ते ${customerName} जी,\n` +
      `रसीद संख्या: #${completedBill.id}\n` +
      `दिनांक: ${dateStr}\n` +
      `कुल राशि: ₹${completedBill.grandTotal.toLocaleString("en-IN")}\n` +
      `भुगतान माध्यम: ${completedBill.paymentMode.toUpperCase()}\n` +
      (completedBill.dueAmount > 0 ? `⚠️ शेष बकाया (Udhaar): ₹${completedBill.dueAmount.toLocaleString("en-IN")}\n` : `✓ पूर्ण भुगतान प्राप्त\n`) +
      `\nखरीदारी के लिए धन्यवाद! फिर पधारें।`
    );

    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  const handleResetModal = () => {
    setCompletedBill(null);
    setPaymentMode("upi");
    onClose();
  };

  const paymentOptions = [
    { id: "upi", label: "UPI Soundbox", sub: "साउंडबॉक्स / QR", icon: QrCode, desc: "Instant Dynamic QR & Voice Chime" },
    { id: "cash", label: "नकद (Cash)", sub: "रोकड़ / छुट्टे", icon: Banknote, desc: "Indian Currency Tender & Change" },
    { id: "card", label: "Card POS", sub: "कार्ड मशीन", icon: CreditCard, desc: "Swiper Terminal / EDC Machine" },
    { id: "udhar", label: "बहीखाता (Khata)", sub: "उधारी खाता", icon: BookOpen, desc: "Credit Ledger / Customer Balance" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200">
        {/* Square-style Top Modal Bar */}
        <div className="bg-zinc-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <h3 id="payment-modal-title" className="font-semibold text-sm tracking-tight text-white">
                Tender Checkout · भुगतान काउंटर
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {cartCustomer ? `${cartCustomer.name} (★ ${cartCustomer.loyaltyPoints || 0} pts)` : "फुटकर ग्राहक (Walk-in)"}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetModal}
            aria-label="Close payment modal"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {!completedBill ? (
          <div className="p-5 space-y-4">
            {/* High-Contrast Total Due LED Display */}
            <div className="bg-zinc-950 text-white rounded-xl px-4 py-3 flex items-baseline justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  कुल देय राशि (Amount to Collect)
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  All taxes & discounts included
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
                ₹{cartGrandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 block">
                Select Payment Method · भुगतान का माध्यम चुनें:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMode === mode.id;
                  return (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => setPaymentMode(mode.id)}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[58px] cursor-pointer ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900 shadow-2xs"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-zinc-950" : "text-zinc-400"}`} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-zinc-900">
                            {mode.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{mode.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode 1: Dynamic NPCI UPI QR Generator + Indian Soundbox Simulation */}
            {paymentMode === "upi" && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col items-center text-center gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-zinc-200 flex justify-center shadow-xs">
                  <OfflineQrCode value={upiUri} size={135} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">
                    Scan with PhonePe, Google Pay, Paytm, BHIM UPI
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    VPA: {storeConfig.upiId || "guptakirana@upi"}
                  </p>
                </div>

                {/* Indian Soundbox Voice/Chime Simulator */}
                <div className="w-full pt-2 border-t border-zinc-200 space-y-2">
                  <button
                    type="button"
                    onClick={handleTriggerSoundbox}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                      upiVerified
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-amber-400 hover:bg-amber-500 text-zinc-950"
                    } ${soundboxPlaying ? "scale-98 ring-2 ring-emerald-500" : ""}`}
                  >
                    <Volume2 className={`w-4 h-4 ${soundboxPlaying ? "animate-bounce" : ""}`} />
                    <span>
                      {upiVerified
                        ? "✓ Soundbox Verified (साउंडबॉक्स पुष्टि पूर्ण)"
                        : "🔊 Play Soundbox Chime & Confirm (साउंडबॉक्स बजाएं)"}
                    </span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono px-1">
                    <span>
                      {upiVerified ? "Voice Chime: ₹" + cartGrandTotal + " प्राप्त हुए ✓" : "Paytm / PhonePe Soundbox voice simulation"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUpiVerified(!upiVerified)}
                      className="text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
                    >
                      {upiVerified ? "Undo" : "Manual check"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Cash Tender & Indian Banknote Change Calculator */}
            {paymentMode === "cash" && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                {/* Banknote Tender Quick Chips */}
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 mb-1.5 block">
                    Quick Banknote Tender (भारतीय नोट का चयन करें):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {getCurrencyChips().map((chipVal) => (
                      <button
                        key={chipVal}
                        type="button"
                        onClick={() => setCashTendered(chipVal)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition cursor-pointer ${
                          cashTendered === chipVal
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        {chipVal === cartGrandTotal ? `बराबर ₹${chipVal}` : `₹${chipVal}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numerical Input */}
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-800 pt-2 border-t border-zinc-200">
                  <span>ग्राहक ने नकद दिए (Cash Tendered):</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-zinc-400">₹</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(Number(e.target.value))}
                      className="w-28 bg-white border border-zinc-300 rounded-lg px-2.5 py-1 text-right font-mono text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                {/* Change Return Deck */}
                <div className="pt-2.5 border-t border-zinc-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-zinc-700">
                    वापस करने हैं (Change Due):
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                    ₹{cashChangeReturn.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Smart Denomination Breakdown for Cashier */}
                {cashChangeReturn > 0 && denominations.length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-200 rounded-lg p-2.5 space-y-1">
                    <span className="text-[10px] font-semibold text-emerald-900 block font-mono">
                      छुट्टे पैसे का हिसाब (Denomination Breakdown):
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] font-mono">
                      {denominations.map((d) => (
                        <span
                          key={d.denom}
                          className="bg-white border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded font-medium shadow-2xs"
                        >
                          ₹{d.denom} × <strong>{d.count}</strong> {d.isCoin ? "सिक्का" : "नोट"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Card Swiper Terminal */}
            {paymentMode === "card" && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-800">
                  <span>Card POS Terminal / EDC Machine</span>
                  <span className="text-[10px] bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-mono">PineLabs / Mswipe</span>
                </div>
                <input
                  type="text"
                  placeholder="Optional: Enter card slip approval code or last 4 digits"
                  value={cardAuthCode}
                  onChange={(e) => setCardAuthCode(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-900"
                />
                <p className="text-[10px] text-zinc-500 font-mono">
                  Record slip code for reconciliation · External card swiper
                </p>
              </div>
            )}

            {/* Mode 4: Udhaar Ledger Notice */}
            {paymentMode === "udhar" && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                cartCustomer ? "bg-amber-500/10 border-amber-300 text-amber-950" : "bg-red-500/10 border-red-300 text-red-950"
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>{cartCustomer ? "बहीखाता उधारी दर्ज करें (Udhaar Entry)" : "⚠️ ग्राहक खाता आवश्यक है"}</span>
                </div>
                {cartCustomer ? (
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">ग्राहक (Customer):</span>
                      <span className="font-bold text-zinc-900">{cartCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">पुराना बकाया (Current Due):</span>
                      <span className="font-bold text-amber-900">₹{(cartCustomer.balance || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-amber-200">
                      <span className="text-zinc-600">नया कुल बकाया (New Balance):</span>
                      <span className="font-bold text-zinc-950">₹{((cartCustomer.balance || 0) + cartGrandTotal).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-red-800">
                    उधारी केवल पंजीकृत ग्राहक खाते में ही दर्ज हो सकती है। कृपया पहले ग्राहक चुनें।
                  </p>
                )}
              </div>
            )}

            {/* Primary Complete Transaction Button */}
            <button
              onClick={handleFinalCheckout}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>CONFIRM PAYMENT & ISSUE BILL · भुगतान दर्ज करें</span>
            </button>
          </div>
        ) : (
          /* ============================================================ */
          /* POST-CHECKOUT SUCCESS & INDIAN WHATSAPP / PRINT EXPERIENCE   */
          /* ============================================================ */
          <div className="p-6 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">
                बिल सफलतापूर्वक जनरेट हुआ (Invoice Generated)
              </span>
              <h4 className="text-2xl font-bold font-mono text-zinc-900 mt-1">
                {completedBill.id}
              </h4>
              <p className="text-xs text-zinc-600 mt-1">
                Amount:{" "}
                <strong className="font-mono text-emerald-700 text-sm">₹{completedBill.grandTotal.toLocaleString("en-IN")}</strong>{" "}
                via {completedBill.paymentMode.toUpperCase()}
              </p>
            </div>

            {/* 1-Click WhatsApp Bill Share */}
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp पर रसीद भेजें (Share Receipt on WhatsApp)</span>
            </button>

            {/* Thermal Slip vs A4 GST Tax Invoice */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => handlePrintReceipt("thermal")}
                className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>80mm पर्ची (Thermal)</span>
              </button>

              <button
                onClick={() => handlePrintReceipt("standard")}
                className="py-2.5 bg-white hover:bg-zinc-100 text-zinc-800 font-medium rounded-lg text-xs transition border border-zinc-200 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-500 inline mr-1" />
                <span>पक्का बिल (A4 GST)</span>
              </button>
            </div>

            {/* Bill Preview Button */}
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium rounded-lg text-xs transition border border-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-600" />
              <span>रसीद पूर्वावलोकन देखें (Preview Invoice On-Screen)</span>
            </button>

            {/* Next Sale Button */}
            <button
              onClick={handleResetModal}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg text-xs transition cursor-pointer"
            >
              Start Next Sale · नया बिल बनाएं (Space)
            </button>
          </div>
        )}
      </div>

      {/* On-screen Bill Preview Modal */}
      {completedBill && (
        <InvoicePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          bill={completedBill}
        />
      )}
    </div>
  );
};
