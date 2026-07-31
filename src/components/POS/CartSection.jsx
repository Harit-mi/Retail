import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  UserCheck,
  UserPlus,
  Percent,
  IndianRupee,
  Receipt,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const CartSection = ({ onOpenPaymentModal, onOpenCustomerModal }) => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCustomer,
    discountPercent,
    setDiscountPercent,
    discountRupees,
    setDiscountRupees,
    cartSubtotal,
    cartTaxDetails,
    cartGrandTotal,
    calculatedDiscount,
  } = useStore();

  const [discountType, setDiscountType] = useState("rs"); // 'rs' or 'percent'

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
      {/* Cart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Current Cart</h3>
            <p className="text-xs text-slate-400">
              {cart.length} {cart.length === 1 ? "item" : "items"} selected
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Selected Customer Card (for Udhar or GST Billing) */}
      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {cartCustomer ? cartCustomer.name.charAt(0) : "C"}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">
              {cartCustomer ? cartCustomer.name : "Walk-in Cash Customer"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {cartCustomer
                ? `Udhar Bal: ₹${cartCustomer.balance} • ${cartCustomer.phone}`
                : "No customer linked"}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCustomerModal}
          className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center space-x-1"
        >
          {cartCustomer ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>{cartCustomer ? "Change" : "Select Customer"}</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <Receipt className="w-10 h-10 mb-2 text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-300">
              Cart is Empty
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-[180px]">
              Click on items or scan barcode to add to this bill
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition"
            >
              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-200 truncate">
                  {item.name}
                </h5>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="text-emerald-400 font-semibold">
                    ₹{item.price}
                  </span>
                  <span>•</span>
                  <span>GST {item.gst}%</span>
                  {item.hsn && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[10px]">HSN:{item.hsn}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => updateCartQty(item.id, item.qty - 1)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateCartQty(item.id, Number(e.target.value))}
                  className="w-8 text-center text-xs font-bold bg-transparent text-emerald-400 outline-none"
                />
                <button
                  onClick={() => updateCartQty(item.id, item.qty + 1)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Item Total & Delete */}
              <div className="text-right min-w-[60px]">
                <div className="text-xs font-extrabold text-slate-100">
                  ₹{item.total}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-500 hover:text-rose-400 transition text-[10px]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Discount Input */}
      {cart.length > 0 && (
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
          {/* Discount Section */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Extra Discount:</span>
            <div className="flex items-center space-x-1.5">
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => {
                    setDiscountType("rs");
                    setDiscountPercent(0);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    discountType === "rs"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ₹
                </button>
                <button
                  onClick={() => {
                    setDiscountType("percent");
                    setDiscountRupees(0);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    discountType === "percent"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  %
                </button>
              </div>

              {discountType === "rs" ? (
                <input
                  type="number"
                  placeholder="0"
                  value={discountRupees || ""}
                  onChange={(e) => setDiscountRupees(Number(e.target.value))}
                  className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-right text-xs text-white outline-none focus:border-emerald-500"
                />
              ) : (
                <input
                  type="number"
                  placeholder="0"
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-right text-xs text-white outline-none focus:border-emerald-500"
                />
              )}
            </div>
          </div>

          {/* Subtotal & Taxes breakdown */}
          <div className="space-y-1 text-xs pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-slate-400">
              <span>Items Total (Inc. GST)</span>
              <span>₹{cartSubtotal}</span>
            </div>

            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-rose-400 font-medium">
                <span>Discount Applied</span>
                <span>- ₹{calculatedDiscount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Taxable Value: ₹{Math.round(cartTaxDetails.taxableAmount)}</span>
              <span>GST Included: ₹{Math.round(cartTaxDetails.totalTax)}</span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Grand Total
              </span>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">
                ₹{cartGrandTotal}
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={onOpenPaymentModal}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/60 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>PAY BILL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
