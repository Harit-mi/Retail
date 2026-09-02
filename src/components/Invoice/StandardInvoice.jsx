import React from "react";
import { useStore } from "../../context/useStore";

export const StandardInvoice = ({ bill }) => {
  const { storeConfig } = useStore();
  if (!bill) return null;

  const cgst = bill.taxAmount ? Math.round((bill.taxAmount / 2) * 100) / 100 : 0;
  const sgst = cgst;

  return (
    <div
      id="printable-section-a4"
      className="hidden print:block w-full max-w-[210mm] p-8 bg-white text-black font-sans text-xs mx-auto"
    >
      {/* Invoice Title & Store Branding Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
            TAX INVOICE
          </h1>
          <h2 className="text-base font-extrabold text-slate-800 mt-1">
            {storeConfig.name}
          </h2>
          <p className="text-xs text-slate-600">{storeConfig.address}</p>
          <p className="text-xs text-slate-600">Phone: {storeConfig.phone}</p>
          {storeConfig.gstin && (
            <p className="text-xs font-bold text-slate-900 mt-1">
              GSTIN: {storeConfig.gstin}
            </p>
          )}
        </div>

        <div className="text-right space-y-1 text-xs">
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-300">
            <p>
              <strong className="text-slate-900">Invoice No:</strong> {bill.id}
            </p>
            <p>
              <strong className="text-slate-900">Date:</strong>{" "}
              {new Date(bill.date).toLocaleDateString("en-IN")}
            </p>
            <p>
              <strong className="text-slate-900">Payment:</strong>{" "}
              <span className="uppercase">{bill.paymentMode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bill To Customer Section */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex justify-between">
        <div>
          <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-1">
            Billed To Customer:
          </h4>
          <h3 className="text-sm font-bold text-slate-900">
            {bill.customerName || "Cash Customer"}
          </h3>
          {bill.customerPhone && (
            <p className="text-xs text-slate-600">Mobile: {bill.customerPhone}</p>
          )}
        </div>

        <div className="text-right text-xs">
          <p className="text-slate-600">Place of Supply: Delhi (07)</p>
          <p className="text-slate-600">Reverse Charge: No</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-6 text-xs">
        <thead>
          <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold">
            <th className="p-2.5 text-left border border-slate-900">#</th>
            <th className="p-2.5 text-left border border-slate-900">Item Description</th>
            <th className="p-2.5 text-center border border-slate-900">HSN</th>
            <th className="p-2.5 text-center border border-slate-900">Qty</th>
            <th className="p-2.5 text-right border border-slate-900">Rate (₹)</th>
            <th className="p-2.5 text-center border border-slate-900">GST %</th>
            <th className="p-2.5 text-right border border-slate-900">Total (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          {bill.items.map((item, index) => (
            <tr key={index}>
              <td className="p-2.5 text-center border border-slate-300 font-mono">
                {index + 1}
              </td>
              <td className="p-2.5 font-bold text-slate-900 border border-slate-300">
                {item.name}
              </td>
              <td className="p-2.5 text-center font-mono border border-slate-300">
                {item.hsn || "1902"}
              </td>
              <td className="p-2.5 text-center font-bold border border-slate-300">
                {item.qty} {item.unit || "Pcs"}
              </td>
              <td className="p-2.5 text-right border border-slate-300">
                ₹{item.price}
              </td>
              <td className="p-2.5 text-center border border-slate-300">
                {item.gst}%
              </td>
              <td className="p-2.5 text-right font-bold border border-slate-300">
                ₹{item.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tax & Total Summary Breakdown */}
      <div className="flex justify-between items-start mb-8">
        <div className="w-1/2 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1 text-[11px]">
          <h4 className="font-bold text-slate-800 uppercase text-[10px]">
            Tax Breakdown (Intra-state GST):
          </h4>
          <div className="flex justify-between">
            <span>CGST (Central Tax):</span>
            <span>₹{cgst}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (State Tax):</span>
            <span>₹{sgst}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-300 pt-1">
            <span>Total Tax Included:</span>
            <span>₹{bill.taxAmount}</span>
          </div>
        </div>

        <div className="w-5/12 space-y-2 text-right">
          <div className="flex justify-between text-xs text-slate-700">
            <span>Subtotal:</span>
            <span>₹{bill.subtotal || bill.grandTotal}</span>
          </div>

          {bill.discount > 0 && (
            <div className="flex justify-between text-xs text-rose-600 font-bold">
              <span>Discount:</span>
              <span>- ₹{bill.discount}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-b-2 border-slate-900 py-2">
            <span>GRAND TOTAL:</span>
            <span>₹{bill.grandTotal}</span>
          </div>

          <div className="text-xs text-slate-600">
            Amount Paid: <strong>₹{bill.paidAmount || bill.grandTotal}</strong>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end pt-12">
        <div className="text-xs text-slate-500">
          <p>Terms & Conditions:</p>
          <p>1. Subject to Delhi jurisdiction.</p>
          <p>2. Goods once sold are not returnable.</p>
        </div>

        <div className="text-center font-bold text-xs">
          <div className="w-40 border-b border-slate-900 mb-2"></div>
          <p>For {storeConfig.name}</p>
          <p className="text-[10px] text-slate-500 font-normal">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};
