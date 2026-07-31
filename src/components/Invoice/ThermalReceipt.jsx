import React from "react";
import { useStore } from "../../context/StoreContext";

export const ThermalReceipt = ({ bill }) => {
  const { storeConfig } = useStore();
  if (!bill) return null;

  return (
    <div
      id="printable-section"
      className="hidden print:block w-[80mm] max-w-[80mm] p-2 bg-white text-black font-mono text-xs leading-snug mx-auto"
    >
      {/* Store Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h2 className="font-extrabold text-sm uppercase tracking-tight">
          {storeConfig.name}
        </h2>
        <p className="text-[10px]">{storeConfig.tagline}</p>
        <p className="text-[10px]">{storeConfig.address}</p>
        <p className="text-[10px]">Ph: {storeConfig.phone}</p>
        {storeConfig.gstin && (
          <p className="text-[10px] font-bold">GSTIN: {storeConfig.gstin}</p>
        )}
      </div>

      {/* Bill Meta */}
      <div className="py-1.5 border-b border-dashed border-black text-[10px]">
        <div className="flex justify-between">
          <span>Bill No: {bill.id}</span>
          <span>
            {new Date(bill.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </span>
        </div>
        <div>Customer: {bill.customerName || "Cash Customer"}</div>
        {bill.customerPhone && <div>Mob: {bill.customerPhone}</div>}
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1 text-[10px]">
          <span className="w-1/2">Item</span>
          <span className="w-1/6 text-center">Qty</span>
          <span className="w-1/3 text-right">Amt (₹)</span>
        </div>

        {bill.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[11px] py-0.5">
            <span className="w-1/2 truncate">{item.name}</span>
            <span className="w-1/6 text-center">{item.qty}</span>
            <span className="w-1/3 text-right">₹{item.total}</span>
          </div>
        ))}
      </div>

      {/* Totals & Tax Summary */}
      <div className="py-2 space-y-1 text-right text-[11px] border-b border-dashed border-black">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{bill.subtotal || bill.grandTotal}</span>
        </div>

        {bill.discount > 0 && (
          <div className="flex justify-between text-[10px]">
            <span>Discount:</span>
            <span>- ₹{bill.discount}</span>
          </div>
        )}

        <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-black">
          <span>GRAND TOTAL:</span>
          <span>₹{bill.grandTotal}</span>
        </div>

        <div className="flex justify-between text-[9px] text-gray-700">
          <span>Payment: {bill.paymentMode?.toUpperCase()}</span>
          <span>Paid: ₹{bill.paidAmount || bill.grandTotal}</span>
        </div>

        {bill.dueAmount > 0 && (
          <div className="flex justify-between font-bold text-[10px]">
            <span>Udhar Dues Added:</span>
            <span>₹{bill.dueAmount}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[10px]">
        <p className="font-bold">*** THANK YOU! VISIT AGAIN ***</p>
        <p className="text-[9px]">Goods once sold cannot be returned.</p>
        <p className="text-[8px] mt-1 text-gray-500">Powered by DukaanPOS</p>
      </div>
    </div>
  );
};
