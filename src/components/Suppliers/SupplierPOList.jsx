import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";

export const SupplierPOList = () => {
  const { suppliers, addSupplier, purchaseOrders } = useStore();

  const [activeSubTab, setActiveSubTab] = useState("suppliers"); // 'suppliers' or 'po'
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  // New Supplier State
  const [supName, setSupName] = useState("");
  const [supPerson, setSupPerson] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supGstin, setSupGstin] = useState("");
  const [supBalance, setSupBalance] = useState(0);

  const handleAddSupplierSubmit = (e) => {
    e.preventDefault();
    if (!supName || !supPhone) return;

    addSupplier({
      name: supName,
      contactPerson: supPerson,
      phone: supPhone,
      gstin: supGstin,
      pendingBalance: Number(supBalance) || 0,
      creditDays: 30,
    });

    setSupName("");
    setSupPerson("");
    setSupPhone("");
    setSupGstin("");
    setSupBalance(0);
    setShowAddSupplierModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-solid fa-truck-field text-[#1E3A5F]"></i>
            <span>Supplier & Purchase Order (PO) Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Distributor ledger, Goods Receipt Note (GRN) & automated stock refill
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add New Distributor</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("suppliers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === "suppliers"
              ? "bg-[#1E3A5F] text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <i className="fa-solid fa-building text-amber-400 mr-1.5"></i>
          Distributors Directory ({suppliers.length})
        </button>

        <button
          onClick={() => setActiveSubTab("po")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === "po"
              ? "bg-[#1E3A5F] text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <i className="fa-solid fa-boxes-packing text-teal-400 mr-1.5"></i>
          Purchase Orders & GRN ({purchaseOrders.length})
        </button>
      </div>

      {/* TAB 1: SUPPLIERS DIRECTORY */}
      {activeSubTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 card-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-display">
                    {sup.name}
                  </h4>
                  <p className="text-xs text-slate-500">{sup.contactPerson} • {sup.phone}</p>
                </div>
                <span className="text-[10px] bg-slate-100 font-mono font-bold text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {sup.creditDays} Days Credit
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">GSTIN:</span>
                  <span className="font-bold text-slate-700">{sup.gstin || "N/A"}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Payable Balance:</span>
                  <span className="font-black text-[#E64545]">₹{sup.pendingBalance.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS & GRN */}
      {activeSubTab === "po" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 card-shadow">
          <h3 className="font-extrabold text-slate-900 text-sm font-display">
            Incoming Goods Receipt Notes (GRN)
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Distributor</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">PO Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#1E3A5F]">
                      {po.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {po.date}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{po.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-[#1FAA59] border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold">
                        <i className="fa-solid fa-check mr-1"></i>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold font-display text-slate-900 text-base">
                Add Distributor / Supplier
              </h3>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Distributor Name *
                </label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Parle Consumer Goods"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Contact Person & Phone *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Person Name"
                    value={supPerson}
                    onChange={(e) => setSupPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+91 Phone"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Distributor GSTIN
                </label>
                <input
                  type="text"
                  placeholder="07AAAAA0000A1Z5"
                  value={supGstin}
                  onChange={(e) => setSupGstin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Opening Payable Balance (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={supBalance}
                  onChange={(e) => setSupBalance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-bold rounded-xl text-xs transition"
              >
                Save Supplier Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
