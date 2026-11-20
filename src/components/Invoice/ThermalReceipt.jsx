import React from "react";
import { useStore } from "../../context/useStore";
import { OfflineQrCode } from "../../utils/qrCodeSvg";

export const ThermalReceipt = ({ bill, isPreview = false }) => {
  const { storeConfig } = useStore();
  if (!bill) return null;

  const config = storeConfig || {};
  const isTaxInvoice = Boolean(config.gstin);
  const upiId = config.upiId || "guptakirana@upi";
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    config.name || "DukaanPOS"
  )}&am=${bill.grandTotal}&cu=INR&tn=Bill%20${encodeURIComponent(bill.id)}`;

  // Formatting helpers
  const billDate = bill.date ? new Date(bill.date) : new Date();
  const dateStr = billDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = billDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Calculate items summary
  const totalItemLines = bill.items?.length || 0;
  const totalQuantity = (bill.items || []).reduce(
    (acc, item) => acc + (Number(item.qty) || 1),
    0
  );

  // Calculate total customer savings if MRP is known, or from bill discount
  const declaredDiscount = Number(bill.discount) || 0;
  const extraMrpSavings = (bill.items || []).reduce((acc, item) => {
    const mrp = Number(item.mrp) || Number(item.price) || 0;
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    return acc + Math.max(0, (mrp - price) * qty);
  }, 0);
  const totalSavings = Math.round((declaredDiscount + extraMrpSavings) * 100) / 100;

  // Split tax intra-state (CGST + SGST)
  const totalTax = Number(bill.taxAmount) || 0;
  const cgstAmount = Math.round((totalTax / 2) * 100) / 100;
  const sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  const taxableBase = Math.round(((Number(bill.subtotal) || Number(bill.grandTotal)) - totalTax) * 100) / 100;

  return (
    <div
      id={isPreview ? undefined : "printable-section"}
      className={`${
        isPreview
          ? "block shadow-md border border-zinc-300 rounded-xs"
          : "hidden print:block"
      } w-[76mm] max-w-[80mm] p-2 bg-white text-black font-mono text-[11px] leading-tight mx-auto select-text`}
      style={{
        fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
      }}
    >
      {/* ============================================================ */}
      {/* 1. STORE HEADER & STATUTORY IDENTIFIERS                      */}
      {/* ============================================================ */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h1 className="font-extrabold text-sm tracking-tight uppercase leading-snug">
          {config.name || "DUKAAN RETAIL STORE"}
        </h1>
        {config.tagline && (
          <p className="text-[10px] text-gray-700 tracking-tight">{config.tagline}</p>
        )}
        <p className="text-[10px] mt-0.5 leading-tight">{config.address}</p>
        <p className="text-[10px]">
          Ph: {config.phone} {config.ownerName ? `· ${config.ownerName}` : ""}
        </p>

        <div className="mt-1 pt-1 border-t border-dotted border-gray-400 text-[10px] space-y-0.5">
          {config.gstin && (
            <p className="font-bold">
              GSTIN: <span className="font-mono">{config.gstin}</span>
            </p>
          )}
          {config.fssai && (
            <p className="text-[9px]">
              FSSAI Lic No: <span className="font-mono">{config.fssai}</span>
            </p>
          )}
        </div>

        {/* Invoice Classification Banner */}
        <div className="mt-1.5 py-0.5 px-2 inline-block bg-black text-white text-[10px] font-bold uppercase tracking-wider">
          {isTaxInvoice ? "TAX INVOICE · कर बीजक" : "RETAIL ESTIMATE · कच्चा पर्ची"}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. INVOICE META & CUSTOMER DETAILS                          */}
      {/* ============================================================ */}
      <div className="py-1.5 border-b border-dashed border-black text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span>
            Bill No: <strong className="font-mono">{bill.id}</strong>
          </span>
          <span className="font-mono">{dateStr}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Time: {timeStr}</span>
          <span>Cashier: {bill.operator || "Till-01"}</span>
        </div>
        <div className="pt-0.5 flex justify-between border-t border-dotted border-gray-300">
          <span className="truncate max-w-[180px]">
            Cust: <strong>{bill.customerName || "Walk-in Customer"}</strong>
          </span>
          {bill.customerPhone && (
            <span className="font-mono">{bill.customerPhone}</span>
          )}
        </div>
        {bill.pointsEarned > 0 && (
          <div className="text-[9px] text-gray-600">
            ★ Loyalty Points Earned: +{bill.pointsEarned} pts
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. ITEM-WISE TABLE (80mm Monospace Character Aligned)        */}
      {/* ============================================================ */}
      <div className="py-1.5 border-b border-dashed border-black">
        {/* Table Header */}
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1 text-[10px] uppercase">
          <span className="w-[45%] text-left">Item</span>
          <span className="w-[20%] text-right">Rate</span>
          <span className="w-[15%] text-center">Qty</span>
          <span className="w-[20%] text-right">Amt (₹)</span>
        </div>

        {/* Item Rows */}
        <div className="space-y-1">
          {(bill.items || []).map((item, idx) => {
            const qtyStr = `${item.qty} ${item.unit || ""}`.trim();
            return (
              <div key={idx} className="text-[10px]">
                <div className="flex justify-between font-medium">
                  <span className="w-[45%] truncate font-semibold">
                    {idx + 1}. {item.name}
                  </span>
                  <span className="w-[20%] text-right font-mono">
                    ₹{item.price}
                  </span>
                  <span className="w-[15%] text-center font-mono font-bold">
                    {qtyStr}
                  </span>
                  <span className="w-[20%] text-right font-mono font-bold">
                    ₹{item.total?.toLocaleString("en-IN")}
                  </span>
                </div>
                {(item.hsn || item.gst !== undefined) && (
                  <div className="text-[9px] text-gray-600 pl-3">
                    {item.hsn ? `HSN: ${item.hsn} ` : ""}
                    {item.gst !== undefined ? `[GST ${item.gst}%]` : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. TOTALS, SAVINGS & TAX BREAKDOWN                          */}
      {/* ============================================================ */}
      <div className="py-1.5 space-y-1 border-b border-dashed border-black text-[10px]">
        {/* Items & Qty Count */}
        <div className="flex justify-between text-gray-700">
          <span>Total Item Lines: {totalItemLines}</span>
          <span>Total Qty: {Math.round(totalQuantity * 1000) / 1000}</span>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between pt-0.5">
          <span>Subtotal (सकल मूल्य):</span>
          <span className="font-mono font-semibold">
            ₹{(Number(bill.subtotal) || Number(bill.grandTotal)).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Discount Line */}
        {declaredDiscount > 0 && (
          <div className="flex justify-between text-gray-800 font-semibold">
            <span>Special Discount (छूट):</span>
            <span className="font-mono">− ₹{declaredDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        {/* Big Savings Highlight */}
        {totalSavings > 0 && (
          <div className="my-1 py-1 px-2 bg-gray-100 border border-gray-300 text-center font-bold text-[10px]">
            🎉 YOU SAVED ₹{totalSavings.toLocaleString("en-IN")} ON THIS BILL!
          </div>
        )}

        {/* GST Tax Summary Breakout (CGST + SGST) */}
        {totalTax > 0 && (
          <div className="pt-1 border-t border-dotted border-gray-300 space-y-0.5 text-[9px] text-gray-700">
            <div className="flex justify-between">
              <span>Taxable Base Value:</span>
              <span className="font-mono">₹{taxableBase.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (Central Tax):</span>
              <span className="font-mono">₹{cgstAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (State Tax):</span>
              <span className="font-mono">₹{sgstAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-black">
              <span>Total GST Included:</span>
              <span className="font-mono">₹{totalTax.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}

        {/* Grand Total Bar */}
        <div className="pt-1.5 pb-1 border-t-2 border-b-2 border-black flex justify-between items-baseline font-extrabold text-sm">
          <span>GRAND TOTAL (कुल देय):</span>
          <span className="text-base font-mono">
            ₹{bill.grandTotal?.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Payment Tender & Change Breakdown */}
        <div className="pt-1 space-y-0.5 text-[10px]">
          <div className="flex justify-between font-semibold">
            <span>Payment Mode:</span>
            <span className="uppercase font-mono font-bold">
              {bill.paymentMode === "upi"
                ? "UPI Dynamic QR"
                : bill.paymentMode === "cash"
                ? "CASH (रोकड़)"
                : bill.paymentMode === "card"
                ? "POS Card Machine"
                : "UDHAAR (बहीखाता)"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span className="font-mono font-bold">
              ₹{(bill.paidAmount !== undefined ? bill.paidAmount : bill.grandTotal)?.toLocaleString("en-IN")}
            </span>
          </div>

          {bill.paymentMode === "cash" && bill.tenderedAmount > bill.grandTotal && (
            <>
              <div className="flex justify-between text-gray-700">
                <span>Cash Tendered (दिया):</span>
                <span className="font-mono">₹{bill.tenderedAmount?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-black">
                <span>Change Returned (वापस):</span>
                <span className="font-mono font-bold">
                  ₹{(bill.changeReturned || (bill.tenderedAmount - bill.grandTotal))?.toLocaleString("en-IN")}
                </span>
              </div>
            </>
          )}

          {/* Udhaar Ledger Impact */}
          {bill.dueAmount > 0 && (
            <div className="p-1 bg-gray-100 border border-gray-400 rounded text-[9px] font-bold space-y-0.5 mt-1">
              <div className="flex justify-between text-black">
                <span>Current Udhaar Added:</span>
                <span className="font-mono">₹{bill.dueAmount?.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[8px] text-gray-600">
                Added to customer ledger account
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. DYNAMIC UPI QR & DIGITAL PAYMENT CODE                    */}
      {/* ============================================================ */}
      <div className="py-2 text-center border-b border-dashed border-black flex flex-col items-center justify-center">
        <div className="p-1 bg-white border border-black inline-block">
          <OfflineQrCode value={upiPayUri} size={90} />
        </div>
        <p className="text-[9px] font-bold mt-1 uppercase tracking-wider">
          SCAN QR TO PAY VIA UPI / VERIFY
        </p>
        <p className="text-[8px] text-gray-600 font-mono">
          VPA: {upiId}
        </p>
      </div>

      {/* ============================================================ */}
      {/* 6. STATUTORY TERMS & PROFESSIONAL FOOTER                     */}
      {/* ============================================================ */}
      <div className="pt-2 text-center text-[9px] space-y-1 leading-tight">
        <p className="font-bold text-[10px] tracking-wide">
          *** धन्यवाद! फिर पधारें · THANK YOU! ***
        </p>
        <p>1. Exchange possible within 7 days with original bill.</p>
        <p>2. Loose/cut Kirana & perishable items non-returnable.</p>
        <p>3. Subject to local municipal jurisdiction.</p>
        <p className="text-[8px] text-gray-500 font-mono pt-1">
          Generated via DukaanPOS Smart Retail Engine
        </p>
        <div className="text-center font-mono text-[8px] tracking-widest text-gray-400 pt-1">
          - - - - - - - - - ✂ CUT HERE - - - - - - - - -
        </div>
      </div>
    </div>
  );
};
