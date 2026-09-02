import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { MessageSquare, Send, CheckCircle, Users } from "lucide-react";

export const WhatsAppMarketingHub = () => {
  const { customers, storeConfig } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState("festival");
  const [customMsg, setCustomMsg] = useState("");
  const [sentToast, setSentToast] = useState(null);

  const templates = [
    {
      id: "festival",
      title: "Diwali & Festival Offer",
      text: `Namaste {NAME} ji! Special festival discounts on Kirana items at ${storeConfig.name}. Visit today or order via WhatsApp!`,
    },
    {
      id: "udhar_reminder",
      title: "Udhaar Ledger Payment Reminder",
      text: `Namaste {NAME} ji! Your pending balance at ${storeConfig.name} is ₹{BALANCE}. Kindly pay via UPI to ${storeConfig.upiId || "store@upi"}. Thank you!`,
    },
    {
      id: "new_stock",
      title: "Fresh Stock Arrival",
      text: `Namaste {NAME} ji! Fresh spices, pulses, and grocery items arrived at ${storeConfig.name}. Best prices guaranteed!`,
    },
  ];

  const handleSendCampaign = (customer) => {
    const templateText =
      customMsg || templates.find((t) => t.id === selectedTemplate)?.text || "";

    const personalized = templateText
      .replace("{NAME}", customer.name)
      .replace("{BALANCE}", customer.balance);

    const url = `https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(personalized)}`;
    window.open(url, "_blank");

    setSentToast(`WhatsApp message opened for ${customer.name}!`);
    setTimeout(() => setSentToast(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Till Header Banner */}
      <div className="bg-[#0F1F35] text-white rounded-xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-black font-display tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#F5A623]" />
            <span>WhatsApp Marketing & Offer Hub</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Send targeted promotions, payment reminders & festival deals
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2 rounded-lg text-right">
          <p className="text-[10px] text-amber-300 font-mono uppercase font-bold">Total Customers</p>
          <p className="text-base font-black font-mono text-white tabular-nums">{customers.length}</p>
        </div>
      </div>

      {sentToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#1FAA59] px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{sentToast}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Template Selector Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-slate-900 text-sm font-display">Select Campaign Template</h3>

          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t.id);
                  setCustomMsg("");
                }}
                className={`w-full text-left p-3.5 rounded-lg border-2 transition ${
                  selectedTemplate === t.id && !customMsg
                    ? "border-[#1E3A5F] bg-slate-50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <h5 className="font-bold text-xs text-slate-900 font-display">{t.title}</h5>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-mono">{t.text}</p>
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Custom Message Override</label>
            <textarea
              rows="3"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Type custom offer text here..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Customer List & One-Click Broadcast */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1E3A5F]" />
              <span>Customer Broadcast Directory ({customers.length})</span>
            </h3>
            <span className="text-[10px] bg-emerald-50 text-[#1FAA59] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
              1-TAP DEEP-LINK
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {customers.map((cust) => (
              <div
                key={cust.id}
                className="p-3 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-lg flex items-center justify-between gap-3 transition"
              >
                <div>
                  <h5 className="font-bold text-xs text-slate-900 font-display">{cust.name}</h5>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {cust.phone} · Balance: ₹{cust.balance}
                  </p>
                </div>

                <button
                  onClick={() => handleSendCampaign(cust)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition whitespace-nowrap min-h-[36px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Offer</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
