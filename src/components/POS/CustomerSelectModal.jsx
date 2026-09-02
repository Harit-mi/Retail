import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header — same register-panel language as Payment modal */}
        <div className="px-5 py-4 bg-[#0F1F35] flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm">
            Select Customer for Bill
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!showAddForm ? (
            <>
              {/* Search & Add New Toggle */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or mobile…"
                    className="w-full bg-white text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-lg border-2 border-slate-300 outline-none focus:border-[#1E3A5F] min-h-[44px]"
                  />
                </div>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3.5 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap min-h-[44px]"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#F5A623]" />
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
                  className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-colors flex items-center justify-between text-left min-h-[44px] ${
                    !cartCustomer
                      ? "bg-slate-50 border-[#1E3A5F]"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Walk-in Cash Customer
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      No ledger tracking required
                    </p>
                  </div>
                  {!cartCustomer && <Check className="w-4 h-4 text-[#1E3A5F]" />}
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
                      className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-colors flex items-center justify-between text-left min-h-[44px] ${
                        isSelected
                          ? "bg-slate-50 border-[#1E3A5F]"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900">
                            {cust.name}
                          </h5>
                          {cust.balance > 0 && (
                            <span className="text-[10px] bg-red-50 text-[#E64545] px-1.5 py-0.5 rounded font-mono font-bold border border-red-200">
                              Udhar ₹{cust.balance}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {cust.phone} · {cust.city}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
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
              <h4 className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider">
                Add New Customer Account
              </h4>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F] min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">
                    City / Area
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-white border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustCreditLimit}
                    onChange={(e) => setNewCustCreditLimit(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-white border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A5F] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 min-h-[44px]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#F5A623] hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold min-h-[44px]"
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
