import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Send, Check, Copy } from "lucide-react";

export const WhatsAppMarketingHub = () => {
  const { customers, storeConfig } = useStore();
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0] || null);
  const [templateType, setTemplateType] = useState("promo");
  const [customMsg, setCustomMsg] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);

  const getTemplateText = () => {
    const name = selectedCustomer ? selectedCustomer.name : "Customer";
    if (templateType === "promo") {
      return `Namaste ${name} Ji! 🛒 
Special Kirana Offer at ${storeConfig.name}!
Get 10% OFF on Aashirvaad Atta, Fortune Mustard Oil & Amul Dairy items this week.
Visit us today or call ${storeConfig.phone} for home delivery!`;
    } else if (templateType === "loyalty") {
      return `Namaste ${name} Ji! 🎁
You have ${selectedCustomer?.loyaltyPoints || 50} Loyalty Points (₹${selectedCustomer?.loyaltyPoints || 50} Value) at ${storeConfig.name}.
Redeem your points on your next Kirana bill purchase!`;
    } else if (templateType === "bill") {
      return `Namaste ${name} Ji! 🧾
Thank you for shopping at ${storeConfig.name}!
Your bill receipt & GST breakdown is ready. 
For any orders, call us at ${storeConfig.phone}. Have a great day!`;
    }
    return customMsg;
  };

  const messageText = templateType === "custom" ? customMsg : getTemplateText();

  const handleSendWhatsApp = () => {
    if (!selectedCustomer || !selectedCustomer.phone) return;
    const cleanPhone = selectedCustomer.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const encodedText = encodeURIComponent(messageText);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedText}`, "_blank");
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(messageText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-brands fa-whatsapp text-emerald-500 text-xl"></i>
            <span>Kirana WhatsApp Marketing & Customer Engagement</span>
          </h2>
          <p className="text-xs text-slate-500">
            Send instant WhatsApp bill receipts, promotional offer broadcasts & double loyalty points alerts
          </p>
        </div>

        {copiedToast && (
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-[#1FAA59] border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>WhatsApp Text Copied!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Template & Customer Selector */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm font-display border-b border-slate-100 pb-2">
            Select Customer & Message Template
          </h3>

          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">
              Select Customer
            </label>
            <select
              value={selectedCustomer?.id || ""}
              onChange={(e) => {
                const c = customers.find((cust) => cust.id === e.target.value);
                setSelectedCustomer(c);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) — {c.loyaltyPoints || 0} Pts
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">
              Marketing Campaign Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType("promo")}
                className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                  templateType === "promo"
                    ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🛒 Kirana Discount Offer
              </button>

              <button
                type="button"
                onClick={() => setTemplateType("loyalty")}
                className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                  templateType === "loyalty"
                    ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🎁 Loyalty Points Alert
              </button>

              <button
                type="button"
                onClick={() => setTemplateType("bill")}
                className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                  templateType === "bill"
                    ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🧾 Bill Receipt Share
              </button>
            </div>
          </div>

          {templateType === "custom" && (
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Custom WhatsApp Message
              </label>
              <textarea
                rows="4"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type custom offer details..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none"
              />
            </div>
          )}
        </div>

        {/* Right Column: WhatsApp Live Message Preview */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm font-display border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>WhatsApp Message Preview</span>
              <span className="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Direct WhatsApp API
              </span>
            </h3>

            {/* Chat Bubble Simulation */}
            <div className="mt-4 p-4 bg-[#E5DDD5] rounded-2xl border border-emerald-200 max-h-64 overflow-y-auto">
              <div className="bg-[#DCF8C6] text-slate-900 p-3 rounded-2xl rounded-tl-none text-xs font-sans shadow-sm whitespace-pre-wrap leading-relaxed">
                {messageText}
                <div className="text-[9px] text-slate-500 text-right mt-1 font-mono">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={handleCopyText}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-slate-300 transition"
            >
              <Copy className="w-4 h-4 text-slate-600" />
              <span>Copy Text</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex-1 py-2.5 bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold font-display rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
