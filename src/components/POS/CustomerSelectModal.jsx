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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <span>Select Customer for Bill</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!showAddForm ? (
            <>
              {/* Search & Add New Toggle */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Customer Name or Mobile..."
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {/* Customer List */}
              <div className="space-y-2">
                {/* Walk-in Option */}
                <div
                  onClick={() => {
                    setCartCustomer(null);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    !cartCustomer
                      ? "bg-indigo-950/30 border-indigo-500/60"
                      : "bg-slate-950 border-slate-800 hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">
                      Walk-in Cash Customer
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      No ledger tracking required
                    </p>
                  </div>
                  {!cartCustomer && <Check className="w-4 h-4 text-indigo-400" />}
                </div>

                {/* Saved Customers */}
                {filteredCustomers.map((cust) => {
                  const isSelected = cartCustomer?.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => {
                        setCartCustomer(cust);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-500"
                          : "bg-slate-950 border-slate-800 hover:bg-slate-800/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="text-xs font-bold text-slate-100">
                            {cust.name}
                          </h5>
                          {cust.balance > 0 && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-semibold border border-rose-500/30">
                              Udhar: ₹{cust.balance}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {cust.phone} • {cust.city}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add Customer Form */
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Add New Customer Account
              </h4>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    City / Area
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustCreditLimit}
                    onChange={(e) => setNewCustCreditLimit(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
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
