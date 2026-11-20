import React from "react";
import { useStore } from "../../context/useStore";
import { numberToIndianWords } from "../../utils/numberToWords";
import { OfflineQrCode } from "../../utils/qrCodeSvg";

export const StandardInvoice = ({ bill, isPreview = false }) => {
  const { storeConfig } = useStore();
  if (!bill) return null;

  const config = storeConfig || {};
  const isGstRegistered = Boolean(config.gstin);

  // Date & Time formatting
  const invoiceDate = bill.date ? new Date(bill.date) : new Date();
  const dateStr = invoiceDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = invoiceDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Items processing and calculation
  const items = (bill.items || []).map((item, index) => {
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const mrp = Number(item.mrp) || price;
    const discount = Number(item.discount) || 0;
    const gstRate = Number(item.gst ?? 5);
    const lineTotal = Number(item.total) || Math.round((price * qty - discount) * 100) / 100;
    
    // Reverse tax calculation if tax included in price
    const taxableValue = Math.round((lineTotal / (1 + gstRate / 100)) * 100) / 100;
    const taxAmount = Math.round((lineTotal - taxableValue) * 100) / 100;
    const cgstRate = gstRate / 2;
    const sgstRate = gstRate / 2;
    const cgstAmount = Math.round((taxAmount / 2) * 100) / 100;
    const sgstAmount = Math.round((taxAmount - cgstAmount) * 100) / 100;

    return {
      sno: index + 1,
      name: item.name,
      hsn: item.hsn || "1904",
      unit: item.unit || "Pcs",
      batch: item.batch,
      expiry: item.expiry,
      qty,
      mrp,
      price,
      discount,
      gstRate,
      taxableValue,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      lineTotal,
    };
  });

  // HSN Summary aggregation
  const hsnMap = {};
  items.forEach((it) => {
    if (!hsnMap[it.hsn]) {
      hsnMap[it.hsn] = {
        hsn: it.hsn,
        taxableValue: 0,
        cgstRate: it.cgstRate,
        cgstAmount: 0,
        sgstRate: it.sgstRate,
        sgstAmount: 0,
        totalTax: 0,
      };
    }
    hsnMap[it.hsn].taxableValue += it.taxableValue;
    hsnMap[it.hsn].cgstAmount += it.cgstAmount;
    hsnMap[it.hsn].sgstAmount += it.sgstAmount;
    hsnMap[it.hsn].totalTax += it.cgstAmount + it.sgstAmount;
  });

  const hsnSummaryList = Object.values(hsnMap).map((row) => ({
    ...row,
    taxableValue: Math.round(row.taxableValue * 100) / 100,
    cgstAmount: Math.round(row.cgstAmount * 100) / 100,
    sgstAmount: Math.round(row.sgstAmount * 100) / 100,
    totalTax: Math.round(row.totalTax * 100) / 100,
  }));

  // Overall Financial Totals
  const totalTaxable = Math.round(
    hsnSummaryList.reduce((acc, h) => acc + h.taxableValue, 0) * 100
  ) / 100;
  const totalCgst = Math.round(
    hsnSummaryList.reduce((acc, h) => acc + h.cgstAmount, 0) * 100
  ) / 100;
  const totalSgst = Math.round(
    hsnSummaryList.reduce((acc, h) => acc + h.sgstAmount, 0) * 100
  ) / 100;
  const grandTotal = Number(bill.grandTotal) || 0;
  const subtotal = Number(bill.subtotal) || grandTotal;
  const billDiscount = Number(bill.discount) || 0;
  const roundOff = Math.round((grandTotal - (totalTaxable + totalCgst + totalSgst)) * 100) / 100;

  // Amount in words
  const amountInWords = numberToIndianWords(grandTotal);

  // Bank & UPI configuration
  const upiId = config.upiId || "guptakirana@upi";
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    config.name || "DukaanPOS"
  )}&am=${grandTotal}&cu=INR&tn=Invoice%20${encodeURIComponent(bill.id)}`;

  return (
    <div
      id={isPreview ? undefined : "printable-section-a4"}
      className={`${
        isPreview
          ? "block shadow-xl border border-zinc-300"
          : "hidden print:block"
      } w-full max-w-[210mm] p-8 bg-white text-zinc-950 font-sans text-xs leading-normal mx-auto`}
      style={{ boxSizing: "border-box" }}
    >
      {/* ============================================================ */}
      {/* 1. TOP STATUTORY HEADER & CLASSIFICATION                     */}
      {/* ============================================================ */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-zinc-900 text-white px-2 py-0.5 rounded-xs font-semibold">
            {isGstRegistered ? "TAX INVOICE / कर बीजक" : "RETAIL INVOICE / बिल रसीद"}
          </span>
          <span className="ml-2 text-[10px] text-zinc-500 font-mono">
            (Rule 46 of Central Goods and Services Tax Rules, 2017)
          </span>
        </div>
        <div className="text-right text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700">
          ORIGINAL FOR RECIPIENT · मूल प्रति
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SUPPLIER (SELLER) & BUYER (RECIPIENT) BILATERAL CARDS    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-4 border border-zinc-800 rounded-xs p-3.5 mb-4 bg-zinc-50/50">
        {/* Left: Supplier Details */}
        <div className="space-y-1 border-r border-zinc-300 pr-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider">
              SUPPLIER (बिक्रेता):
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              GST Registered
            </span>
          </div>
          <h2 className="text-base font-extrabold text-zinc-950 tracking-tight leading-snug">
            {config.name || "Gupta Multi-Vertical Retail Hub"}
          </h2>
          {config.tagline && (
            <p className="text-[11px] text-zinc-600 italic">{config.tagline}</p>
          )}
          <p className="text-[11px] text-zinc-700 leading-snug">
            {config.address || "Shop 12-14, Main Bazaar, Sector 14, Delhi - 110085"}
          </p>
          <div className="grid grid-cols-2 gap-x-2 text-[11px] pt-1">
            <p>
              <strong className="text-zinc-900">Phone:</strong> {config.phone || "+91 98765 43210"}
            </p>
            <p>
              <strong className="text-zinc-900">State:</strong> Delhi (Code: 07)
            </p>
          </div>
          {config.gstin && (
            <p className="text-[11px]">
              <strong className="text-zinc-900">GSTIN / UIN:</strong>{" "}
              <span className="font-mono font-bold text-zinc-950">{config.gstin}</span>
            </p>
          )}
          {config.fssai && (
            <p className="text-[10px] text-zinc-600">
              <strong>FSSAI Lic No:</strong> <span className="font-mono">{config.fssai}</span>
            </p>
          )}
        </div>

        {/* Right: Invoice Metadata & Buyer Details */}
        <div className="space-y-1.5 pl-1">
          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded border border-zinc-200 text-[11px]">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-mono">Invoice Number</span>
              <strong className="font-mono text-xs text-zinc-950">{bill.id}</strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-mono">Invoice Date & Time</span>
              <span className="font-mono text-zinc-900 font-semibold">{dateStr} {timeStr}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-mono">Place of Supply</span>
              <span className="font-semibold text-zinc-900">Delhi (07)</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-mono">Reverse Charge</span>
              <span className="font-mono font-bold text-zinc-900">NO</span>
            </div>
          </div>

          {/* Customer (Buyer) Card */}
          <div className="pt-1 text-[11px] space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider block">
              BILLED TO (क्रेता / ग्राहक):
            </span>
            <div className="font-bold text-zinc-950 text-xs">
              {bill.customerName || "Counter Cash Customer (फुटकर उपभोक्ता)"}
            </div>
            {bill.customerPhone && (
              <p className="text-zinc-700">
                <strong>Contact No:</strong> <span className="font-mono">{bill.customerPhone}</span>
              </p>
            )}
            <p className="text-zinc-600 text-[10px]">
              <strong>Type:</strong> Consumer (B2C) · Unregistered Recipient
            </p>
            {bill.operator && (
              <p className="text-zinc-500 text-[10px]">
                <strong>Operator / Counter:</strong> {bill.operator}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ITEM-WISE TAX SCHEDULE (11 COLUMNS)                      */}
      {/* ============================================================ */}
      <div className="mb-4 overflow-hidden border border-zinc-800">
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-zinc-900 text-white uppercase text-[9px] font-mono tracking-wider">
              <th className="p-1.5 text-center border-r border-zinc-700 w-[4%]">#</th>
              <th className="p-1.5 text-left border-r border-zinc-700 w-[30%]">Item Description</th>
              <th className="p-1.5 text-center border-r border-zinc-700 w-[8%]">HSN</th>
              <th className="p-1.5 text-center border-r border-zinc-700 w-[8%]">Qty</th>
              <th className="p-1.5 text-right border-r border-zinc-700 w-[8%]">MRP (₹)</th>
              <th className="p-1.5 text-right border-r border-zinc-700 w-[8%]">Rate (₹)</th>
              <th className="p-1.5 text-right border-r border-zinc-700 w-[9%]">Taxable (₹)</th>
              <th className="p-1.5 text-center border-r border-zinc-700 w-[6%]">CGST</th>
              <th className="p-1.5 text-center border-r border-zinc-700 w-[6%]">SGST</th>
              <th className="p-1.5 text-right w-[11%]">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {items.map((it) => (
              <tr key={it.sno} className="hover:bg-zinc-50">
                <td className="p-1.5 text-center font-mono border-r border-zinc-200">
                  {it.sno}
                </td>
                <td className="p-1.5 border-r border-zinc-200">
                  <div className="font-semibold text-zinc-900">{it.name}</div>
                  {(it.batch || it.expiry) && (
                    <div className="text-[8px] text-zinc-500 font-mono">
                      {it.batch ? `Batch: ${it.batch} ` : ""}
                      {it.expiry ? `Exp: ${it.expiry}` : ""}
                    </div>
                  )}
                </td>
                <td className="p-1.5 text-center font-mono border-r border-zinc-200 text-zinc-700">
                  {it.hsn}
                </td>
                <td className="p-1.5 text-center font-mono border-r border-zinc-200 font-semibold">
                  {it.qty} {it.unit}
                </td>
                <td className="p-1.5 text-right font-mono border-r border-zinc-200 text-zinc-500">
                  ₹{it.mrp}
                </td>
                <td className="p-1.5 text-right font-mono border-r border-zinc-200">
                  ₹{it.price}
                </td>
                <td className="p-1.5 text-right font-mono border-r border-zinc-200 font-semibold">
                  ₹{it.taxableValue.toFixed(2)}
                </td>
                <td className="p-1.5 text-center font-mono border-r border-zinc-200 text-[9px]">
                  <span>{it.cgstRate}%</span>
                  <div className="text-zinc-500">₹{it.cgstAmount.toFixed(2)}</div>
                </td>
                <td className="p-1.5 text-center font-mono border-r border-zinc-200 text-[9px]">
                  <span>{it.sgstRate}%</span>
                  <div className="text-zinc-500">₹{it.sgstAmount.toFixed(2)}</div>
                </td>
                <td className="p-1.5 text-right font-mono font-bold text-zinc-950">
                  ₹{it.lineTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-zinc-900 bg-zinc-100 font-bold text-[9px] font-mono">
            <tr>
              <td colSpan={3} className="p-1.5 text-center uppercase border-r border-zinc-300">
                Total Line Items: {items.length}
              </td>
              <td className="p-1.5 text-center border-r border-zinc-300">
                {items.reduce((acc, it) => acc + it.qty, 0)}
              </td>
              <td colSpan={2} className="p-1.5 text-right border-r border-zinc-300">
                Taxable Subtotal:
              </td>
              <td className="p-1.5 text-right border-r border-zinc-300">
                ₹{totalTaxable.toFixed(2)}
              </td>
              <td className="p-1.5 text-center border-r border-zinc-300">
                ₹{totalCgst.toFixed(2)}
              </td>
              <td className="p-1.5 text-center border-r border-zinc-300">
                ₹{totalSgst.toFixed(2)}
              </td>
              <td className="p-1.5 text-right text-xs text-zinc-950">
                ₹{grandTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ============================================================ */}
      {/* 4. STATUTORY HSN/SAC TAX SUMMARY SCHEDULE                   */}
      {/* ============================================================ */}
      <div className="mb-4">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
          Statutory HSN / SAC Tax Summary Schedule:
        </h4>
        <table className="w-full border-collapse border border-zinc-300 text-[9px] font-mono">
          <thead>
            <tr className="bg-zinc-100 text-zinc-800 uppercase font-semibold">
              <th className="p-1 border border-zinc-300 text-left">HSN / SAC</th>
              <th className="p-1 border border-zinc-300 text-right">Taxable Amount (₹)</th>
              <th className="p-1 border border-zinc-300 text-center">CGST Rate</th>
              <th className="p-1 border border-zinc-300 text-right">CGST Amt (₹)</th>
              <th className="p-1 border border-zinc-300 text-center">SGST Rate</th>
              <th className="p-1 border border-zinc-300 text-right">SGST Amt (₹)</th>
              <th className="p-1 border border-zinc-300 text-right">Total Tax (₹)</th>
            </tr>
          </thead>
          <tbody>
            {hsnSummaryList.map((h, i) => (
              <tr key={i} className="text-zinc-700">
                <td className="p-1 border border-zinc-300 font-bold">{h.hsn}</td>
                <td className="p-1 border border-zinc-300 text-right">₹{h.taxableValue.toFixed(2)}</td>
                <td className="p-1 border border-zinc-300 text-center">{h.cgstRate}%</td>
                <td className="p-1 border border-zinc-300 text-right">₹{h.cgstAmount.toFixed(2)}</td>
                <td className="p-1 border border-zinc-300 text-center">{h.sgstRate}%</td>
                <td className="p-1 border border-zinc-300 text-right">₹{h.sgstAmount.toFixed(2)}</td>
                <td className="p-1 border border-zinc-300 text-right font-bold text-zinc-950">
                  ₹{h.totalTax.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-bold bg-zinc-50 text-zinc-900">
            <tr>
              <td className="p-1 border border-zinc-300 uppercase">Total Tax Pool:</td>
              <td className="p-1 border border-zinc-300 text-right">₹{totalTaxable.toFixed(2)}</td>
              <td className="p-1 border border-zinc-300"></td>
              <td className="p-1 border border-zinc-300 text-right">₹{totalCgst.toFixed(2)}</td>
              <td className="p-1 border border-zinc-300"></td>
              <td className="p-1 border border-zinc-300 text-right">₹{totalSgst.toFixed(2)}</td>
              <td className="p-1 border border-zinc-300 text-right">₹{(totalCgst + totalSgst).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ============================================================ */}
      {/* 5. FINANCIAL TOTALS & AMOUNT IN WORDS                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-12 gap-4 mb-4 items-start">
        {/* Left Column: Amount in Words & Bank Details (7 Cols) */}
        <div className="col-span-7 space-y-3">
          {/* Amount in Indian Words */}
          <div className="bg-zinc-50 border border-zinc-300 p-2.5 rounded-xs">
            <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold tracking-wider block">
              Invoice Amount in Words (भारतीय रुपया):
            </span>
            <p className="font-serif font-bold text-xs text-zinc-950 mt-0.5 leading-snug">
              {amountInWords}
            </p>
          </div>

          {/* Bank & Digital UPI Settlement Box */}
          <div className="border border-zinc-300 p-2.5 rounded-xs flex items-center justify-between gap-3 bg-white">
            <div className="space-y-0.5 text-[10px]">
              <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold tracking-wider block">
                Direct Bank & UPI Transfer:
              </span>
              <p>
                <strong>Bank:</strong> {config.bankName || "State Bank of India (SBI)"}
              </p>
              <p>
                <strong>A/C No:</strong>{" "}
                <span className="font-mono">{config.bankAccount || "9180 2003 4410 9921"}</span>
              </p>
              <p>
                <strong>IFSC Code:</strong>{" "}
                <span className="font-mono">{config.bankIfsc || "SBIN0001234"}</span>
              </p>
              <p>
                <strong>UPI VPA:</strong>{" "}
                <span className="font-mono font-bold text-zinc-950">{upiId}</span>
              </p>
            </div>

            {/* Offline Vector UPI QR Code */}
            <div className="text-center shrink-0 pr-1">
              <OfflineQrCode value={upiPayUri} size={64} />
              <span className="text-[8px] font-mono text-zinc-500 block mt-0.5 uppercase">
                Scan to Pay
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Calculation Box (5 Cols) */}
        <div className="col-span-5 bg-zinc-50 border border-zinc-800 rounded-xs p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal (सकल मूल्य):</span>
            <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
          </div>

          {billDiscount > 0 && (
            <div className="flex justify-between text-rose-700 font-medium">
              <span>Trade Discount (छूट):</span>
              <span className="font-mono">− ₹{billDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-zinc-700">
            <span>Taxable Base Value:</span>
            <span className="font-mono">₹{totalTaxable.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-zinc-700">
            <span>Total CGST (9%/6%/2.5%):</span>
            <span className="font-mono">₹{totalCgst.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-zinc-700">
            <span>Total SGST (9%/6%/2.5%):</span>
            <span className="font-mono">₹{totalSgst.toFixed(2)}</span>
          </div>

          {Math.abs(roundOff) > 0.001 && (
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>Round Off:</span>
              <span className="font-mono">{roundOff > 0 ? `+ ₹${roundOff.toFixed(2)}` : `− ₹${Math.abs(roundOff).toFixed(2)}`}</span>
            </div>
          )}

          <div className="border-t-2 border-b-2 border-zinc-900 py-1.5 flex justify-between items-baseline font-black text-sm text-zinc-950">
            <span>INVOICE GRAND TOTAL:</span>
            <span className="font-mono text-base">₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Payment Mode & Tender Status */}
          <div className="pt-1 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-zinc-600">Payment Tender:</span>
              <span className="font-mono font-bold uppercase text-zinc-900">
                {bill.paymentMode}
              </span>
            </div>
            <div className="flex justify-between font-bold text-emerald-800">
              <span>Amount Received:</span>
              <span className="font-mono">
                ₹{(bill.paidAmount !== undefined ? bill.paidAmount : grandTotal).toFixed(2)}
              </span>
            </div>
            {bill.dueAmount > 0 && (
              <div className="flex justify-between font-bold text-rose-700">
                <span>Khata Balance Due:</span>
                <span className="font-mono">₹{bill.dueAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. STATUTORY DECLARATION, TERMS & SIGNATURE BLOCK            */}
      {/* ============================================================ */}
      <div className="border-t border-zinc-800 pt-3 grid grid-cols-2 gap-6 items-end text-[10px]">
        {/* Left: Terms and Statutory Declaration */}
        <div className="space-y-1.5 text-zinc-600">
          <div>
            <h5 className="font-bold uppercase text-[9px] text-zinc-800">Terms & Conditions:</h5>
            {config.receiptFooterNote ? (
              <p className="text-[9px] text-zinc-700 font-medium">{config.receiptFooterNote}</p>
            ) : (
              <ol className="list-decimal pl-3 space-y-0.5 text-[9px]">
                <li>Goods once sold can only be exchanged within 7 days against original invoice.</li>
                <li>Customized, altered, or opened consumable items are non-returnable.</li>
                <li>Disputes, if any, shall be subject to local court jurisdiction.</li>
              </ol>
            )}
          </div>
          <div className="pt-1 border-t border-dashed border-zinc-300 text-[8px] text-zinc-500 italic">
            "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."
          </div>
        </div>

        {/* Right: Authorized Signatory Block */}
        <div className="text-right space-y-8">
          <div className="text-[10px] text-zinc-800 font-semibold">
            For <span className="font-bold">{config.name || "Dukaan Universal Retail"}</span>
          </div>
          <div className="inline-block text-center border-t border-zinc-800 pt-1 w-44">
            <p className="font-bold text-zinc-950 text-[10px]">Authorized Signatory</p>
            <p className="text-[8px] text-zinc-400 font-mono">Digitally signed via DukaanPOS</p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="mt-4 pt-2 border-t border-dotted border-zinc-300 text-center text-[8px] font-mono text-zinc-400">
        This is a computer-generated Tax Invoice issued in compliance with the GST Act, 2017. No physical signature required.
      </div>
    </div>
  );
};