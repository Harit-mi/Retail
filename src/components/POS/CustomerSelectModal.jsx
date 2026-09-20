import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { X, UserPlus, Search, Check } from "lucide-react";

export const CustomerSelectModal = ({ isOpen, onClose }) => {
  const { customers, setCartCustomer, cartCustomer, addCustomer } = useStore();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Customer Form state
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustCity, setNewCustCity] = useState("Delhi");
  const [newCustCreditLimit, setNewCustCreditLimit] = useState(5000);
  const [dpdpConsent, setDpdpConsent] = useState(true);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const created = {
      name: newCustName,
      phone: newCustPhone,
      city: newCustCity,
      balance: 0,
      creditLimit: Number(newCustCreditLimit) || 5000,
    };
    addCustomer(created);
    setCartCustomer(created);
    setShowAddForm(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in motion-reduce:animate-none"
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 id="customer-modal-title" className="font-bold text-zinc-950 text-sm">
              Select Customer for Bill
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              Link account for loyalty points & Udhaar
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close customer selection modal"
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {!showAddForm ? (
            <>
              {/* Search & Add New Toggle */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden="true" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or mobile…"
                    aria-label="Search by name or mobile"
                    spellCheck={false}
                    className="w-full bg-white text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-lg border border-zinc-200 outline-none focus:border-zinc-900 min-h-[40px]"
                  />
                </div>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap min-h-[40px] cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {/* Customer List */}
              <div className="space-y-2">
                {/* Walk-in Option */}
                <button
                  type="button"
                  onClick={() => {
                    setCartCustomer(null);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between text-left min-h-[44px] ${
                    !cartCustomer
                      ? "bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900/10"
                      : "bg-white border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-900">
                      Walk-in Cash Customer
                    </h5>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      No ledger tracking required (Anonymous)
                    </p>
                  </div>
                  {!cartCustomer && <Check className="w-4 h-4 text-zinc-900" />}
                </button>

                {/* Saved Customers */}
                {filteredCustomers.map((cust) => {
                  const isSelected = cartCustomer?.id === cust.id;
                  return (
                    <button
                      type="button"
                      key={cust.id}
                      onClick={() => {
                        setCartCustomer(cust);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between text-left min-h-[44px] ${
                        isSelected
                          ? "bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900/10"
                          : "bg-white border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-zinc-900">
                            {cust.name}
                          </h5>
                          {cust.balance > 0 && (
                            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono font-medium border border-red-200">
                              Udhaar ₹{cust.balance}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {cust.phone} · {cust.city}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add Customer Form */
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider">
                New Customer Account
              </h4>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 min-h-[40px]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                    City / Area
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustCreditLimit}
                    onChange={(e) => setNewCustCreditLimit(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 min-h-[40px]"
                  />
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg space-y-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900"
                  />
                  <span className="text-[11px] text-zinc-600 leading-tight">
                    <strong className="text-zinc-900 font-semibold">DPDP Act 2023 Consent:</strong> Customer explicitly consents to saving contact info for billing, receipt generation & WhatsApp notifications.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!dpdpConsent}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  Save & Link Customer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
