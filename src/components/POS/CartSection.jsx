import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  UserCheck,
  UserPlus,
  Receipt,
  ArrowRight,
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

  const [discountType, setDiscountType] = useState("rs");

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 p-4 space-y-4 card-shadow">
      {/* Cart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-50 text-[#1FAA59] rounded-xl border border-emerald-100">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold font-display text-slate-900 text-base">
              Current Billing Cart
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {cart.length} {cart.length === 1 ? "item" : "items"} in bill
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Customer Account Selector Card */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono">
            {cartCustomer ? cartCustomer.name.charAt(0) : "C"}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 truncate font-display">
              {cartCustomer ? cartCustomer.name : "Walk-in Cash Customer"}
            </p>
            <p className="text-[11px] text-slate-500 truncate font-mono">
              {cartCustomer
                ? `Udhaar Bal: ₹${cartCustomer.balance} • ${cartCustomer.phone}`
                : "No customer account linked"}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCustomerModal}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A5F] hover:bg-[#152a45] text-white transition flex items-center space-x-1"
        >
          {cartCustomer ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>{cartCustomer ? "Change" : "Select Customer"}</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <Receipt className="w-10 h-10 mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700 font-display">
              Cart is Empty
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Tap items on left grid or scan barcode to add
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-2 card-shadow"
            >
              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-900 truncate font-display">
                  {item.name}
                </h5>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono mt-0.5">
                  <span className="text-[#1FAA59] font-bold">
                    ₹{item.price}
                  </span>
                  <span>•</span>
                  <span>GST {item.gst}%</span>
                  {item.hsn && <span>• HSN:{item.hsn}</span>}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => updateCartQty(item.id, item.qty - 1)}
                  className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateCartQty(item.id, Number(e.target.value))}
                  className="w-8 text-center text-xs font-mono font-bold bg-transparent text-slate-900 outline-none"
                />
                <button
                  onClick={() => updateCartQty(item.id, item.qty + 1)}
                  className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right min-w-[65px]">
                <div className="text-xs font-black font-mono text-slate-900">
                  ₹{item.total.toLocaleString("en-IN")}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-400 hover:text-red-600 transition text-[10px]"
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
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
          {/* Discount Section */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold">Bill Discount:</span>
            <div className="flex items-center space-x-1.5">
              <div className="flex bg-slate-200 border border-slate-300 rounded-lg p-0.5 font-bold">
                <button
                  onClick={() => {
                    setDiscountType("rs");
                    setDiscountPercent(0);
                  }}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    discountType === "rs"
                      ? "bg-[#1E3A5F] text-white"
                      : "text-slate-600"
                  }`}
                >
                  ₹
                </button>
                <button
                  onClick={() => {
                    setDiscountType("percent");
                    setDiscountRupees(0);
                  }}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    discountType === "percent"
                      ? "bg-[#1E3A5F] text-white"
                      : "text-slate-600"
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
                  className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right text-xs font-mono text-slate-900 outline-none focus:border-[#1E3A5F]"
                />
              ) : (
                <input
                  type="number"
                  placeholder="0"
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right text-xs font-mono text-slate-900 outline-none focus:border-[#1E3A5F]"
                />
              )}
            </div>
          </div>

          {/* GST Breakdown */}
          <div className="space-y-1 text-xs pt-2 border-t border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Items Total (Inc. Tax)</span>
              <span className="font-mono font-bold text-slate-900">₹{cartSubtotal}</span>
            </div>

            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-[#E64545] font-bold">
                <span>Discount Applied</span>
                <span className="font-mono">- ₹{calculatedDiscount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 text-[11px] font-mono">
              <span>Taxable Value: ₹{Math.round(cartTaxDetails.taxableAmount)}</span>
              <span>CGST+SGST: ₹{Math.round(cartTaxDetails.totalTax)}</span>
            </div>
          </div>

          {/* Grand Total & Prominent Marigold Accent Pay Button */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold font-display">
                Grand Total
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                ₹{cartGrandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            <button
              onClick={onOpenPaymentModal}
              className="flex items-center space-x-2 bg-[#F5A623] hover:bg-amber-500 text-slate-950 font-black font-display px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>COMPLETE SALE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
