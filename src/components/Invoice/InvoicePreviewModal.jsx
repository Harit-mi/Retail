import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { ThermalReceipt } from "./ThermalReceipt";
import { StandardInvoice } from "./StandardInvoice";
import { X, Printer, Share2, Receipt, FileText } from "lucide-react";

export const InvoicePreviewModal = ({ isOpen, onClose, bill }) => {
  const { storeConfig, setPrintFormat, setPrintableBill } = useStore();
  const [activeTab, setActiveTab] = useState("thermal"); // 'thermal' | 'a4'

  if (!isOpen || !bill) return null;

  const handlePrint = (format) => {
    setPrintFormat(format);
    setPrintableBill(bill);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleSendWhatsApp = () => {
    const storeName = storeConfig?.name || "Gupta Retail Store";
    const customerName = bill.customerName || "ग्राहक";
    const phone = bill.customerPhone ? bill.customerPhone.replace(/\D/g, "") : "";
    const dateStr = new Date(bill.date).toLocaleDateString("en-IN");

    const text = encodeURIComponent(
      `*${storeName} — बिल रसीद*\n\n` +
      `नमस्ते ${customerName} जी,\n` +
      `रसीद संख्या: #${bill.id}\n` +
      `दिनांक: ${dateStr}\n` +
      `कुल राशि: ₹${bill.grandTotal?.toLocaleString("en-IN")}\n` +
      `भुगतान माध्यम: ${bill.paymentMode?.toUpperCase()}\n` +
      (bill.dueAmount > 0 ? `⚠️ शेष बकाया (Udhaar): ₹${bill.dueAmount.toLocaleString("en-IN")}\n` : `✓ पूर्ण भुगतान प्राप्त\n`) +
      `\nखरीदारी के लिए धन्यवाद! फिर पधारें।`
    );

    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-preview-title"
      className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      <div className="bg-zinc-100 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-zinc-300">
        {/* Header Bar */}
        <div className="bg-zinc-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-sm">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 id="invoice-preview-title" className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
                <span>Invoice / Bill Preview · रसीद पूर्वावलोकन</span>
                <span className="font-mono text-xs text-amber-300 bg-zinc-800 px-2 py-0.5 rounded">
                  #{bill.id}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                ₹{bill.grandTotal?.toLocaleString("en-IN")} via {bill.paymentMode?.toUpperCase()} · {bill.customerName || "Walk-in"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Switcher */}
            <div className="bg-zinc-800 p-1 rounded-lg flex gap-1 border border-zinc-700">
              <button
                type="button"
                onClick={() => setActiveTab("thermal")}
                className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "thermal"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>80mm Thermal</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("a4")}
                className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "a4"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 GST Invoice</span>
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close preview modal"
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-zinc-200/60">
          <div className="w-full max-w-[210mm] transition-all">
            {activeTab === "thermal" ? (
              <div className="flex justify-center">
                <ThermalReceipt bill={bill} isPreview={true} />
              </div>
            ) : (
              <div className="bg-white rounded shadow-sm">
                <StandardInvoice bill={bill} isPreview={true} />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-zinc-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-500 font-mono">
            Mode: {activeTab === "thermal" ? "80mm POS Roll Monospace" : "CBIC Rule 46 Tax Invoice A4"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Share</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrint(activeTab === "thermal" ? "thermal" : "standard")}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print {activeTab === "thermal" ? "80mm Slip" : "A4 Invoice"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};