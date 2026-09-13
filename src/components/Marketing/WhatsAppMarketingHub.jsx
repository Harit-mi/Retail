import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { MessageSquare, Send, CheckCircle, Users } from "lucide-react";

export const WhatsAppMarketingHub = () => {
  const { customers, storeConfig } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState("festival");
  const [customMsg, setCustomMsg] = useState("");
  const [search, setSearch] = useState("");
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

  const activeTemplateObj = templates.find((t) => t.id === selectedTemplate);
  const activeTemplateText = customMsg || activeTemplateObj?.text || "";

  const previewCustomer = customers[0] || { name: "Ramesh Sharma", balance: 450, phone: "+91 98765 43210" };
  const previewText = activeTemplateText
    .replace("{NAME}", previewCustomer.name)
    .replace("{BALANCE}", previewCustomer.balance);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleSendCampaign = (customer) => {
    const personalized = activeTemplateText
      .replace("{NAME}", customer.name)
      .replace("{BALANCE}", customer.balance);

    const url = `https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(personalized)}`;
    window.open(url, "_blank");

    setSentToast(`WhatsApp opened for ${customer.name}!`);
    setTimeout(() => setSentToast(null), 3500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#0F1F35] text-white rounded-xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-black font-display tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#F5A623]" />
            <span>WhatsApp Marketing & Offer Hub</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Send 1-tap WhatsApp promotions, payment reminders & festival deals directly to customer phones
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2 rounded-lg text-right">
          <p className="text-[10px] text-amber-300 font-mono uppercase font-bold">Total Customers</p>
          <p className="text-base font-black font-mono text-white tabular-nums">{customers.length}</p>
        </div>
      </div>

      {/* 3-Step Guided How-To Bar */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white font-black text-xs flex items-center justify-center flex-shrink-0">1</span>
          <span className="font-bold text-slate-800">Pick Offer Template or Custom Text</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white font-black text-xs flex items-center justify-center flex-shrink-0">2</span>
          <span className="font-bold text-slate-800">Review Live WhatsApp Message Preview</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">3</span>
          <span className="font-bold text-slate-800">Click "Send Offer" to Open WhatsApp</span>
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
          <h3 className="font-extrabold text-slate-900 text-sm font-display">Step 1: Select Campaign Offer</h3>

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
              placeholder="Type custom offer message here (use {NAME} for customer name)..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F]"
            />
          </div>

          {/* Live Message Preview Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              💬 Live WhatsApp Preview
            </span>
            <p className="text-xs font-sans text-slate-800 italic bg-white p-2.5 rounded border border-emerald-100">
              "{previewText}"
            </p>
          </div>
        </div>

        {/* Customer List & One-Click Broadcast */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1E3A5F]" />
              <span>Step 3: Broadcast Directory ({filteredCustomers.length})</span>
            </h3>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name or phone…"
              className="w-full sm:w-64 bg-slate-50 border-2 border-slate-200 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="p-3 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-lg flex items-center justify-between gap-3 transition"
              >
                <div>
                  <h5 className="font-bold text-xs text-slate-900 font-display">{cust.name}</h5>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {cust.phone} · Balance: <strong className={cust.balance > 0 ? "text-[#E64545]" : "text-[#1FAA59]"}>₹{cust.balance}</strong>
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
